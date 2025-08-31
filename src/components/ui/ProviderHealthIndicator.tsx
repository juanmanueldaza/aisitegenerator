/**
 * Provider Health Indicator Component
 * Displays the health status of AI providers with visual indicators
 */

import React from 'react';
import type { ProviderHealthStatus, ProviderHealthState } from '@/services/ai';

interface ProviderHealthIndicatorProps {
  providerName: string;
  healthStatus: ProviderHealthStatus;
  showDetails?: boolean;
  className?: string;
}

/**
 * Get color and icon for health state
 */
function getHealthDisplay(state: ProviderHealthState): {
  color: string;
  icon: string;
  label: string;
} {
  switch (state) {
    case 'healthy':
      return {
        color: 'text-green-500',
        icon: '🟢',
        label: 'Healthy',
      };
    case 'degraded':
      return {
        color: 'text-yellow-500',
        icon: '🟡',
        label: 'Degraded',
      };
    case 'unhealthy':
      return {
        color: 'text-red-500',
        icon: '🔴',
        label: 'Unhealthy',
      };
    case 'unknown':
    default:
      return {
        color: 'text-gray-500',
        icon: '⚪',
        label: 'Unknown',
      };
  }
}

/**
 * Format time duration for display
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else {
    return `${diffHours}h ago`;
  }
}

/**
 * Format response time for display
 */
function formatResponseTime(ms?: number): string {
  if (!ms) return 'N/A';
  if (ms < 1000) {
    return `${ms}ms`;
  } else {
    return `${(ms / 1000).toFixed(1)}s`;
  }
}

export const ProviderHealthIndicator: React.FC<ProviderHealthIndicatorProps> = ({
  providerName,
  healthStatus,
  showDetails = false,
  className = '',
}) => {
  const { color, icon, label } = getHealthDisplay(healthStatus.state);

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg bg-base-200 ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{providerName}</span>
            <span className={`text-xs font-medium ${color}`}>{label}</span>
          </div>

          {showDetails && (
            <div className="text-xs text-base-content/70 mt-1 space-y-1">
              <div>Last checked: {formatTimeAgo(healthStatus.lastChecked)}</div>
              {healthStatus.responseTime && (
                <div>Response time: {formatResponseTime(healthStatus.responseTime)}</div>
              )}
              {healthStatus.consecutiveFailures > 0 && (
                <div className="text-red-500">
                  Consecutive failures: {healthStatus.consecutiveFailures}
                </div>
              )}
              {healthStatus.errorMessage && (
                <div className="text-red-500 truncate max-w-48" title={healthStatus.errorMessage}>
                  Error: {healthStatus.errorMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Provider Health Dashboard Component
 * Displays health status for multiple providers
 */

interface ProviderHealthDashboardProps {
  providerHealthStatuses: Map<string, ProviderHealthStatus>;
  className?: string;
}

export const ProviderHealthDashboard: React.FC<ProviderHealthDashboardProps> = ({
  providerHealthStatuses,
  className = '',
}) => {
  const providers = Array.from(providerHealthStatuses.entries());

  if (providers.length === 0) {
    return (
      <div className={`p-4 rounded-lg bg-base-200 ${className}`}>
        <p className="text-base-content/70">No providers configured</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-lg font-semibold mb-3">Provider Health Status</h3>
      {providers.map(([providerName, healthStatus]) => (
        <ProviderHealthIndicator
          key={providerName}
          providerName={providerName}
          healthStatus={healthStatus}
          showDetails={true}
        />
      ))}
    </div>
  );
};

/**
 * Provider Health Badge Component
 * Compact health indicator for use in other components
 */

interface ProviderHealthBadgeProps {
  healthStatus: ProviderHealthStatus;
  className?: string;
}

export const ProviderHealthBadge: React.FC<ProviderHealthBadgeProps> = ({
  healthStatus,
  className = '',
}) => {
  const { color, icon, label } = getHealthDisplay(healthStatus.state);

  return (
    <div
      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-base-200 ${className}`}
    >
      <span className="text-sm">{icon}</span>
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  );
};
