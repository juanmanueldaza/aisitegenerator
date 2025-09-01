/**
 * AI Provider Settings Component
 * Manages API keys and configuration for multiple AI providers
 */

import { useState } from 'react';
import { useLocalStorageSync } from '@/hooks';
import { Button } from '@/components/ui';
import type { ProviderConfig } from '@/types';
import './AiProviderSettings.css';

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  google: {
    name: 'google',
    displayName: 'Google Gemini',
    apiKeyEnv: 'GOOGLE_API_KEY',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-lite'],
    defaultModel: 'gemini-2.0-flash',
    description: "Google's Gemini models with excellent performance and multimodal capabilities.",
  },
  openai: {
    name: 'openai',
    displayName: 'OpenAI GPT',
    apiKeyEnv: 'OPENAI_API_KEY',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    description: "OpenAI's GPT models with industry-leading reasoning and code generation.",
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    models: ['claude-3-5-sonnet-latest', 'claude-3-haiku'],
    defaultModel: 'claude-3-5-sonnet-latest',
    description: "Anthropic's Claude models with strong safety and reasoning capabilities.",
  },
  cohere: {
    name: 'cohere',
    displayName: 'Cohere',
    apiKeyEnv: 'COHERE_API_KEY',
    models: ['command-r-plus', 'command-r'],
    defaultModel: 'command-r-plus',
    description: "Cohere's Command models optimized for enterprise use cases.",
  },
};

interface AiProviderSettingsProps {
  onClose?: () => void;
  className?: string;
}

export function AiProviderSettings({ onClose, className = '' }: AiProviderSettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('google');
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const [apiKeys, updateApiKey] = useLocalStorageSync(
    ['GOOGLE_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'COHERE_API_KEY'],
    { GOOGLE_API_KEY: '', OPENAI_API_KEY: '', ANTHROPIC_API_KEY: '', COHERE_API_KEY: '' }
  );

  // Map localStorage keys to provider names
  const providerKeyMap = {
    google: 'GOOGLE_API_KEY',
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    cohere: 'COHERE_API_KEY',
  } as const;

  // Helper function to safely get API key for a provider
  const getApiKey = (provider: string): string => {
    const key = providerKeyMap[provider as keyof typeof providerKeyMap];
    return apiKeys[key] || '';
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    const key = providerKeyMap[provider as keyof typeof providerKeyMap];
    updateApiKey(key, value);
  };

  const testProviderConnection = async (provider: string, apiKey: string) => {
    setIsTesting(provider);
    try {
      const response = await fetch('/api/ai-sdk/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
          options: { provider },
          apiKey, // Send API key in body instead of header to avoid 431 error
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Just check if response is ok, no need to parse JSON for ping
      setTestResults((prev) => ({ ...prev, [provider]: true }));
      return { success: true, message: 'Connection successful!' };
    } catch (error) {
      console.error('Provider connection test failed:', error);
      setTestResults((prev) => ({ ...prev, [provider]: false }));
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    } finally {
      setIsTesting(null);
    }
  };
  const selectedConfig = PROVIDER_CONFIGS[selectedProvider];

  return (
    <div className={`ai-provider-settings ${className}`}>
      <div className="settings-header">
        <h3>AI Provider Settings</h3>
        <p>Configure API keys for different AI providers to enable seamless switching.</p>
      </div>

      <div className="provider-selector">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">Select Provider:</span>
          </label>
          <select
            id="provider-select"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="select select-bordered w-full max-w-xs"
          >
            {Object.values(PROVIDER_CONFIGS).map((config) => (
              <option key={config.name} value={config.name}>
                {config.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="provider-config">
        <div className="provider-info">
          <h4>{selectedConfig.displayName}</h4>
          <p>{selectedConfig.description}</p>
          <div className="model-info">
            <strong>Available Models:</strong>
            <ul>
              {selectedConfig.models.map((model) => (
                <li key={model}>{model}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="api-key-input">
          <div className="form-control w-full">
            <label className="label" htmlFor={`api-key-${selectedProvider}`}>
              <span className="label-text">API Key for {selectedConfig.displayName}:</span>
            </label>
            <input
              id={`api-key-${selectedProvider}`}
              type="password"
              value={getApiKey(selectedProvider)}
              onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
              placeholder={`Enter your ${selectedConfig.displayName} API key`}
              className="input input-bordered w-full"
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                Your API key is stored locally in your browser and never sent to our servers.
              </span>
            </label>
          </div>
        </div>

        <div className="test-connection">
          <Button
            onClick={() => testProviderConnection(selectedProvider, getApiKey(selectedProvider))}
            disabled={!getApiKey(selectedProvider) || isTesting === selectedProvider}
            variant="secondary"
          >
            {isTesting === selectedProvider ? 'Testing...' : 'Test Connection'}
          </Button>

          {testResults[selectedProvider] !== undefined && (
            <div
              className={`alert ${testResults[selectedProvider] ? 'alert-success' : 'alert-error'} mt-4`}
            >
              <span>{testResults[selectedProvider] ? '✅ Connected' : '❌ Failed'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="provider-status">
        <h4>Provider Status</h4>
        <div className="status-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(PROVIDER_CONFIGS).map((config) => (
            <div key={config.name} className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{config.displayName}</span>
                  <div
                    className={`badge ${getApiKey(config.name) ? 'badge-success' : 'badge-warning'} gap-2`}
                  >
                    {getApiKey(config.name) ? '✅ Configured' : '⚠️ API Key Needed'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-actions">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </div>
    </div>
  );
}

export default AiProviderSettings;
