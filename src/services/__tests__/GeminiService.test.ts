import GeminiService from '../GeminiService';
import { server } from '@/test/setup';
import { rest } from 'msw';

describe('GeminiService', () => {
  let geminiService: GeminiService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    geminiService = new GeminiService(mockApiKey);
  });

  describe('constructor', () => {
    it('should create service with API key', () => {
      expect(geminiService).toBeInstanceOf(GeminiService);
    });

    it('should throw error for missing API key', () => {
      const serviceWithoutKey = new GeminiService('');
      
      expect(
        serviceWithoutKey.generateContent('test prompt')
      ).rejects.toThrow('Gemini API key not set');
    });
  });

  describe('generateContent', () => {
    it('should generate content from prompt', async () => {
      const prompt = 'Create a simple website';
      
      const response = await geminiService.generateContent(prompt);
      
      expect(response).toEqual({
        text: 'This is a mock response from Gemini AI. Here is some generated content based on your request.',
      });
    });

    it('should handle API errors', async () => {
      server.use(
        rest.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          (req, res, ctx) => {
            return res(ctx.status(500), ctx.json({ error: 'Server error' }));
          }
        )
      );

      await expect(
        geminiService.generateContent('test prompt')
      ).rejects.toThrow('Failed to generate content');
    });

    it('should handle empty response', async () => {
      server.use(
        rest.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({ candidates: [] }));
          }
        )
      );

      await expect(
        geminiService.generateContent('test prompt')
      ).rejects.toThrow('No response from Gemini API');
    });
  });

  describe('generateWebsiteStructure', () => {
    it('should generate website structure from requirements', async () => {
      const requirements = 'A portfolio website for a web developer';
      
      const response = await geminiService.generateWebsiteStructure(
        requirements
      );
      
      expect(response.text).toBeDefined();
      expect(typeof response.text).toBe('string');
    });

    it('should include structured prompt for website generation', async () => {
      const requirements = 'E-commerce site for handmade crafts';
      
      // Mock to capture the request
      let capturedRequest: any;
      server.use(
        rest.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          (req, res, ctx) => {
            capturedRequest = req.body;
            return res(
              ctx.status(200),
              ctx.json({
                candidates: [
                  {
                    content: {
                      parts: [{ text: 'Generated website structure' }],
                    },
                    finishReason: 'STOP',
                    index: 0,
                  },
                ],
              })
            );
          }
        )
      );

      await geminiService.generateWebsiteStructure(requirements);
      
      expect(capturedRequest.contents[0].parts[0].text).toContain(requirements);
      expect(capturedRequest.contents[0].parts[0].text).toContain('website structure');
    });
  });

  describe('generatePageContent', () => {
    it('should generate page content with context', async () => {
      const pageTitle = 'About Us';
      const pageDescription = 'Company information and team';
      const websiteContext = 'Tech startup website';
      
      const response = await geminiService.generatePageContent(
        pageTitle,
        pageDescription,
        websiteContext
      );
      
      expect(response.text).toBeDefined();
    });
  });

  describe('improvePage', () => {
    it('should improve existing page content', async () => {
      const currentContent = '<div>Basic content</div>';
      const improvementRequest = 'Make it more professional and add CSS';
      
      const response = await geminiService.improvePage(
        currentContent,
        improvementRequest
      );
      
      expect(response.text).toBeDefined();
    });

    it('should include current content in prompt', async () => {
      const currentContent = '<h1>Original Title</h1>';
      const improvementRequest = 'Update styling';
      
      let capturedRequest: any;
      server.use(
        rest.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          (req, res, ctx) => {
            capturedRequest = req.body;
            return res(
              ctx.status(200),
              ctx.json({
                candidates: [
                  {
                    content: {
                      parts: [{ text: 'Improved content' }],
                    },
                    finishReason: 'STOP',
                    index: 0,
                  },
                ],
              })
            );
          }
        )
      );

      await geminiService.improvePage(currentContent, improvementRequest);
      
      expect(capturedRequest.contents[0].parts[0].text).toContain(currentContent);
      expect(capturedRequest.contents[0].parts[0].text).toContain(improvementRequest);
    });
  });
});