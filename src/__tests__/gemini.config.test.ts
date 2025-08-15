import { describe, it, expect, beforeEach } from 'vitest';
import { getGeminiConfig, isGeminiConfigured } from '../config/gemini';

// Mock environment variables
const mockEnv = {
  VITE_GEMINI_API_KEY: '',
  VITE_APP_ENV: 'development',
  VITE_GEMINI_MODEL: 'gemini-1.5-flash',
  VITE_GEMINI_MAX_REQUESTS_PER_MINUTE: '60',
  VITE_GEMINI_MAX_TOKENS_PER_REQUEST: '4096',
};

// Mock import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: mockEnv,
    },
  },
  writable: true,
});

describe('Gemini Configuration', () => {
  beforeEach(() => {
    // Reset mocked environment
    Object.assign(mockEnv, {
      VITE_GEMINI_API_KEY: '',
      VITE_APP_ENV: 'development',
      VITE_GEMINI_MODEL: 'gemini-1.5-flash',
      VITE_GEMINI_MAX_REQUESTS_PER_MINUTE: '60',
      VITE_GEMINI_MAX_TOKENS_PER_REQUEST: '4096',
    });
  });

  describe('isGeminiConfigured', () => {
    it('should return false when API key is not set', () => {
      mockEnv.VITE_GEMINI_API_KEY = '';
      expect(isGeminiConfigured()).toBe(false);
    });

    it('should return true when API key is set', () => {
      mockEnv.VITE_GEMINI_API_KEY = 'AIzaSyDummyTestKey12345';
      expect(isGeminiConfigured()).toBe(true);
    });

    it('should return false when API key is just whitespace', () => {
      mockEnv.VITE_GEMINI_API_KEY = '   ';
      expect(isGeminiConfigured()).toBe(false);
    });
  });

  describe('getGeminiConfig', () => {
    it('should throw error when API key is missing', () => {
      mockEnv.VITE_GEMINI_API_KEY = '';
      expect(() => getGeminiConfig()).toThrow(/API key is required/);
    });

    it('should return valid config when API key is provided', () => {
      mockEnv.VITE_GEMINI_API_KEY = 'AIzaSyDummyTestKey12345';
      
      const config = getGeminiConfig();
      
      expect(config).toEqual({
        apiKey: 'AIzaSyDummyTestKey12345',
        model: 'gemini-1.5-flash',
        maxRequestsPerMinute: 60,
        maxTokensPerRequest: 4096,
        environment: 'development',
      });
    });

    it('should use default values for missing optional config', () => {
      mockEnv.VITE_GEMINI_API_KEY = 'AIzaSyDummyTestKey12345';
      delete mockEnv.VITE_GEMINI_MODEL;
      delete mockEnv.VITE_GEMINI_MAX_REQUESTS_PER_MINUTE;
      
      const config = getGeminiConfig();
      
      expect(config.model).toBe('gemini-1.5-flash');
      expect(config.maxRequestsPerMinute).toBe(60);
    });

    it('should parse integer environment variables correctly', () => {
      mockEnv.VITE_GEMINI_API_KEY = 'AIzaSyDummyTestKey12345';
      mockEnv.VITE_GEMINI_MAX_REQUESTS_PER_MINUTE = '120';
      mockEnv.VITE_GEMINI_MAX_TOKENS_PER_REQUEST = '8192';
      
      const config = getGeminiConfig();
      
      expect(config.maxRequestsPerMinute).toBe(120);
      expect(config.maxTokensPerRequest).toBe(8192);
    });

    it('should handle invalid integer values gracefully', () => {
      mockEnv.VITE_GEMINI_API_KEY = 'AIzaSyDummyTestKey12345';
      mockEnv.VITE_GEMINI_MAX_REQUESTS_PER_MINUTE = 'invalid';
      
      const config = getGeminiConfig();
      
      expect(config.maxRequestsPerMinute).toBe(60); // Default value
    });
  });
});