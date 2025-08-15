import axios from 'axios';
import { AIResponse } from '@/types';

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not set');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }
      );

      const candidate = response.data.candidates?.[0];
      if (!candidate) {
        throw new Error('No response from Gemini API');
      }

      const text = candidate.content.parts[0].text;
      return { text };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate content');
    }
  }

  async generateWebsiteStructure(requirements: string): Promise<AIResponse> {
    const prompt = `
      Create a website structure based on these requirements: ${requirements}
      
      Please provide:
      1. A suggested website name and description
      2. A list of pages that should be created
      3. A color scheme and theme suggestions
      4. Content recommendations for each page
      
      Format your response as structured text that can be easily parsed.
    `;

    return this.generateContent(prompt);
  }

  async generatePageContent(
    pageTitle: string,
    pageDescription: string,
    websiteContext: string
  ): Promise<AIResponse> {
    const prompt = `
      Generate HTML content for a webpage with the following details:
      - Page Title: ${pageTitle}
      - Page Description: ${pageDescription}
      - Website Context: ${websiteContext}
      
      Please create:
      1. Clean, semantic HTML structure
      2. Responsive design principles
      3. Accessible markup
      4. Engaging, relevant content
      
      Return only the HTML content for the main body section.
    `;

    return this.generateContent(prompt);
  }

  async improvePage(
    currentContent: string,
    improvementRequest: string
  ): Promise<AIResponse> {
    const prompt = `
      Please improve this HTML content based on the following request: ${improvementRequest}
      
      Current content:
      ${currentContent}
      
      Provide the improved HTML content with explanations of changes made.
    `;

    return this.generateContent(prompt);
  }
}

export default GeminiService;