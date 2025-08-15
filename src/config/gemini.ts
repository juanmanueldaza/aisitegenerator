import { GeminiConfig } from '../types/gemini';

/**
 * Validates that the API key is present and appears to be valid
 */
function validateApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.trim() === '') {
    return false;
  }
  
  // Basic validation - Gemini API keys typically start with 'AI'
  if (!apiKey.startsWith('AI')) {
    console.warn('API key format may be invalid. Gemini API keys typically start with "AI"');
  }
  
  return true;
}

/**
 * Sanitizes and validates environment variables
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue || '';
  return value.trim();
}

/**
 * Parses integer environment variables with validation
 */
function getEnvInt(key: string, defaultValue: number): number {
  const value = getEnvVar(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Gets the Gemini configuration from environment variables
 * Throws an error if required configuration is missing
 */
export function getGeminiConfig(): GeminiConfig {
  const apiKey = getEnvVar('VITE_GEMINI_API_KEY');
  
  if (!validateApiKey(apiKey)) {
    throw new Error(
      'Gemini API key is required. Please set VITE_GEMINI_API_KEY in your .env file. ' +
      'Get your API key from: https://makersuite.google.com/app/apikey'
    );
  }

  const environment = getEnvVar('VITE_APP_ENV', 'development') as 'development' | 'production';
  
  const config: GeminiConfig = {
    apiKey,
    model: getEnvVar('VITE_GEMINI_MODEL', 'gemini-1.5-flash'),
    maxRequestsPerMinute: getEnvInt('VITE_GEMINI_MAX_REQUESTS_PER_MINUTE', 60),
    maxTokensPerRequest: getEnvInt('VITE_GEMINI_MAX_TOKENS_PER_REQUEST', 4096),
    environment,
  };

  // Log configuration in development (without sensitive data)
  if (environment === 'development') {
    console.log('Gemini API Configuration:', {
      model: config.model,
      maxRequestsPerMinute: config.maxRequestsPerMinute,
      maxTokensPerRequest: config.maxTokensPerRequest,
      environment: config.environment,
      apiKeyPresent: !!config.apiKey,
    });
  }

  return config;
}

/**
 * Checks if the Gemini API is properly configured
 */
export function isGeminiConfigured(): boolean {
  try {
    getGeminiConfig();
    return true;
  } catch {
    return false;
  }
}