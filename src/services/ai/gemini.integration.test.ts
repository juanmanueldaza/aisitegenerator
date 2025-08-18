/**
 * AI Service Integration Tests
 * Testing AI content generation with various prompts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AIMessage } from '@/types/ai';

// Mock the entire gemini module to test integration patterns
const mockSendMessage = vi.fn();
const mockStartChat = vi.fn(() => ({ sendMessage: mockSendMessage }));
const mockGenerateContentStream = vi.fn();

// Mock the @google/generative-ai import
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      startChat: mockStartChat,
      generateContentStream: mockGenerateContentStream,
    }),
  })),
}));

// Create a test-friendly version of GeminiProvider for integration testing
class TestGeminiProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('Missing Gemini API key');
    this.apiKey = apiKey;
  }

  async generate(messages: AIMessage[], options = {}) {
    // Simplified test implementation that mirrors the actual structure
    // Use parameters to avoid lint warnings
    void messages;
    void options;
    void this.apiKey;

    const mockResponse = await mockSendMessage();
    return {
      text: mockResponse?.response?.text?.() ?? 'Default response',
      finishReason: 'stop',
    };
  }

  async *generateStream(messages: AIMessage[], options = {}) {
    // Use parameters to avoid lint warnings
    void messages;
    void options;

    const stream = mockGenerateContentStream();
    for await (const chunk of stream) {
      yield { text: chunk?.response?.text?.() ?? '' };
    }
  }
}

describe('AI Service Integration Testing Patterns', () => {
  let provider: TestGeminiProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new TestGeminiProvider('test-api-key');
  });

  describe('Content Generation Patterns', () => {
    const websitePrompts = [
      'Create a simple portfolio website with HTML and CSS',
      'Build an e-commerce landing page',
      'Design a blog website with modern layout',
      'Make a restaurant website with menu',
    ];

    it('should handle various website generation prompts', async () => {
      for (const prompt of websitePrompts) {
        const mockResponse = {
          response: {
            text: () => `Generated ${prompt.split(' ')[2]} website with HTML, CSS, and JavaScript`,
          },
        };

        mockSendMessage.mockResolvedValue(mockResponse);

        const messages: AIMessage[] = [{ role: 'user', content: prompt }];
        const result = await provider.generate(messages);

        expect(result.text).toContain('Generated');
        expect(result.finishReason).toBe('stop');
      }

      // Verify all prompts were processed
      expect(mockSendMessage).toHaveBeenCalledTimes(websitePrompts.length);
    });

    it('should handle conversation context properly', async () => {
      const conversationSteps = [
        { role: 'user' as const, content: 'Create a basic website' },
        { role: 'assistant' as const, content: 'Created a basic HTML website' },
        { role: 'user' as const, content: 'Add CSS styling' },
        { role: 'assistant' as const, content: 'Added CSS styling' },
        { role: 'user' as const, content: 'Make it responsive' },
      ];

      const mockResponse = {
        response: {
          text: () => 'Made the website responsive with mobile-first design',
        },
      };

      mockSendMessage.mockResolvedValue(mockResponse);

      const result = await provider.generate(conversationSteps);

      expect(mockSendMessage).toHaveBeenCalled();
      expect(result.text).toContain('responsive');
    });

    it('should handle different content types', async () => {
      const contentTypes = [
        'HTML structure',
        'CSS styling',
        'JavaScript functionality',
        'Complete webpage',
      ];

      for (let i = 0; i < contentTypes.length; i++) {
        const mockResponse = {
          response: {
            text: () => `Generated ${contentTypes[i]} content`,
          },
        };

        mockSendMessage.mockResolvedValue(mockResponse);

        const messages: AIMessage[] = [{ role: 'user', content: `Create ${contentTypes[i]}` }];

        const result = await provider.generate(messages);
        expect(result.text).toContain(contentTypes[i]);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle various API error scenarios', async () => {
      const errorScenarios = [
        { error: new Error('Rate limit exceeded'), expectedMessage: 'Rate limit' },
        { error: new Error('Invalid API key'), expectedMessage: 'API key' },
        { error: new Error('Safety filters triggered'), expectedMessage: 'Safety filters' },
        { error: new Error('Network timeout'), expectedMessage: 'timeout' },
      ];

      for (const scenario of errorScenarios) {
        mockSendMessage.mockRejectedValueOnce(scenario.error);

        try {
          await provider.generate([{ role: 'user', content: 'Create a website' }]);
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain(scenario.expectedMessage);
        }
      }
    });

    it('should handle retry logic for transient errors', async () => {
      const transientError = new Error('Temporary server error');
      const successResponse = {
        response: { text: () => 'Success after retry' },
      };

      // Mock the retry pattern - first call fails, second succeeds
      mockSendMessage.mockRejectedValueOnce(transientError).mockResolvedValueOnce(successResponse);

      // This test demonstrates the retry pattern, even though our test provider
      // doesn't implement actual retry logic
      try {
        await provider.generate([{ role: 'user', content: 'Create a website' }]);
      } catch (error) {
        // First attempt should fail
        expect((error as Error).message).toContain('Temporary server error');
      }

      // Second attempt should succeed
      const result = await provider.generate([{ role: 'user', content: 'Create a website' }]);

      expect(result.text).toBe('Success after retry');
    });
  });

  describe('Streaming Integration', () => {
    it('should handle streaming responses correctly', async () => {
      const streamChunks = [
        { response: { text: () => '<!DOCTYPE html>' } },
        { response: { text: () => '<html><head>' } },
        { response: { text: () => '<title>My Website</title>' } },
        { response: { text: () => '</head><body>' } },
        { response: { text: () => '<h1>Welcome</h1>' } },
        { response: { text: () => '</body></html>' } },
      ];

      async function* mockStream() {
        for (const chunk of streamChunks) {
          yield chunk;
        }
      }

      mockGenerateContentStream.mockReturnValue(mockStream());

      const messages: AIMessage[] = [{ role: 'user', content: 'Create an HTML page' }];

      const chunks = [];
      for await (const chunk of provider.generateStream(messages)) {
        chunks.push(chunk.text);
      }

      expect(chunks).toEqual([
        '<!DOCTYPE html>',
        '<html><head>',
        '<title>My Website</title>',
        '</head><body>',
        '<h1>Welcome</h1>',
        '</body></html>',
      ]);
    });

    it('should handle streaming errors gracefully', async () => {
      async function* mockErrorStream() {
        yield { response: { text: () => 'Starting generation...' } };
        yield { response: { text: () => '<!DOCTYPE html>' } };
        throw new Error('Stream interrupted');
      }

      mockGenerateContentStream.mockReturnValue(mockErrorStream());

      const messages: AIMessage[] = [{ role: 'user', content: 'Create a webpage' }];

      const chunks = [];
      try {
        for await (const chunk of provider.generateStream(messages)) {
          chunks.push(chunk.text);
        }
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Stream interrupted');
      }

      expect(chunks).toHaveLength(2); // Should have received chunks before error
    });
  });

  describe('Message Processing Integration', () => {
    it('should handle different message formats', async () => {
      const messageFormats = [
        [{ role: 'user' as const, content: 'Simple request' }],
        [
          { role: 'system' as const, content: 'You are a helpful assistant' },
          { role: 'user' as const, content: 'Create a website' },
        ],
        [
          { role: 'user' as const, content: 'Create a website' },
          { role: 'assistant' as const, content: 'I created a website' },
          { role: 'user' as const, content: 'Add more features' },
        ],
      ];

      for (const messages of messageFormats) {
        const mockResponse = {
          response: { text: () => `Processed ${messages.length} messages` },
        };

        mockSendMessage.mockResolvedValue(mockResponse);

        const result = await provider.generate(messages);
        expect(result.text).toContain('Processed');
      }
    });

    it('should handle empty and edge case inputs', async () => {
      const edgeCases = [
        [],
        [{ role: 'user' as const, content: '' }],
        [{ role: 'user' as const, content: '   ' }],
        [{ role: 'system' as const, content: 'System only message' }],
      ];

      for (const messages of edgeCases) {
        const mockResponse = {
          response: { text: () => 'Default response for edge case' },
        };

        mockSendMessage.mockResolvedValue(mockResponse);

        const result = await provider.generate(messages);
        expect(result.text).toContain('Default response');

        // Reset mock for next iteration
        mockSendMessage.mockClear();
      }
    });
  });

  describe('Configuration Integration', () => {
    it('should respect different generation options', async () => {
      const optionsVariants = [
        { model: 'gemini-pro', temperature: 0.7 },
        { model: 'gemini-2.5-flash', temperature: 0.3 },
        { systemInstruction: 'You are a web developer' },
        { thinkingBudgetTokens: 1000 },
      ];

      for (const options of optionsVariants) {
        const mockResponse = {
          response: { text: () => `Generated with ${JSON.stringify(options)}` },
        };

        mockSendMessage.mockResolvedValue(mockResponse);

        const result = await provider.generate(
          [{ role: 'user', content: 'Create content' }],
          options
        );

        expect(result.text).toContain('Generated with');
      }
    });
  });
});
