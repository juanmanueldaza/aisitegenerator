/**
 * Provider Health Monitoring Service
 * Implements comprehensive health monitoring for AI providers
 */

import type { AIMessage } from '@/types/ai';
import type {
  IProviderHealth,
  ProviderHealthStatus,
  ProviderHealthState,
  ProviderHealthMetrics,
} from '@/services/interfaces';
import { SimpleAIProvider, type AIProviderType } from './simple-provider';

/**
 * Health monitoring configuration
 */
interface HealthCheckConfig {
  timeout: number;
  maxConsecutiveFailures: number;
  healthCheckInterval: number;
  maxHistorySize: number;
  testPrompt: string;
}

/**
 * Default health check configuration
 */
const DEFAULT_HEALTH_CONFIG: HealthCheckConfig = {
  timeout: 10000, // 10 seconds
  maxConsecutiveFailures: 3,
  healthCheckInterval: 30000, // 30 seconds
  maxHistorySize: 100,
  testPrompt: 'Hello, please respond with "OK" if you can read this message.',
};

/**
 * Provider Health Monitor
 * Monitors the health of AI providers with automatic health checks
 */
export class ProviderHealthMonitor implements IProviderHealth {
  private provider: SimpleAIProvider;
  private config: HealthCheckConfig;
  private healthStatus: ProviderHealthStatus;
  private healthHistory: ProviderHealthStatus[] = [];
  private healthCheckTimer?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor(provider: SimpleAIProvider, config: Partial<HealthCheckConfig> = {}) {
    this.provider = provider;
    this.config = { ...DEFAULT_HEALTH_CONFIG, ...config };

    // Initialize health status
    this.healthStatus = {
      state: 'unknown',
      lastChecked: new Date(),
      consecutiveFailures: 0,
      isAvailable: provider.isAvailable(),
    };
  }

  /**
   * Start automatic health monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.scheduleHealthCheck();
  }

  /**
   * Stop automatic health monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.healthCheckTimer) {
      clearTimeout(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Perform a health check on the provider
   */
  async checkHealth(): Promise<ProviderHealthStatus> {
    const startTime = Date.now();
    const checkTime = new Date();

    try {
      // Skip health check if provider is not available
      if (!this.provider.isAvailable()) {
        this.updateHealthStatus({
          state: 'unhealthy',
          lastChecked: checkTime,
          errorMessage: 'Provider not available: API key not configured',
          consecutiveFailures: this.healthStatus.consecutiveFailures + 1,
          isAvailable: false,
        });
        return this.healthStatus;
      }

      // Perform a simple health check by sending a test message
      const testMessages: AIMessage[] = [
        {
          role: 'user',
          content: this.config.testPrompt,
        },
      ];

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), this.config.timeout)
      );

      const healthCheckPromise = this.provider.generate(testMessages, {
        temperature: 0.1, // Low temperature for consistent responses
      });

      const result = await Promise.race([healthCheckPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;

      // Check if response is valid
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('Empty response from provider');
      }

      // Update health status as healthy
      this.updateHealthStatus({
        state: 'healthy',
        lastChecked: checkTime,
        responseTime,
        consecutiveFailures: 0,
        isAvailable: true,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Increment consecutive failures
      const consecutiveFailures = this.healthStatus.consecutiveFailures + 1;

      // Determine health state based on consecutive failures
      let state: ProviderHealthState;
      if (consecutiveFailures >= this.config.maxConsecutiveFailures) {
        state = 'unhealthy';
      } else if (consecutiveFailures > 0) {
        state = 'degraded';
      } else {
        state = 'healthy';
      }

      this.updateHealthStatus({
        state,
        lastChecked: checkTime,
        responseTime,
        errorMessage,
        consecutiveFailures,
        isAvailable: this.provider.isAvailable(),
      });
    }

    return this.healthStatus;
  }

  /**
   * Get the current health status
   */
  getHealthStatus(): ProviderHealthStatus {
    return { ...this.healthStatus };
  }

  /**
   * Get health metrics and history
   */
  getHealthMetrics(): ProviderHealthMetrics {
    const totalChecks = this.healthHistory.length;
    const successfulChecks = this.healthHistory.filter((h) => h.state === 'healthy').length;
    const failedChecks = totalChecks - successfulChecks;

    const responseTimes = this.healthHistory
      .filter((h) => h.responseTime !== undefined)
      .map((h) => h.responseTime!);

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    const uptimePercentage = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;

    const lastFailure = this.healthHistory
      .filter((h) => h.state === 'unhealthy' || h.state === 'degraded')
      .sort((a, b) => b.lastChecked.getTime() - a.lastChecked.getTime())[0];

    return {
      totalChecks,
      successfulChecks,
      failedChecks,
      averageResponseTime,
      uptimePercentage,
      lastFailureTime: lastFailure?.lastChecked,
      healthHistory: [...this.healthHistory],
    };
  }

  /**
   * Reset health status (useful for recovery)
   */
  resetHealth(): void {
    this.healthStatus.consecutiveFailures = 0;
    this.healthStatus.state = 'unknown';
    this.healthStatus.errorMessage = undefined;
  }

  /**
   * Update health status and maintain history
   */
  private updateHealthStatus(status: Partial<ProviderHealthStatus>): void {
    this.healthStatus = { ...this.healthStatus, ...status };

    // Add to history
    this.healthHistory.push({ ...this.healthStatus });

    // Maintain history size limit
    if (this.healthHistory.length > this.config.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.config.maxHistorySize);
    }

    // Schedule next health check if monitoring is active
    if (this.isMonitoring) {
      this.scheduleHealthCheck();
    }
  }

  /**
   * Schedule the next health check
   */
  private scheduleHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearTimeout(this.healthCheckTimer);
    }

    this.healthCheckTimer = setTimeout(async () => {
      if (this.isMonitoring) {
        await this.checkHealth();
      }
    }, this.config.healthCheckInterval);
  }
}

/**
 * Provider Health Manager
 * Manages health monitoring for multiple providers
 */
export class ProviderHealthManager {
  private monitors = new Map<AIProviderType, ProviderHealthMonitor>();
  private failoverEnabled = true;
  private failoverOrder: AIProviderType[] = ['google', 'openai', 'anthropic', 'cohere'];

  constructor(failoverEnabled = true) {
    this.failoverEnabled = failoverEnabled;
  }

  /**
   * Add a provider to health monitoring
   */
  addProvider(provider: SimpleAIProvider): void {
    const providerType = provider.getProviderType() as AIProviderType;
    if (!this.monitors.has(providerType)) {
      const monitor = new ProviderHealthMonitor(provider);
      this.monitors.set(providerType, monitor);
      monitor.startMonitoring();
    }
  }

  /**
   * Remove a provider from health monitoring
   */
  removeProvider(providerType: AIProviderType): void {
    const monitor = this.monitors.get(providerType);
    if (monitor) {
      monitor.stopMonitoring();
      this.monitors.delete(providerType);
    }
  }

  /**
   * Get health status for a specific provider
   */
  getProviderHealth(providerType: AIProviderType): ProviderHealthStatus | null {
    const monitor = this.monitors.get(providerType);
    return monitor ? monitor.getHealthStatus() : null;
  }

  /**
   * Get health metrics for a specific provider
   */
  getProviderMetrics(providerType: AIProviderType): ProviderHealthMetrics | null {
    const monitor = this.monitors.get(providerType);
    return monitor ? monitor.getHealthMetrics() : null;
  }

  /**
   * Get all provider health statuses
   */
  getAllProviderHealth(): Map<AIProviderType, ProviderHealthStatus> {
    const healthStatuses = new Map<AIProviderType, ProviderHealthStatus>();
    for (const [providerType, monitor] of this.monitors) {
      healthStatuses.set(providerType, monitor.getHealthStatus());
    }
    return healthStatuses;
  }

  /**
   * Get the healthiest available provider (for failover)
   */
  getHealthiestProvider(): AIProviderType | null {
    if (!this.failoverEnabled) return null;

    // Sort providers by failover order preference, then by health score
    const sortedProviders = Array.from(this.monitors.entries())
      .filter(([, monitor]) => {
        const status = monitor.getHealthStatus();
        return status.isAvailable && status.state !== 'unhealthy';
      })
      .map(([providerType, monitor]) => {
        const status = monitor.getHealthStatus();

        // Calculate health score (higher is better)
        let score = 0;
        switch (status.state) {
          case 'healthy':
            score = 100;
            break;
          case 'degraded':
            score = 50;
            break;
          case 'unknown':
            score = 25;
            break;
        }

        // Factor in response time (faster is better)
        if (status.responseTime) {
          score += Math.max(0, 20 - status.responseTime / 100); // Bonus for faster responses
        }

        // Factor in consecutive failures (fewer is better)
        score -= status.consecutiveFailures * 10;

        // Factor in failover order preference
        const orderIndex = this.failoverOrder.indexOf(providerType);
        const orderBonus = orderIndex >= 0 ? (this.failoverOrder.length - orderIndex) * 5 : 0;
        score += orderBonus;

        return { providerType, score, status };
      })
      .sort((a, b) => b.score - a.score);

    return sortedProviders.length > 0 ? sortedProviders[0].providerType : null;
  }

  /**
   * Set failover order preference
   */
  setFailoverOrder(order: AIProviderType[]): void {
    this.failoverOrder = order;
  }

  /**
   * Enable or disable automatic failover
   */
  setFailoverEnabled(enabled: boolean): void {
    this.failoverEnabled = enabled;
  }

  /**
   * Stop all health monitoring
   */
  stopAllMonitoring(): void {
    for (const monitor of this.monitors.values()) {
      monitor.stopMonitoring();
    }
  }
}

// Export types for external use
export type { ProviderHealthStatus, ProviderHealthState, ProviderHealthMetrics };
