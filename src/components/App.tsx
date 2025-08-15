import React from 'react';
import { useResponseManager } from '../hooks/useResponseManager';
import ResponseDisplay from '../components/ResponseDisplay';
import { GeminiResponse } from '../types/gemini';
import '../styles/components.css';

const App: React.FC = () => {
  const { responses, addResponse, executeAction, createMockResponse } = useResponseManager({
    onActionExecuted: (action, response) => {
      console.log('Action executed:', action.label, 'on response:', response.id);
    },
    onError: (error) => {
      console.error('Action failed:', error.message);
    }
  });

  const handleAddMockResponse = (type: GeminiResponse['type'], content: string) => {
    const response = createMockResponse(type, content);
    addResponse(response);
  };

  const demoResponses = [
    {
      type: 'text' as const,
      content: 'Welcome to the AI Site Generator! I\'ll help you create an amazing website step by step. Let\'s start by discussing your project goals and requirements.'
    },
    {
      type: 'code' as const,
      content: `Here's a starter HTML template for your website:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome Website</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to My Website</h1>
        <p>This is a beautiful website created with AI assistance!</p>
    </div>
</body>
</html>
\`\`\`

This template provides a clean, centered layout with modern styling.`
    },
    {
      type: 'markdown' as const,
      content: `# Website Structure Recommendations

Based on your requirements, here's the recommended structure for your website:

## Pages to Include
1. **Homepage** - Welcome visitors and showcase your main value proposition
2. **About** - Tell your story and build trust
3. **Services/Products** - Detail what you offer
4. **Contact** - Make it easy for people to reach you

## Key Features
- **Responsive design** for mobile and desktop
- **Fast loading** with optimized images
- **SEO-friendly** structure
- **Accessible** to all users

> **Tip**: Start with a simple structure and expand as needed. You can always add more pages later!

Would you like me to help you create any of these pages?`
    },
    {
      type: 'suggestion' as const,
      content: `I notice you're building a business website. Here are some suggestions to make it more effective:

1. **Add a call-to-action button** to your homepage
2. **Include social proof** like testimonials or reviews
3. **Optimize for mobile** devices first
4. **Add contact forms** to capture leads

\`\`\`css
/* Suggested button styling */
.cta-button {
    background: #007bff;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.cta-button:hover {
    background: #0056b3;
}
\`\`\`

Would you like me to implement any of these suggestions?`
    },
    {
      type: 'error' as const,
      content: 'Unable to process your request due to network connectivity issues. Please check your internet connection and try again.'
    }
  ];

  return (
    <div className="app">
      <div className="app-header">
        <h1>AI Site Generator - Response Processing Demo</h1>
        <p>This demo showcases how Gemini AI responses are processed and displayed in the application.</p>
      </div>

      <div className="app-controls">
        <h2>Demo Controls</h2>
        <div className="demo-buttons">
          {demoResponses.map((demo, index) => (
            <button
              key={index}
              onClick={() => handleAddMockResponse(demo.type, demo.content)}
              className="demo-button"
            >
              Add {demo.type} Response
            </button>
          ))}
        </div>
      </div>

      <div className="app-content">
        <h2>AI Responses ({responses.length})</h2>
        {responses.length === 0 ? (
          <div className="empty-state">
            <p>No responses yet. Use the demo controls above to add sample responses.</p>
          </div>
        ) : (
          <div className="responses-list">
            {responses.map((response) => (
              <ResponseDisplay
                key={response.id}
                response={response}
                onAction={(action) => executeAction(action, response)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;