import { useState } from 'react';
import LivePreview from './components/LivePreview/LivePreview';
import './App.css';

const SAMPLE_CONTENT = `# Welcome to AI Site Generator

This is a sample website being generated. The content you see here will be displayed in the live preview component.

## Features

- Real-time preview
- Device simulation
- Responsive design
- Secure iframe rendering

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Site Generator - Live Preview Demo</h1>
        <p>See your website come to life as you build it</p>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <h2>Content Editor</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your website content here..."
            className="content-editor"
          />
        </div>

        <div className="preview-section">
          <LivePreview content={content} />
        </div>
      </main>
    </div>
  );
}

export default App;
