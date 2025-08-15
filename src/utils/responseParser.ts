import DOMPurify from 'dompurify';
import { GeminiResponse, ParsedResponse, CodeBlock, SuggestionAction } from '../types/gemini';

export class GeminiResponseParser {
  /**
   * Parse a Gemini API response into a structured format
   */
  static parseResponse(response: GeminiResponse): ParsedResponse {
    const content = this.sanitizeContent(response.content);
    
    try {
      switch (response.type) {
        case 'code':
          return this.parseCodeResponse(content, response);
        case 'markdown':
          return this.parseMarkdownResponse(content, response);
        case 'suggestion':
          return this.parseSuggestionResponse(content, response);
        case 'error':
          return this.parseErrorResponse(content, response);
        default:
          return this.parseTextResponse(content, response);
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        type: 'error',
        content: 'Failed to parse AI response',
        codeBlocks: [],
        suggestions: [],
        error: {
          code: 'PARSE_ERROR',
          message: 'Unable to process AI response',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Sanitize content to prevent XSS attacks
   */
  private static sanitizeContent(content: string): string {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'],
      ALLOWED_ATTR: ['class']
    });
  }

  /**
   * Extract code blocks from content using regex patterns
   */
  private static extractCodeBlocks(content: string): CodeBlock[] {
    const codeBlocks: CodeBlock[] = [];
    
    // Match both ```language and ``` code blocks
    const codeBlockRegex = /```(\w+)?\s*\n?([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      if (code) {
        codeBlocks.push({
          language,
          code,
          title: this.generateCodeTitle(language)
        });
      }
    }
    
    return codeBlocks;
  }

  /**
   * Generate a friendly title for code blocks
   */
  private static generateCodeTitle(language: string): string {
    const titles: Record<string, string> = {
      html: 'HTML Code',
      css: 'CSS Styles',
      javascript: 'JavaScript Code',
      js: 'JavaScript Code',
      typescript: 'TypeScript Code',
      ts: 'TypeScript Code',
      json: 'JSON Configuration',
      markdown: 'Markdown Content',
      md: 'Markdown Content',
      text: 'Text Content'
    };
    
    return titles[language.toLowerCase()] || `${language.toUpperCase()} Code`;
  }

  /**
   * Parse code-type responses
   */
  private static parseCodeResponse(content: string, response: GeminiResponse): ParsedResponse {
    const codeBlocks = this.extractCodeBlocks(content);
    const cleanContent = content.replace(/```[\s\S]*?```/g, '').trim();
    
    return {
      type: 'code',
      content: cleanContent,
      codeBlocks,
      suggestions: this.generateCodeSuggestions(codeBlocks)
    };
  }

  /**
   * Parse markdown-type responses
   */
  private static parseMarkdownResponse(content: string, response: GeminiResponse): ParsedResponse {
    const codeBlocks = this.extractCodeBlocks(content);
    
    return {
      type: 'markdown',
      content,
      codeBlocks,
      suggestions: []
    };
  }

  /**
   * Parse suggestion-type responses
   */
  private static parseSuggestionResponse(content: string, response: GeminiResponse): ParsedResponse {
    const codeBlocks = this.extractCodeBlocks(content);
    const suggestions = response.metadata?.actions || this.extractSuggestionsFromContent(content);
    
    return {
      type: 'suggestion',
      content,
      codeBlocks,
      suggestions
    };
  }

  /**
   * Parse error-type responses
   */
  private static parseErrorResponse(content: string, response: GeminiResponse): ParsedResponse {
    return {
      type: 'error',
      content,
      codeBlocks: [],
      suggestions: [],
      error: response.metadata?.error || {
        code: 'UNKNOWN_ERROR',
        message: content || 'An error occurred'
      }
    };
  }

  /**
   * Parse text-type responses
   */
  private static parseTextResponse(content: string, response: GeminiResponse): ParsedResponse {
    const codeBlocks = this.extractCodeBlocks(content);
    
    return {
      type: 'text',
      content,
      codeBlocks,
      suggestions: []
    };
  }

  /**
   * Generate suggestions for code blocks
   */
  private static generateCodeSuggestions(codeBlocks: CodeBlock[]): SuggestionAction[] {
    const suggestions: SuggestionAction[] = [];
    
    codeBlocks.forEach((block, index) => {
      suggestions.push(
        {
          id: `copy-${index}`,
          label: `Copy ${block.title}`,
          type: 'copy',
          payload: { code: block.code, language: block.language }
        },
        {
          id: `preview-${index}`,
          label: `Preview ${block.title}`,
          type: 'preview',
          payload: { code: block.code, language: block.language }
        }
      );
      
      if (block.language === 'html' || block.language === 'css' || block.language === 'javascript') {
        suggestions.push({
          id: `apply-${index}`,
          label: `Apply ${block.title}`,
          type: 'apply',
          payload: { code: block.code, language: block.language }
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Extract action suggestions from content using pattern matching
   */
  private static extractSuggestionsFromContent(content: string): SuggestionAction[] {
    const suggestions: SuggestionAction[] = [];
    
    // Look for action-oriented language
    const actionPatterns = [
      /try (adding|creating|modifying) (.+)/gi,
      /you could (add|create|modify) (.+)/gi,
      /consider (adding|creating|updating) (.+)/gi
    ];
    
    actionPatterns.forEach((pattern, patternIndex) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        suggestions.push({
          id: `suggestion-${patternIndex}-${suggestions.length}`,
          label: `${match[1]} ${match[2]}`,
          type: 'modify',
          payload: { suggestion: match[0] }
        });
      }
    });
    
    return suggestions;
  }
}