import { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { 
  GeminiRequest, 
  GeminiResponse, 
  GeminiError, 
  RateLimitInfo, 
  UsageStats 
} from '../types/gemini';

export interface UseGeminiState {
  isLoading: boolean;
  response: GeminiResponse | null;
  error: GeminiError | null;
  isConfigured: boolean;
}

export interface UseGeminiActions {
  generateText: (request: GeminiRequest) => Promise<void>;
  clearResponse: () => void;
  clearError: () => void;
  getRateLimitInfo: () => RateLimitInfo;
  getUsageStats: () => UsageStats;
}

export type UseGeminiReturn = UseGeminiState & UseGeminiActions;

/**
 * React hook for interacting with the Gemini API
 */
export function useGemini(): UseGeminiReturn {
  const [state, setState] = useState<UseGeminiState>({
    isLoading: false,
    response: null,
    error: null,
    isConfigured: false,
  });

  const geminiServiceRef = useRef<GeminiService | null>(null);

  // Initialize the service
  useEffect(() => {
    try {
      geminiServiceRef.current = new GeminiService();
      setState(prev => ({ 
        ...prev, 
        isConfigured: geminiServiceRef.current!.isConfigured() 
      }));
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      setState(prev => ({ 
        ...prev, 
        isConfigured: false,
        error: {
          code: 'INITIALIZATION_ERROR',
          message: 'Failed to initialize Gemini service. Please check your configuration.',
          details: error,
        }
      }));
    }
  }, []);

  const generateText = async (request: GeminiRequest): Promise<void> => {
    if (!geminiServiceRef.current) {
      setState(prev => ({
        ...prev,
        error: {
          code: 'SERVICE_NOT_INITIALIZED',
          message: 'Gemini service is not initialized',
        }
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      response: null 
    }));

    try {
      const response = await geminiServiceRef.current.generateText(request);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        response, 
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as GeminiError 
      }));
    }
  };

  const clearResponse = (): void => {
    setState(prev => ({ ...prev, response: null }));
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  const getRateLimitInfo = (): RateLimitInfo => {
    if (!geminiServiceRef.current) {
      return {
        requestsRemaining: 0,
        resetTime: Date.now(),
        totalRequests: 0,
      };
    }
    return geminiServiceRef.current.getRateLimitInfo();
  };

  const getUsageStats = (): UsageStats => {
    if (!geminiServiceRef.current) {
      return {
        requestsToday: 0,
        tokensUsedToday: 0,
        requestsThisHour: 0,
        lastRequestTime: 0,
      };
    }
    return geminiServiceRef.current.getUsageStats();
  };

  return {
    ...state,
    generateText,
    clearResponse,
    clearError,
    getRateLimitInfo,
    getUsageStats,
  };
}