import React, { useState, useEffect, useCallback } from 'react';
import { useSiteStore } from '@/store/siteStore';
import { Textarea } from '@/components/ui/Input/Input';
import type { ViewMode } from '@/types';
import DOMPurify from 'dompurify';

// Lazy load PrismJS for syntax highlighting
let Prism: unknown = null;
let prismLoaded = false;

async function loadPrism() {
  if (prismLoaded) return Prism;
  try {
    const [prismMod] = await Promise.all([import('prismjs')]);
    Prism = prismMod.default || prismMod;

    // Load common language components
    await Promise.all([
      import('prismjs/components/prism-markup'),
      import('prismjs/components/prism-css'),
      import('prismjs/components/prism-javascript'),
      import('prismjs/components/prism-typescript'),
    ]);

    prismLoaded = true;
    return Prism;
  } catch (error) {
    console.warn('Failed to load PrismJS:', error);
    return null;
  }
}

// Detect language from content
function detectLanguage(content: string): string {
  const trimmed = content.trim();

  // Check for HTML
  if (
    trimmed.includes('<!DOCTYPE html>') ||
    (trimmed.includes('<html') && trimmed.includes('</html>')) ||
    (trimmed.includes('<div') && trimmed.includes('</div>')) ||
    /^<\w+.*>/.test(trimmed)
  ) {
    return 'markup';
  }

  // Check for CSS
  if (
    trimmed.includes('{') &&
    trimmed.includes('}') &&
    (trimmed.includes(':') || trimmed.includes(';'))
  ) {
    return 'css';
  }

  // Check for JavaScript/TypeScript
  if (
    trimmed.includes('function') ||
    trimmed.includes('const') ||
    trimmed.includes('let') ||
    trimmed.includes('var') ||
    trimmed.includes('=>') ||
    trimmed.includes('import') ||
    trimmed.includes('export')
  ) {
    return 'javascript';
  }

  // Default to markup for HTML-like content
  return 'markup';
}

// Safe HTML renderer
function renderHTML(html: string): { __html: string } {
  // Sanitize HTML for security
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'html',
      'head',
      'body',
      'title',
      'meta',
      'link',
      'style',
      'script',
      'div',
      'span',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'a',
      'img',
      'button',
      'input',
      'form',
      'label',
      'select',
      'option',
      'ul',
      'ol',
      'li',
      'table',
      'tr',
      'td',
      'th',
      'thead',
      'tbody',
      'header',
      'nav',
      'main',
      'section',
      'article',
      'aside',
      'footer',
      'br',
      'hr',
      'strong',
      'em',
      'b',
      'i',
      'u',
      's',
      'code',
      'pre',
      'blockquote',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'class',
      'id',
      'style',
      'type',
      'name',
      'value',
      'placeholder',
      'required',
      'disabled',
      'checked',
      'selected',
      'colspan',
      'rowspan',
      'width',
      'height',
    ],
  });
  return { __html: sanitized };
}

// Mockup components for different device views
function BrowserMockup({
  children,
  title = 'Preview',
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="mockup-browser border bg-base-300">
      <div className="mockup-browser-toolbar">
        <div className="input">{title}</div>
      </div>
      <div className="flex justify-center bg-base-200 px-4 py-16">{children}</div>
    </div>
  );
}

function MobileMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="mockup-phone">
      <div className="camera"></div>
      <div className="display">
        <div className="artboard artboard-demo phone-1 bg-base-200">{children}</div>
      </div>
    </div>
  );
}

function TabletMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="mockup-window border bg-base-300">
      <div className="flex justify-center bg-base-200 px-4 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function DesktopMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="mockup-window border bg-base-300">
      <div className="flex justify-center bg-base-200 px-4 py-16">
        <div className="w-full max-w-4xl">{children}</div>
      </div>
    </div>
  );
}

export function EditorTab() {
  const store = useSiteStore();
  const [localContent, setLocalContent] = useState(store.content);
  const [isDirty, setIsDirty] = useState(false);
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('markup');
  const [viewMode, setViewMode] = useState<ViewMode>('browser');

  // Load PrismJS on component mount
  useEffect(() => {
    loadPrism().then(() => {
      setSyntaxHighlighting(true);
    });
  }, []);

  // Sync local content with store content
  useEffect(() => {
    setLocalContent(store.content);
    setIsDirty(false);
    // Detect language when content changes
    if (store.content) {
      setDetectedLanguage(detectLanguage(store.content));
    }
  }, [store.content]);

  // Handle content changes
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    setIsDirty(true);
    // Update detected language
    setDetectedLanguage(detectLanguage(newContent));
  }, []);

  // Save content to store
  const handleSave = useCallback(() => {
    store.setContent(localContent);
    store.commit(); // Create undo point
    setIsDirty(false);
  }, [store, localContent]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Z or Cmd+Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      // Ctrl+Y or Cmd+Y to redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        store.redo();
      }
    },
    [handleSave, store]
  );

  // Auto-save on blur (when user leaves the textarea)
  const handleBlur = useCallback(() => {
    if (isDirty) {
      handleSave();
    }
  }, [isDirty, handleSave]);

  const canUndo = store.past.length > 0;
  const canRedo = store.future.length > 0;
  const contentLength = localContent.length;
  const linesCount = localContent.split('\n').length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Status Bar */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📝 Code Editor
            {isDirty && (
              <span
                style={{
                  fontSize: '10px',
                  color: '#f59e0b',
                  backgroundColor: '#fef3c7',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                }}
              >
                UNSAVED
              </span>
            )}
          </h4>

          {syntaxHighlighting && (
            <span
              style={{
                fontSize: '12px',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
            >
              {detectedLanguage.toUpperCase()}
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {linesCount} lines, {contentLength} chars
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Undo/Redo buttons */}
          <button
            onClick={() => store.undo()}
            disabled={!canUndo}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: canUndo ? '#ffffff' : '#f9fafb',
              color: canUndo ? '#374151' : '#9ca3af',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>

          <button
            onClick={() => store.redo()}
            disabled={!canRedo}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: canRedo ? '#ffffff' : '#f9fafb',
              color: canRedo ? '#374151' : '#9ca3af',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!isDirty}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: isDirty ? '#3b82f6' : '#f9fafb',
              color: isDirty ? '#ffffff' : '#9ca3af',
              cursor: isDirty ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
            }}
            title="Save (Ctrl+S)"
          >
            💾 Save
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '0 0 8px 8px',
          border: '1px solid #e9ecef',
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Editor and Preview Split View */}
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          {/* Code Editor */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
              Editor
            </div>
            <Textarea
              value={localContent}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="Paste your HTML, CSS, or JavaScript code here, or let the AI generate it for you in the Chat tab..."
              size="lg"
              className="flex-1"
              style={{
                minHeight: '300px',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                resize: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '12px',
              }}
            />
          </div>

          {/* HTML Preview with Device Mockups */}
          {syntaxHighlighting && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Live Preview</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setViewMode('browser')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      border: viewMode === 'browser' ? '1px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: viewMode === 'browser' ? '#eff6ff' : '#ffffff',
                      color: viewMode === 'browser' ? '#3b82f6' : '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    🖥️ Browser
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      border: viewMode === 'mobile' ? '1px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: viewMode === 'mobile' ? '#eff6ff' : '#ffffff',
                      color: viewMode === 'mobile' ? '#3b82f6' : '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    📱 Mobile
                  </button>
                  <button
                    onClick={() => setViewMode('tablet')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      border: viewMode === 'tablet' ? '1px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: viewMode === 'tablet' ? '#eff6ff' : '#ffffff',
                      color: viewMode === 'tablet' ? '#3b82f6' : '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    📱 Tablet
                  </button>
                  <button
                    onClick={() => setViewMode('desktop')}
                    style={{
                      padding: '4px 8px',
                      fontSize: '10px',
                      border: viewMode === 'desktop' ? '1px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: viewMode === 'desktop' ? '#eff6ff' : '#ffffff',
                      color: viewMode === 'desktop' ? '#3b82f6' : '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    💻 Desktop
                  </button>
                </div>
              </div>

              {/* Render HTML content based on view mode */}
              <div
                style={{
                  flex: 1,
                  minHeight: '300px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  overflow: 'auto',
                }}
              >
                {detectedLanguage === 'markup' && localContent.trim() ? (
                  viewMode === 'browser' ? (
                    <BrowserMockup title="Live Preview">
                      <div dangerouslySetInnerHTML={renderHTML(localContent)} />
                    </BrowserMockup>
                  ) : viewMode === 'mobile' ? (
                    <MobileMockup>
                      <div dangerouslySetInnerHTML={renderHTML(localContent)} />
                    </MobileMockup>
                  ) : viewMode === 'tablet' ? (
                    <TabletMockup>
                      <div dangerouslySetInnerHTML={renderHTML(localContent)} />
                    </TabletMockup>
                  ) : (
                    <DesktopMockup>
                      <div dangerouslySetInnerHTML={renderHTML(localContent)} />
                    </DesktopMockup>
                  )
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#9ca3af',
                      fontSize: '14px',
                    }}
                  >
                    {detectedLanguage === 'markup'
                      ? 'Enter HTML content to see live preview'
                      : 'Preview available for HTML content only'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with tips */}
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef',
          }}
        >
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
            💡 <strong>Tips:</strong>
          </div>
          <ul
            style={{
              fontSize: '11px',
              color: '#6b7280',
              margin: 0,
              paddingLeft: '16px',
              lineHeight: '1.4',
            }}
          >
            <li>
              Use{' '}
              <kbd
                style={{
                  backgroundColor: '#e5e7eb',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontSize: '10px',
                }}
              >
                Ctrl+S
              </kbd>{' '}
              to save changes
            </li>
            <li>
              Use{' '}
              <kbd
                style={{
                  backgroundColor: '#e5e7eb',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontSize: '10px',
                }}
              >
                Ctrl+Z
              </kbd>
              /
              <kbd
                style={{
                  backgroundColor: '#e5e7eb',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontSize: '10px',
                }}
              >
                Ctrl+Y
              </kbd>{' '}
              for undo/redo
            </li>
            <li>Content is automatically saved when you switch tabs or leave the editor</li>
            <li>Switch to the Chat tab to ask AI to generate or modify your code</li>
            {syntaxHighlighting && (
              <>
                <li>✨ Syntax highlighting automatically detects HTML, CSS, and JavaScript</li>
                <li>🌐 Switch between Browser, Mobile, Tablet, and Desktop preview modes</li>
                <li>🔒 HTML preview is sanitized for security</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EditorTab;
