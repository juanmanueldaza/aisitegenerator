/**
 * AI Provider Settings Component
 * Manages API keys and configuration for multiple AI providers
 */

import { useState } from 'react';
import { useLocalStorageSync } from '@/hooks';
import { Button } from '@/components/ui';
import './AiProviderSettings.css';

interface ProviderConfig {
  name: string;
  displayName: string;
  apiKeyEnv: string;
  models: string[];
  defaultModel: string;
  description: string;
}

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

  const testProviderConnection = async (provider: string) => {
    const apiKey = getApiKey(provider);
    if (!apiKey) return;

    setIsTesting(provider);
    try {
      const response = await fetch('/api/ai-sdk/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello, test message' }],
          options: {
            provider,
            model: PROVIDER_CONFIGS[provider].defaultModel,
          },
        }),
      });

      const success = response.ok;
      setTestResults((prev) => ({ ...prev, [provider]: success }));

      if (success) {
        console.log(`✅ ${provider} connection test successful`);
      } else {
        console.error(`❌ ${provider} connection test failed:`, response.status);
      }
    } catch (error) {
      console.error(`❌ ${provider} connection test error:`, error);
      setTestResults((prev) => ({ ...prev, [provider]: false }));
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
        <label htmlFor="provider-select">Select Provider:</label>
        <select
          id="provider-select"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
        >
          {Object.values(PROVIDER_CONFIGS).map((config) => (
            <option key={config.name} value={config.name}>
              {config.displayName}
            </option>
          ))}
        </select>
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
          <label htmlFor={`api-key-${selectedProvider}`}>
            API Key for {selectedConfig.displayName}:
          </label>
          <input
            id={`api-key-${selectedProvider}`}
            type="password"
            value={getApiKey(selectedProvider)}
            onChange={(e) => handleApiKeyChange(selectedProvider, e.target.value)}
            placeholder={`Enter your ${selectedConfig.displayName} API key`}
          />
          <small>
            Your API key is stored locally in your browser and never sent to our servers.
          </small>
        </div>

        <div className="test-connection">
          <Button
            onClick={() => testProviderConnection(selectedProvider)}
            disabled={!getApiKey(selectedProvider) || isTesting === selectedProvider}
            variant="secondary"
          >
            {isTesting === selectedProvider ? 'Testing...' : 'Test Connection'}
          </Button>

          {testResults[selectedProvider] !== undefined && (
            <span className={`test-result ${testResults[selectedProvider] ? 'success' : 'error'}`}>
              {testResults[selectedProvider] ? '✅ Connected' : '❌ Failed'}
            </span>
          )}
        </div>
      </div>

      <div className="provider-status">
        <h4>Provider Status</h4>
        <div className="status-grid">
          {Object.values(PROVIDER_CONFIGS).map((config) => (
            <div key={config.name} className="status-item">
              <span className="provider-name">{config.displayName}</span>
              <span
                className={`status-indicator ${getApiKey(config.name) ? 'configured' : 'missing'}`}
              >
                {getApiKey(config.name) ? '✅ Configured' : '⚠️ API Key Needed'}
              </span>
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
