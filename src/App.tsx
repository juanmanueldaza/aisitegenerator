import { useState, useEffect, useRef, useMemo } from 'react';
import LivePreview from './components/LivePreview/LivePreview';
import GitHubAuth from './components/auth/GitHubAuth';
import ChatInterface from './components/chat/ChatInterface';
import RepositoryCreator from './components/deployment/RepositoryCreator';
import { useGitHub } from './hooks/useGitHub';
import { useSiteStore } from './store/siteStore';
import { Toast, InlineDiffView } from '@/components/ui';
import { computeHunks, applyAll, type DiffHunk } from '@/utils/diff';
import './App.css';
import { OnboardingWizard } from '@/components';

const SAMPLE_CONTENT = `# Welcome to AI Site Generator

This is a sample website being generated. The content you see here will be displayed in the live preview component.

## Features

- Real-time preview
- Device simulation
- Responsive design
- Secure iframe rendering
- AI-powered website generation
- GitHub integration for deployment

### Markdown Support

This preview supports **bold text**, *italic text*, and [links](https://example.com).

#### Code Blocks

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

#### Lists

1. First item
2. Second item
3. Third item

- Bullet point
- Another point
- Final point

> This is a blockquote showing how content will appear in the preview.`;

function App() {
  const store = useSiteStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'deploy'>('chat');
  const { isAuthenticated, user, error: ghError, clearError } = useGitHub();
  const commitTimerRef = useRef<number | null>(null);
  const [showConflict, setShowConflict] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [toast, setToast] = useState<string>('');
  const [selectedHunks, setSelectedHunks] = useState<boolean[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showInlineView, setShowInlineView] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?') setShowWizard(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const lastAIContent = useMemo(() => {
    const msgs = store.messages;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant' && msgs[i].content?.trim()) {
        return msgs[i].content;
      }
    }
    return '';
  }, [store.messages]);

  const handleSiteGenerated = (siteData: { content?: string }) => {
    // Handle AI-generated site data
    if (siteData && siteData.content) {
      store.setContent(siteData.content);
      store.commit();
      setActiveTab('editor');
    }
  };

  // Initialize store content from initial sample
  useEffect(() => {
    if (!store.content) {
      store.setContent(SAMPLE_CONTENT);
      store.commit();
    }
  }, [store]);

  // Optional (#37): Debounced commit batching for editor typing to create sane undo snapshots
  useEffect(() => {
    if (activeTab !== 'editor') return;
    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = window.setTimeout(() => {
      store.commit();
      commitTimerRef.current = null;
    }, 1000) as unknown as number;
    return () => {
      if (commitTimerRef.current) {
        window.clearTimeout(commitTimerRef.current);
        commitTimerRef.current = null;
      }
    };
  }, [store.content, activeTab, store]);

  // Very lightweight conflict hint: if last message is assistant and editor not on chat tab
  useEffect(() => {
    const last = store.messages[store.messages.length - 1];
    if (last?.role === 'assistant' && activeTab === 'editor') {
      setShowConflict(true);
      const t = window.setTimeout(() => setShowConflict(false), 3000);
      return () => window.clearTimeout(t);
    }
  }, [store.messages, activeTab]);

  // Show GitHub errors as toasts globally
  useEffect(() => {
    if (!ghError) return;
    setToast(ghError);
    const t = window.setTimeout(() => {
      setToast('');
      clearError();
    }, 2500);
    return () => window.clearTimeout(t);
  }, [ghError, clearError]);

  const hunks = useMemo<DiffHunk[]>(
    () => computeHunks(store.content || '', lastAIContent || ''),
    [store.content, lastAIContent]
  );
  useEffect(() => {
    setSelectedHunks(hunks.map(() => true));
  }, [hunks]);

  const applySelectedHunks = () => {
    const chosen = hunks.filter((_, idx) => selectedHunks[idx]);
    const merged = applyAll(store.content || '', chosen);
    store.setContent(merged);
    store.commit();
    setShowConflictModal(false);
    setShowConflict(false);
  };

  return (
    <div className="app">
      <Toast message={toast} visible={!!toast} />
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>AI Site Generator</h1>
            <p>Create beautiful websites with AI assistance and deploy to GitHub Pages</p>
          </div>
          <div className="header-auth">
            <GitHubAuth />
            <div style={{ marginTop: 6, textAlign: 'right' }}>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setShowWizard(true)}
                title="Open onboarding wizard (? also works)"
              >
                Help / Onboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="workspace">
          <div className="left-panel">
            <div className="panel-tabs">
              <button
                className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                💬 AI Assistant
              </button>
              <button
                className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                ✏️ Editor
              </button>
              <button
                className={`tab-button ${activeTab === 'deploy' ? 'active' : ''}`}
                onClick={() => setActiveTab('deploy')}
                disabled={!isAuthenticated}
              >
                🚀 Deploy
              </button>
            </div>

            <div className="panel-content">
              {activeTab === 'chat' && <ChatInterface onSiteGenerated={handleSiteGenerated} />}

              {activeTab === 'editor' && (
                <div className="editor-section">
                  <div className="editor-header">
                    <h3>Content Editor</h3>
                    {showConflict && (
                      <div
                        style={{
                          background: '#fff3cd',
                          color: '#664d03',
                          border: '1px solid #ffecb5',
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontSize: 12,
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                        }}
                      >
                        <span>New AI reply available.</span>
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => setShowConflictModal(true)}
                          title="Review AI vs current editor content"
                        >
                          Review
                        </button>
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => {
                            if (!lastAIContent) return;
                            store.setContent(lastAIContent);
                            store.commit();
                          }}
                          title="Replace editor with latest AI content"
                          disabled={!lastAIContent}
                        >
                          Apply AI
                        </button>
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => setShowConflict(false)}
                          title="Dismiss"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    {isAuthenticated && user && (
                      <div className="editor-actions">
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => setActiveTab('deploy')}
                        >
                          🚀 Deploy to GitHub Pages
                        </button>
                      </div>
                    )}
                    <div className="editor-actions" style={{ gap: 8, display: 'flex' }}>
                      <button className="btn btn-secondary btn-small" onClick={() => store.undo()}>
                        Undo
                      </button>
                      <button className="btn btn-secondary btn-small" onClick={() => store.redo()}>
                        Redo
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={store.content}
                    onChange={(e) => {
                      store.setContent(e.target.value);
                    }}
                    placeholder="Enter your website content here..."
                    className="content-editor"
                  />
                </div>
              )}

              {activeTab === 'deploy' && (
                <RepositoryCreator
                  content={store.content}
                  onDeploymentComplete={(url) => {
                    console.log('Deployment completed:', url);
                  }}
                />
              )}
            </div>
          </div>

          <div className="right-panel">
            <div className="preview-section">
              <LivePreview content={store.content} />
            </div>
          </div>
        </div>

        <OnboardingWizard
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onOpenEditor={() => setActiveTab('editor')}
          onOpenDeploy={() => setActiveTab('deploy')}
        />

        {showConflictModal && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}
          >
            <div
              style={{
                background: 'white',
                padding: 16,
                borderRadius: 8,
                maxWidth: 1000,
                width: '90%',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h3 style={{ margin: 0 }}>Review AI change</h3>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setShowConflictModal(false)}
                >
                  Close
                </button>
              </div>
              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}
              >
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4, color: '#6b7280' }}>
                    Current editor
                  </div>
                  <textarea value={store.content} readOnly style={{ width: '100%', height: 240 }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, marginBottom: 4, color: '#6b7280' }}>Latest AI</div>
                  <textarea value={lastAIContent} readOnly style={{ width: '100%', height: 240 }} />
                </div>
              </div>
              {hunks.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={showInlineView}
                      onChange={(e) => setShowInlineView(e.target.checked)}
                    />
                    <span>Show visual inline diff</span>
                  </label>
                  {showInlineView && (
                    <div
                      style={{
                        marginTop: 8,
                        maxHeight: 260,
                        overflow: 'auto',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        padding: 8,
                        background: '#f9fafb',
                      }}
                    >
                      <InlineDiffView
                        original={store.content || ''}
                        hunks={hunks.filter((_, i) => selectedHunks[i])}
                      />
                    </div>
                  )}
                </div>
              )}
              {hunks.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Select changes to apply</div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      padding: 8,
                    }}
                  >
                    {hunks.map((h, idx) => (
                      <label
                        key={idx}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedHunks[idx]}
                          onChange={(e) => {
                            const next = [...selectedHunks];
                            next[idx] = e.target.checked;
                            setSelectedHunks(next);
                          }}
                        />
                        <span>
                          At line {h.pos + 1}: remove {h.remove} line(s), add {h.add.length} line(s)
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!lastAIContent) return;
                    store.setContent(lastAIContent);
                    store.commit();
                    setShowConflictModal(false);
                    setShowConflict(false);
                  }}
                  disabled={!lastAIContent}
                >
                  Replace with AI
                </button>
                <button
                  className="btn btn-primary"
                  onClick={applySelectedHunks}
                  disabled={!hunks.length}
                  title="Apply only the selected changes"
                >
                  Apply selected changes
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(lastAIContent || '');
                    } catch {
                      // ignore clipboard errors (e.g., permissions)
                    }
                  }}
                  disabled={!lastAIContent}
                >
                  Copy AI
                </button>
                <button className="btn btn-secondary" onClick={() => setShowConflictModal(false)}>
                  Keep current
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer style={{ textAlign: 'center', padding: 12, color: '#6b7280', fontSize: 12 }}>
        Need help?{' '}
        <button className="btn btn-secondary btn-small" onClick={() => setShowWizard(true)}>
          Open onboarding
        </button>
      </footer>
    </div>
  );
}

export default App;
