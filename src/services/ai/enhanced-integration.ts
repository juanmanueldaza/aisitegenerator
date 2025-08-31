/**
 * Enhanced AI Service Integration Proof-of-Concept
 * Demonstrates improved Deep Chat React + Vercel AI SDK integration
 */

import { useState, useCallback } from 'react';
import { generateText, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

// Types for AI usage and model information
export interface AIUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  [key: string]: unknown; // Allow additional properties from AI SDK
}

export interface AIModel {
  provider: 'google' | 'openai';
  modelName: string;
}

// Enhanced message types for better type safety
export interface EnhancedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    usage?: AIUsage;
    model?: string;
  };
}

// Enhanced AI Service with improved error handling and streaming
export class EnhancedAIService {
  private model: ReturnType<typeof google> | ReturnType<typeof openai>;

  constructor(provider: 'google' | 'openai' = 'google', modelName?: string) {
    this.model =
      provider === 'google'
        ? google(modelName || 'gemini-2.0-flash')
        : openai(modelName || 'gpt-4o');
  }

  async generate(
    messages: EnhancedMessage[],
    options: {
      temperature?: number;
      systemInstruction?: string;
    } = {}
  ) {
    try {
      const result = await generateText({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options.temperature ?? 0.7,
        system: options.systemInstruction,
      });

      return {
        text: result.text,
        usage: result.usage,
        finishReason: result.finishReason,
      };
    } catch (error) {
      console.error('Enhanced AI generation failed:', error);
      throw new Error(
        `AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async *generateStream(
    messages: EnhancedMessage[],
    options: {
      temperature?: number;
      systemInstruction?: string;
    } = {}
  ) {
    try {
      const result = await streamText({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options.temperature ?? 0.7,
        system: options.systemInstruction,
      });

      // Stream text chunks with better error handling
      for await (const chunk of result.textStream) {
        yield {
          type: 'text',
          content: chunk,
          done: false,
        };
      }

      // Final usage information
      const usage = await result.usage;
      yield {
        type: 'usage',
        content: usage,
        done: true,
      };
    } catch (error) {
      console.error('Enhanced AI streaming failed:', error);
      throw new Error(
        `AI streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Types for Deep Chat integration
export interface DeepChatMessage {
  _id?: string;
  role: 'user' | 'ai';
  text: string;
  [key: string]: unknown;
}

export interface DeepChatSignals {
  onResponse?: (response: {
    text: string;
    isFirst?: boolean;
    isLast?: boolean;
    error?: string;
  }) => void;
}

export interface DeepChatBody {
  messages: DeepChatMessage[];
  [key: string]: unknown;
}

// Enhanced Deep Chat configuration with better error handling
export const createEnhancedDeepChatConfig = (
  aiService: EnhancedAIService,
  onMessage: (message: EnhancedMessage) => void,
  onError: (error: Error) => void
) => ({
  connect: {
    handler: async (body: DeepChatBody, signals: DeepChatSignals) => {
      const messages = body.messages || [];
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage?.content) return;

      try {
        // Convert Deep Chat messages to enhanced format
        const enhancedMessages: EnhancedMessage[] = messages.map(
          (msg: DeepChatMessage, index: number) => ({
            id: msg._id || `msg_${Date.now()}_${index}`,
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.text || '',
            timestamp: Date.now(),
          })
        );

        let accumulatedText = '';

        // Enhanced system instruction for website generation
        const systemInstruction = `You are an expert web developer and AI assistant specializing in creating modern, responsive websites.

Your capabilities include:
- Generating clean, semantic HTML5
- Creating modern CSS with Flexbox/Grid layouts
- Writing efficient JavaScript for interactivity
- Implementing responsive design patterns
- Following web accessibility guidelines
- Using modern CSS frameworks and best practices

When generating code, always provide:
1. Complete, runnable HTML/CSS/JS
2. Modern responsive design
3. Clean, readable code structure
4. Proper semantic HTML
5. Mobile-first approach

Focus on creating websites that work across all devices and browsers.`;

        // Stream the response with enhanced options
        for await (const chunk of aiService.generateStream(enhancedMessages, {
          temperature: 0.7,
          systemInstruction,
        })) {
          if (chunk.type === 'text') {
            accumulatedText += chunk.content;
            signals.onResponse?.({
              text: accumulatedText,
              isFirst: accumulatedText === chunk.content,
              isLast: false,
            });
          } else if (chunk.type === 'usage') {
            // Handle usage information
            console.log('AI Usage:', chunk.content);
          }
        }

        // Send final response
        signals.onResponse?.({
          text: accumulatedText,
          isLast: true,
        });

        // Create and send assistant message
        const assistantMessage: EnhancedMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: accumulatedText,
          timestamp: Date.now(),
          metadata: {
            model: 'enhanced-ai-service',
          },
        };

        onMessage(assistantMessage);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Deep Chat handler error:', error);

        signals.onResponse?.({
          text: `I'm sorry, I encountered an error: ${errorMessage}. Please try again.`,
          error: errorMessage,
          isLast: true,
        });

        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    },
  },
  chat: {
    history: [], // Will be populated from store
  },
  messages: {
    waitTime: 0,
    text: { maxChars: 10000 },
  },
  textInput: {
    placeholder: { text: 'Describe the website you want to create...' },
  },
  // Enhanced features for better UX
  files: {
    button: {
      style: {
        display: 'block',
        marginTop: '10px',
      },
    },
  },
  microphone: {
    button: {
      style: {
        display: 'block',
        marginTop: '10px',
      },
    },
  },
  camera: {
    button: {
      style: {
        display: 'block',
        marginTop: '10px',
      },
    },
  },
});

// React Hook for enhanced AI integration
export const useEnhancedAI = (provider: 'google' | 'openai' = 'google') => {
  const [aiService] = useState(() => new EnhancedAIService(provider));
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setError(null);

      // Add user message
      const userMessage: EnhancedMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const result = await aiService.generate([...messages, userMessage], {
          temperature: 0.7,
        });

        // Add assistant message
        const assistantMessage: EnhancedMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: result.text,
          timestamp: Date.now(),
          metadata: {
            usage: result.usage,
            model: provider,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService, messages, provider]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    aiService,
  };
};

export default EnhancedAIService;
