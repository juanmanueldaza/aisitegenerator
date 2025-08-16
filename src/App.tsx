import { useState } from 'react';
import LivePreview from './components/LivePreview/LivePreview';
import GitHubAuth from './components/auth/GitHubAuth';
import ChatInterface from './components/chat/ChatInterface';
import RepositoryCreator from './components/deployment/RepositoryCreator';
import { useGitHub } from './hooks/useGitHub';
import './App.css';

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
  const [content, setContent] = useState(SAMPLE_CONTENT);
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'deploy'>('chat');
  const { isAuthenticated, user } = useGitHub();

  const handleSiteGenerated = (siteData: { content?: string }) => {
    // Handle AI-generated site data
    if (siteData && siteData.content) {
      setContent(siteData.content);
      setActiveTab('editor');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>AI Site Generator</h1>
            <p>Create beautiful websites with AI assistance and deploy to GitHub Pages</p>
          </div>
          <div className="header-auth">
            <GitHubAuth />
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
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your website content here..."
                    className="content-editor"
                  />
                </div>
              )}

              {activeTab === 'deploy' && (
                <RepositoryCreator
                  content={content}
                  onDeploymentComplete={(url) => {
                    console.log('Deployment completed:', url);
                  }}
                />
              )}
            </div>
          </div>

          <div className="right-panel">
            <div className="preview-section">
              <LivePreview content={content} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
