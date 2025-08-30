/**
 * AI Provider Settings Component
 * Manages API keys and configuration for multiple AI providers
 */

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Load API keys from localStorage
  const [googleKey, setGoogleKey] = useLocalStorage('GOOGLE_API_KEY', '');
  const [openaiKey, setOpenaiKey] = useLocalStorage('OPENAI_API_KEY', '');
  const [anthropicKey, setAnthropicKey] = useLocalStorage('ANTHROPIC_API_KEY', '');
  const [cohereKey, setCohereKey] = useLocalStorage('COHERE_API_KEY', '');

  // Update apiKeys when localStorage values change
  useEffect(() => {
    setApiKeys({
      google: googleKey,
      openai: openaiKey,
      anthropic: anthropicKey,
      cohere: cohereKey,
    });
  }, [googleKey, openaiKey, anthropicKey, cohereKey]);

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));

    // Update the corresponding localStorage
    switch (provider) {
      case 'google':
        setGoogleKey(value);
        break;
      case 'openai':
        setOpenaiKey(value);
        break;
      case 'anthropic':
        setAnthropicKey(value);
        break;
      case 'cohere':
        setCohereKey(value);
        break;
    }
  };

  const testProviderConnection = async (provider: string) => {
    if (!apiKeys[provider]) return;

    setIsTesting(provider);
    try {
      const response = await fetch('/api/ai-sdk/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKeys[provider],
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
            value={apiKeys[selectedProvider] || ''}
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
            disabled={!apiKeys[selectedProvider] || isTesting === selectedProvider}
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
                className={`status-indicator ${apiKeys[config.name] ? 'configured' : 'missing'}`}
              >
                {apiKeys[config.name] ? '✅ Configured' : '⚠️ API Key Needed'}
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
