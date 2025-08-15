import { useState } from 'react'
import { useGemini } from './hooks/useGemini'
import { isGeminiConfigured } from './config/gemini'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const gemini = useGemini()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    
    await gemini.generateText({ prompt })
  }

  const rateLimitInfo = gemini.getRateLimitInfo()
  const usageStats = gemini.getUsageStats()

  return (
    <div className="app">
      <header>
        <h1>AI Site Generator</h1>
        <p>Powered by Google Gemini AI</p>
      </header>

      {!gemini.isConfigured && (
        <div className="error-banner">
          <h3>⚠️ Gemini API Not Configured</h3>
          <p>
            To use the AI features, you need to configure your Gemini API key:
          </p>
          <ol>
            <li>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Copy the <code>.env.example</code> file to <code>.env</code></li>
            <li>Add your API key to <code>VITE_GEMINI_API_KEY</code> in the <code>.env</code> file</li>
            <li>Restart the development server</li>
          </ol>
        </div>
      )}

      {gemini.isConfigured && (
        <main>
          <div className="chat-container">
            <form onSubmit={handleSubmit} className="prompt-form">
              <div className="input-group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the website you want to create..."
                  rows={4}
                  disabled={gemini.isLoading || !gemini.isConfigured}
                />
                <button 
                  type="submit" 
                  disabled={gemini.isLoading || !prompt.trim() || !gemini.isConfigured}
                >
                  {gemini.isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>

            {gemini.error && (
              <div className="error-message">
                <h4>Error: {gemini.error.code}</h4>
                <p>{gemini.error.message}</p>
                <button onClick={gemini.clearError}>Dismiss</button>
              </div>
            )}

            {gemini.response && (
              <div className="response">
                <h3>AI Response:</h3>
                <div className="response-content">
                  {gemini.response.text}
                </div>
                <div className="response-meta">
                  <small>
                    Tokens used: {gemini.response.tokensUsed} | 
                    Generated at: {new Date(gemini.response.timestamp).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            )}
          </div>

          <aside className="stats-panel">
            <h3>Usage Statistics</h3>
            <div className="stats">
              <div className="stat">
                <label>Requests Today:</label>
                <span>{usageStats.requestsToday}</span>
              </div>
              <div className="stat">
                <label>Tokens Used Today:</label>
                <span>{usageStats.tokensUsedToday}</span>
              </div>
              <div className="stat">
                <label>Requests This Hour:</label>
                <span>{usageStats.requestsThisHour}</span>
              </div>
            </div>

            <h3>Rate Limiting</h3>
            <div className="stats">
              <div className="stat">
                <label>Requests Remaining:</label>
                <span>{rateLimitInfo.requestsRemaining}</span>
              </div>
              <div className="stat">
                <label>Reset Time:</label>
                <span>{new Date(rateLimitInfo.resetTime).toLocaleTimeString()}</span>
              </div>
            </div>
          </aside>
        </main>
      )}
    </div>
  )
}

export default App
