import { describe, it, expect } from 'vitest';
import { GeminiResponseParser } from '../utils/responseParser';
import { GeminiResponse } from '../types/gemini';

describe('GeminiResponseParser', () => {
  it('should parse text responses correctly', () => {
    const response: GeminiResponse = {
      id: 'test-1',
      content: 'This is a simple text response',
      timestamp: new Date(),
      type: 'text'
    };

    const parsed = GeminiResponseParser.parseResponse(response);
    
    expect(parsed.type).toBe('text');
    expect(parsed.content).toBe('This is a simple text response');
    expect(parsed.codeBlocks).toHaveLength(0);
    expect(parsed.suggestions).toHaveLength(0);
  });

  it('should extract code blocks from responses', () => {
    const response: GeminiResponse = {
      id: 'test-2',
      content: `Here's some HTML code:

\`\`\`html
<div>
  <h1>Hello World</h1>
</div>
\`\`\`

And some CSS:

\`\`\`css
.container {
  max-width: 800px;
}
\`\`\``,
      timestamp: new Date(),
      type: 'code'
    };

    const parsed = GeminiResponseParser.parseResponse(response);
    
    expect(parsed.type).toBe('code');
    expect(parsed.codeBlocks).toHaveLength(2);
    expect(parsed.codeBlocks[0].language).toBe('html');
    expect(parsed.codeBlocks[1].language).toBe('css');
    expect(parsed.suggestions).toHaveLength(4); // 2 copy + 2 preview
  });

  it('should handle error responses', () => {
    const response: GeminiResponse = {
      id: 'test-3',
      content: 'An error occurred',
      timestamp: new Date(),
      type: 'error',
      metadata: {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to the service'
        }
      }
    };

    const parsed = GeminiResponseParser.parseResponse(response);
    
    expect(parsed.type).toBe('error');
    expect(parsed.error?.code).toBe('NETWORK_ERROR');
    expect(parsed.error?.message).toBe('Failed to connect to the service');
  });

  it('should handle malformed responses gracefully', () => {
    const response: GeminiResponse = {
      id: 'test-4',
      content: 'Invalid content with unclosed ```html\n<div>',
      timestamp: new Date(),
      type: 'code'
    };

    const parsed = GeminiResponseParser.parseResponse(response);
    
    // Should not throw an error and should handle gracefully
    expect(parsed.type).toBe('code');
    expect(parsed.codeBlocks).toHaveLength(0); // Unclosed block should be ignored
  });
});