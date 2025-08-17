/**
 * AI Chat Interface Component
 * Provides interactive chat functionality for website generation
 */

import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAIProvider } from '@/services/ai';
import GeminiProvider from '@/services/ai/gemini';
import { renderMarkdown } from '@/utils/content';
import type { AIMessage } from '@/types/ai';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'code' | 'suggestion';
}

interface ChatInterfaceProps {
  onSiteGenerated?: (siteData: { content?: string }) => void;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSiteGenerated, className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hi! I'm your AI assistant for creating websites. Tell me what kind of website you'd like to build, and I'll help you create it step by step.",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage<string>('GEMINI_API_KEY', '');
  const [model, setModel] = useState<string>('gemini-2.0-flash');
  const ai = useAIProvider('gemini');
  const [connected, setConnected] = useState<boolean>(false);
  const [connectMsg, setConnectMsg] = useState<string>('');
  const [validating, setValidating] = useState<boolean>(false);
  const [toast, setToast] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // When API key changes, prompt to connect/validate
  useEffect(() => {
    if (!apiKey.trim()) {
      setConnected(false);
      setConnectMsg('Enter your Gemini API key and click Connect.');
    } else {
      setConnected(false);
      setConnectMsg('Click Connect to validate your key.');
    }
  }, [apiKey]);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setConnected(false);
      setConnectMsg('Enter an API key to connect.');
      return;
    }
    try {
      setValidating(true);
      setConnectMsg('Validating key…');
      const provider = new GeminiProvider(apiKey.trim());
      // minimal ping to validate credentials
      await provider.generate([{ role: 'user', content: 'ping' }], { model });
      setConnected(true);
      setConnectMsg('Gemini connected.');
    } catch (err) {
      setConnected(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (/unauthorized|401/i.test(msg)) {
        setConnectMsg('Unauthorized: Check your API key.');
      } else if (/quota|rate|429/i.test(msg)) {
        setConnectMsg('Rate limit or quota exceeded. Try again later.');
      } else if (/safety|blocked/i.test(msg)) {
        setConnectMsg('Blocked by safety filters. Try a different prompt.');
      } else {
        setConnectMsg('Failed to connect. Verify key and network.');
      }
    } finally {
      setValidating(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Send message
  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmedInput,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      // Use Gemini provider streaming
      const history: AIMessage[] = messages.map((m) => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));
      history.push({ role: 'user', content: trimmedInput });

      if (!ai.ready) {
        await simulateAIResponse(trimmedInput);
        return;
      }

      let accumulated = '';
      for await (const chunk of ai.generateStream(history, {
        model,
        systemInstruction:
          'You are a helpful assistant that generates website plans and code snippets when asked. Prefer concise, actionable responses.',
        temperature: 0.6,
      })) {
        accumulated += chunk.text;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.sender === 'ai' && last.id === 'streaming') {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              content: accumulated,
            };
            return updated;
          }
          return [
            ...prev,
            {
              id: 'streaming',
              content: accumulated,
              sender: 'ai',
              timestamp: new Date(),
              type: 'text',
            },
          ];
        });
      }

      // finalize message id
      setMessages((prev) =>
        prev.map((m) => (m.id === 'streaming' ? { ...m, id: (Date.now() + 1).toString() } : m))
      );

      // Try to auto-apply previewable content (HTML/Markdown code fences)
      const picks = extractPreviewables(accumulated);
      const best = getBestPreviewable(picks);
      if (best && onSiteGenerated) {
        onSiteGenerated({ content: best.body });
        showToast('Applied AI code to editor');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Extract all previewable blocks from AI output
  function extractPreviewables(
    text: string
  ): Array<{ kind: 'html' | 'markdown'; body: string; index: number }> {
    const out: Array<{ kind: 'html' | 'markdown'; body: string; index: number }> = [];
    try {
      const fenceRe = /```\s*([a-zA-Z0-9_-]+)?\s*\n([\s\S]*?)```/g;
      let match: RegExpExecArray | null;
      let i = 0;
      while ((match = fenceRe.exec(text))) {
        const lang = (match[1] || '').toLowerCase();
        const code = (match[2] || '').trim();
        if (!code) continue;
        if (lang === 'html' || lang === 'htm' || lang === 'xhtml')
          out.push({ kind: 'html', body: code, index: i });
        if (lang === 'markdown' || lang === 'md')
          out.push({ kind: 'markdown', body: code, index: i });
        i += 1;
      }
      if (!out.length) {
        // Heuristic: looks like raw HTML without fences
        const looksHTML = /<!DOCTYPE|<html[\s>]|<body[\s>]|<div[\s>]/i.test(text);
        if (looksHTML) out.push({ kind: 'html', body: text, index: -1 });
      }
    } catch {
      // ignore
    }
    return out;
  }

  function getBestPreviewable(
    items: Array<{ kind: 'html' | 'markdown'; body: string; index: number }>
  ): { kind: 'html' | 'markdown'; body: string; index: number } | null {
    if (!items.length) return null;
    // Prefer HTML if present, else first markdown
    const html = items.find((b) => b.kind === 'html');
    return html || items[0];
  }

  // Copy helpers
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch {
      // Fallback for environments without clipboard
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard');
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1500);
  }

  // Simulate AI response (replace with actual AI service)
  const simulateAIResponse = async (userInput: string): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    let aiResponse = '';
    let responseType: 'text' | 'code' | 'suggestion' = 'text';

    // Simple response logic (replace with actual AI integration)
    const input = userInput.toLowerCase();

    if (input.includes('portfolio') || input.includes('personal website')) {
      aiResponse = `Great! I'll help you create a portfolio website. Here are some questions to get started:

1. What's your profession or main focus? (e.g., developer, designer, photographer)
2. What sections would you like? (About, Projects, Contact, etc.)
3. Do you have a preferred color scheme or style?
4. Any specific features you need? (blog, gallery, contact form)

Let me know your preferences and I'll start building your portfolio!`;
      responseType = 'suggestion';
    } else if (input.includes('business') || input.includes('company')) {
      aiResponse = `Perfect! Let's create a professional business website. I'll need some details:

1. What type of business is it?
2. What services or products do you offer?
3. Do you need specific pages? (Services, About Us, Contact, etc.)
4. Any branding guidelines or preferred colors?

Once I have these details, I can generate a complete business website for you.`;
      responseType = 'suggestion';
    } else if (input.includes('blog') || input.includes('writing')) {
      aiResponse = `Excellent choice! A blog website is perfect for sharing your thoughts and expertise. Let me help you set this up:

1. What topics will you write about?
2. Do you want categories or tags?
3. Should it include an about page and contact form?
4. Any specific design preferences?

I'll create a clean, readable blog layout that's perfect for your content.`;
      responseType = 'suggestion';
    } else if (input.includes('code') || input.includes('html') || input.includes('css')) {
      aiResponse = `I can definitely help with the code! Here's a basic HTML structure to get started:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Your Website</h1>
        <p>This is your starting point!</p>
    </div>
</body>
</html>
\`\`\`

Would you like me to customize this further?`;
      responseType = 'code';
    } else {
      aiResponse = `I understand you want to create a website! I can help you build various types of websites:

• **Portfolio/Personal** - Showcase your work and skills
• **Business/Company** - Professional presence for your business  
• **Blog** - Share your thoughts and expertise
• **Landing Page** - Promote a product or service
• **E-commerce** - Sell products online

What type of website interests you most? Or tell me more about your specific needs and I'll provide tailored suggestions!`;
      responseType = 'suggestion';
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      type: responseType,
    };

    setMessages((prev) => [...prev, aiMessage]);

    // Call the callback if provided and we have generated content
    if (onSiteGenerated && responseType === 'code') {
      onSiteGenerated({ content: aiResponse });
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        content:
          "Hi! I'm your AI assistant for creating websites. Tell me what kind of website you'd like to build, and I'll help you create it step by step.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      },
    ]);
  };

  return (
    <div className={`chat-interface ${className}`}>
      <div className="chat-header">
        <div className="chat-title">
          <h2>AI Website Assistant</h2>
          <span className="chat-status">Online</span>
        </div>
        <div className="chat-controls" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: 220 }}
          />
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gemini-2.0-flash">gemini-2.0-flash</option>
            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
          </select>
          <button
            onClick={handleConnect}
            className="btn btn-primary btn-small"
            title="Connect to Gemini"
            disabled={!apiKey.trim() || validating}
          >
            {validating ? 'Connecting…' : 'Connect'}
          </button>
          <span
            aria-live="polite"
            style={{ fontSize: 12, color: connected ? '#1f883d' : '#666' }}
            title={connectMsg || (connected ? 'Connected' : 'Not connected')}
          >
            {connected ? 'Gemini: Connected' : 'Gemini: Not connected'}
          </span>
          {connectMsg && (
            <span style={{ fontSize: 12, color: '#6a737d' }} aria-live="polite">
              {connectMsg}
            </span>
          )}
        </div>
        <button
          onClick={handleClearChat}
          className="btn btn-secondary btn-small"
          title="Clear chat"
        >
          Clear
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => {
          const aiBlocks = message.sender === 'ai' ? extractPreviewables(message.content) : [];
          const best = getBestPreviewable(aiBlocks);
          return (
            <div key={message.id} className={`message ${message.sender} ${message.type || 'text'}`}>
              <div className="message-content">
                {message.type === 'code' ? (
                  <pre>
                    <code>{message.content}</code>
                  </pre>
                ) : (
                  <div
                    className="message-text"
                    // Safe: renderMarkdown sanitizes HTML with DOMPurify
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                  />
                )}
                {(best || message.sender === 'ai') && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    {best && (
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => {
                          if (onSiteGenerated) onSiteGenerated({ content: best.body });
                          showToast('Applied AI code to editor');
                        }}
                        title={
                          best.kind === 'html'
                            ? 'Apply HTML to Editor/Preview'
                            : 'Apply Markdown to Editor/Preview'
                        }
                      >
                        Use in Editor
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => copyToClipboard(message.content)}
                      title="Copy full reply (markdown)"
                    >
                      Copy
                    </button>
                    {best && (
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => copyToClipboard(best.body)}
                        title={
                          best.kind === 'html' ? 'Copy HTML code block' : 'Copy Markdown code block'
                        }
                      >
                        Copy code
                      </button>
                    )}
                    {aiBlocks.length > 1 && (
                      <details style={{ marginLeft: 8 }}>
                        <summary style={{ cursor: 'pointer' }}>More blocks</summary>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {aiBlocks.map((b, idx) => (
                            <div
                              key={`${message.id}-blk-${idx}`}
                              style={{ display: 'flex', gap: 6 }}
                            >
                              <button
                                className="btn btn-secondary btn-small"
                                onClick={() => {
                                  if (onSiteGenerated) onSiteGenerated({ content: b.body });
                                  showToast('Applied AI code to editor');
                                }}
                                title={b.kind === 'html' ? 'Apply HTML' : 'Apply Markdown'}
                              >
                                Apply {b.kind} #{idx + 1}
                              </button>
                              <button
                                className="btn btn-secondary btn-small"
                                onClick={() => copyToClipboard(b.body)}
                                title={b.kind === 'html' ? 'Copy HTML' : 'Copy Markdown'}
                              >
                                Copy #{idx + 1}
                              </button>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="message ai typing">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        {toast && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'absolute',
              bottom: 80,
              left: 16,
              background: 'rgba(17,24,39,0.9)',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            {toast}
          </div>
        )}
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Describe the website you want to create..."
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
            title="Send message"
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ marginRight: 6 }}
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
