/**
 * Provider Health Monitoring Hook
 * React hook for monitoring AI provider health status
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ProviderHealthMonitor,
  ProviderHealthManager,
  type ProviderHealthStatus,
  type ProviderHealthMetrics,
  type AIProviderType,
} from '@/services/ai';
import { SimpleAIProvider } from '@/services/ai/simple-provider';

interface UseProviderHealthOptions {
  autoStart?: boolean;
  checkInterval?: number;
  enableFailover?: boolean;
}

/**
 * Hook for monitoring a single provider's health
 */
export function useProviderHealth(
  provider: SimpleAIProvider,
  options: UseProviderHealthOptions = {}
) {
  const { autoStart = true, checkInterval } = options;
  const [healthStatus, setHealthStatus] = useState<ProviderHealthStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitorRef = useRef<ProviderHealthMonitor | null>(null);

  // Initialize monitor
  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new ProviderHealthMonitor(provider, {
        healthCheckInterval: checkInterval,
      });
    }

    return () => {
      if (monitorRef.current) {
        monitorRef.current.stopMonitoring();
      }
    };
  }, [provider, checkInterval]);

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart && monitorRef.current && !isMonitoring) {
      monitorRef.current.startMonitoring();
      setIsMonitoring(true);
    }
  }, [autoStart, isMonitoring]);

  // Manual health check
  const checkHealth = useCallback(async () => {
    if (monitorRef.current) {
      const status = await monitorRef.current.checkHealth();
      setHealthStatus(status);
      return status;
    }
    return null;
  }, []);

  // Get current health status
  const getHealthStatus = useCallback(() => {
    return monitorRef.current?.getHealthStatus() || null;
  }, []);

  // Get health metrics
  const getHealthMetrics = useCallback((): ProviderHealthMetrics | null => {
    return monitorRef.current?.getHealthMetrics() || null;
  }, []);

  // Reset health status
  const resetHealth = useCallback(() => {
    if (monitorRef.current) {
      monitorRef.current.resetHealth();
      setHealthStatus(monitorRef.current.getHealthStatus());
    }
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (monitorRef.current) {
      monitorRef.current.startMonitoring();
      setIsMonitoring(true);
    }
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (monitorRef.current) {
      monitorRef.current.stopMonitoring();
      setIsMonitoring(false);
    }
  }, []);

  return {
    healthStatus: healthStatus || getHealthStatus(),
    isMonitoring,
    checkHealth,
    getHealthStatus,
    getHealthMetrics,
    resetHealth,
    startMonitoring,
    stopMonitoring,
  };
}

/**
 * Hook for monitoring multiple providers' health
 */
export function useProviderHealthManager(
  providers: SimpleAIProvider[],
  options: UseProviderHealthOptions = {}
) {
  const { enableFailover = true } = options;
  const [healthStatuses, setHealthStatuses] = useState<Map<AIProviderType, ProviderHealthStatus>>(
    new Map()
  );
  const [healthiestProvider, setHealthiestProvider] = useState<AIProviderType | null>(null);
  const managerRef = useRef<ProviderHealthManager | null>(null);

  // Initialize manager
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new ProviderHealthManager(enableFailover);
    }

    // Add providers to manager
    providers.forEach((provider) => {
      managerRef.current!.addProvider(provider);
    });

    return () => {
      if (managerRef.current) {
        managerRef.current.stopAllMonitoring();
      }
    };
  }, [providers, enableFailover]);

  // Update health statuses periodically
  useEffect(() => {
    const updateStatuses = () => {
      if (managerRef.current) {
        const statuses = managerRef.current.getAllProviderHealth();
        setHealthStatuses(statuses);
        setHealthiestProvider(managerRef.current.getHealthiestProvider());
      }
    };

    // Initial update
    updateStatuses();

    // Set up periodic updates
    const interval = setInterval(updateStatuses, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Get health status for specific provider
  const getProviderHealth = useCallback((providerType: AIProviderType) => {
    return managerRef.current?.getProviderHealth(providerType) || null;
  }, []);

  // Get health metrics for specific provider
  const getProviderMetrics = useCallback((providerType: AIProviderType) => {
    return managerRef.current?.getProviderMetrics(providerType) || null;
  }, []);

  // Set failover order
  const setFailoverOrder = useCallback((order: AIProviderType[]) => {
    if (managerRef.current) {
      managerRef.current.setFailoverOrder(order);
    }
  }, []);

  // Enable/disable failover
  const setFailoverEnabled = useCallback((enabled: boolean) => {
    if (managerRef.current) {
      managerRef.current.setFailoverEnabled(enabled);
      setHealthiestProvider(managerRef.current.getHealthiestProvider());
    }
  }, []);

  return {
    healthStatuses,
    healthiestProvider,
    getProviderHealth,
    getProviderMetrics,
    setFailoverOrder,
    setFailoverEnabled,
  };
}

/**
 * Hook for automatic provider failover
 */
export function useProviderFailover(
  providers: SimpleAIProvider[],
  options: UseProviderHealthOptions = {}
) {
  const { healthStatuses, healthiestProvider, setFailoverOrder } = useProviderHealthManager(
    providers,
    { ...options, enableFailover: true }
  );

  const [currentProvider, setCurrentProvider] = useState<SimpleAIProvider | null>(null);

  // Update current provider when healthiest changes
  useEffect(() => {
    if (healthiestProvider) {
      const provider = providers.find((p) => p.getProviderType() === healthiestProvider);
      if (provider) {
        setCurrentProvider(provider);
      }
    } else if (providers.length > 0) {
      // Fallback to first available provider
      setCurrentProvider(providers[0]);
    }
  }, [healthiestProvider, providers]);

  // Set default failover order
  useEffect(() => {
    const defaultOrder: AIProviderType[] = ['google', 'openai', 'anthropic', 'cohere'];
    setFailoverOrder(defaultOrder);
  }, [setFailoverOrder]);

  return {
    currentProvider,
    healthStatuses,
    healthiestProvider,
    isFailoverActive: healthiestProvider !== null,
  };
}
