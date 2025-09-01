/**
 * EditorTab Component - Refactored
 * Uses custom hooks to separate business logic from UI rendering
 * Implements container/presentational pattern
 */

import React from 'react';
import { useSiteStore } from '@/store/siteStore';
import { useEditorState } from '@/hooks/useEditorState';
import { Textarea } from '@/components/ui/Input/Input';
import DOMPurify from 'dompurify';

// DOMPurify configuration for HTML sanitization
const DOM_PURIFY_CONFIG = {
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
};

export function EditorTab() {
  const store = useSiteStore();
  const editorState = useEditorState();

  // Sanitize HTML content for preview
  const sanitizedContent = React.useMemo(() => {
    return DOMPurify.sanitize(editorState.localContent, DOM_PURIFY_CONFIG);
  }, [editorState.localContent]);

  // Get view mode dimensions for iframe
  const viewModeDimensions = editorState.getViewModeDimensions(editorState.viewMode);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px 8px 0 0',
        }}
      >
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
          {editorState.isDirty && (
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {editorState.linesCount} lines, {editorState.contentLength} chars
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* View Mode Selector - Simplified to desktop only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Preview:</span>
          <button
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#e5e7eb',
              cursor: 'default',
            }}
            disabled
          >
            {editorState.getViewModeIcon('desktop')} {editorState.getViewModeLabel('desktop')}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => store.undo()}
            disabled={!editorState.canUndo}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: editorState.canUndo ? '#ffffff' : '#f3f4f6',
              cursor: editorState.canUndo ? 'pointer' : 'not-allowed',
              color: editorState.canUndo ? '#374151' : '#9ca3af',
            }}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>

          <button
            onClick={() => store.redo()}
            disabled={!editorState.canRedo}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: editorState.canRedo ? '#ffffff' : '#f3f4f6',
              cursor: editorState.canRedo ? 'pointer' : 'not-allowed',
              color: editorState.canRedo ? '#374151' : '#9ca3af',
            }}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>

          <button
            onClick={editorState.handleSave}
            disabled={!editorState.isDirty}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: editorState.isDirty ? '#3b82f6' : '#f3f4f6',
              color: editorState.isDirty ? '#ffffff' : '#9ca3af',
              cursor: editorState.isDirty ? 'pointer' : 'not-allowed',
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
              value={editorState.localContent}
              onChange={editorState.handleContentChange}
              onKeyDown={editorState.handleKeyDown}
              onBlur={editorState.handleBlur}
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
              }}
            />
          </div>

          {/* Preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
              Preview ({editorState.getViewModeLabel(editorState.viewMode)})
            </div>
            <div
              style={{
                flex: 1,
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
              }}
            >
              <iframe
                srcDoc={sanitizedContent}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  transform: `scale(${Math.min(1, 400 / viewModeDimensions.width)})`,
                  transformOrigin: 'top left',
                }}
                title="Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          <strong>💡 Tips:</strong>
          <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.4' }}>
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
            <li>🔒 HTML preview is sanitized for security</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default EditorTab;
