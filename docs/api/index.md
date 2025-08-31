# AI Site Generator - API Documentation

## Overview

This document provides comprehensive API documentation for the AI Site Generator application. The application follows Clean Architecture principles with SOLID design patterns, ensuring maintainable and testable code.

## Table of Contents

- [Services API](#services-api)
  - [AI Services](#ai-services)
  - [GitHub Services](#github-services)
- [Hooks API](#hooks-api)
- [Types API](#types-api)
- [Constants API](#constants-api)

## Services API

### AI Services

The AI services provide a unified interface for interacting with various AI providers (Google, OpenAI, Anthropic, Cohere) through a clean abstraction layer.

#### SimpleAIProvider

Main AI provider implementation that handles text generation and streaming.

```typescript
import { SimpleAIProvider } from '@/services/ai/simple-provider';

const provider = new SimpleAIProvider('google', 'gemini-2.0-flash');

// Generate text
const result = await provider.generate([{ role: 'user', content: 'Create a simple HTML page' }], {
  temperature: 0.7,
});

// Stream text generation
for await (const chunk of provider.generateStream([
  { role: 'user', content: 'Create a simple HTML page' },
])) {
  console.log(chunk.text);
}

// Check availability
if (provider.isAvailable()) {
  console.log('Provider is ready');
}

// Get provider type
console.log(provider.getProviderType()); // 'google'
```

**Methods:**

- `generate(messages, options?)` - Generate text synchronously
- `generateStream(messages, options?)` - Generate text as a stream
- `isAvailable()` - Check if provider is available
- `getProviderType()` - Get the provider type string

**Parameters:**

- `messages`: Array of `AIMessage` objects with `role` and `content`
- `options`: Optional `ProviderOptions` for temperature, maxTokens, etc.

#### Segregated Services

Following Interface Segregation Principle, AI functionality is split into focused services:

```typescript
import {
  MessageSenderService,
  ContentGeneratorService,
  StreamingGeneratorService,
  ProviderStatusService,
  TextGeneratorService,
} from '@/services/ai/segregated-services';

// Message sending (conversational)
const messageSender = new MessageSenderService(provider);
await messageSender.sendMessage('Hello AI', { context: 'web-development' });

// Content generation (specific content types)
const contentGenerator = new ContentGeneratorService(provider);
const html = await contentGenerator.generateSiteContent('Create a landing page');

// Streaming generation
const streamingGenerator = new StreamingGeneratorService(provider);
for await (const chunk of streamingGenerator.generateStream(messages)) {
  // Handle streaming chunks
}

// Provider status monitoring
const statusService = new ProviderStatusService(provider);
if (statusService.isAvailable()) {
  // Provider is ready
}
```

#### Provider Health Monitoring

Monitor AI provider health and performance:

```typescript
import { ProviderHealthManager } from '@/services/ai/provider-health';

const healthManager = new ProviderHealthManager(provider);

// Check health
const health = await healthManager.checkHealth();
console.log(health.state); // 'healthy' | 'degraded' | 'unhealthy'

// Get health metrics
const metrics = healthManager.getHealthMetrics();
console.log(metrics.totalChecks, metrics.successfulChecks);

// Reset health status
healthManager.resetHealth();
```

**Health States:**

- `healthy` - Provider is working normally
- `degraded` - Provider has some issues but still functional
- `unhealthy` - Provider is not working
- `unknown` - Health status cannot be determined

### GitHub Services

GitHub integration services for authentication and repository management.

#### GitHub Service Singleton

```typescript
import { getGitHubServiceSingleton } from '@/services/github';

// Get the singleton instance
const githubService = getGitHubServiceSingleton();

// Authenticate user
await githubService.login();

// Get user repositories
const repos = await githubService.getRepositories();

// Create new repository
const newRepo = await githubService.createRepository('my-site', 'AI generated site');

// Deploy to GitHub Pages
const deployUrl = await githubService.deployToPages('my-site', [
  { path: 'index.html', content: '<html>...</html>', message: 'Initial commit' },
]);
```

**Authentication Flow:**

```typescript
// Start device authentication (for CLI/server environments)
const { user_code, verification_uri, expires_in, poll } = await githubService.startDeviceAuth();
console.log(`Visit ${verification_uri} and enter code: ${user_code}`);

// Poll for completion
await poll();

// Logout
await githubService.logout();
```

**Repository Operations:**

```typescript
// List user repositories
const repositories = await githubService.getRepositories();

// Create repository with options
const repo = await githubService.createRepository('my-project', 'Description', {
  private: false,
  autoInit: true,
});

// Deploy content to GitHub Pages
const deploymentUrl = await githubService.deployToPages('my-project', files);
```

## Hooks API

### Core Hooks

#### useChat

Manages chat functionality and AI interactions.

```typescript
import { useChat } from '@/hooks/useChat';

function ChatComponent() {
  const {
    availableProviders,
    selectedProvider,
    ai,
    isReady,
    handleMessage,
    introMessage,
    textInput,
    requestBodyLimits,
    history
  } = useChat();

  const onMessage = (body, signals) => {
    handleMessage(body, {
      onResponse: (payload) => {
        if (payload.error) {
          console.error('AI Error:', payload.error);
        } else {
          console.log('AI Response:', payload.text);
        }
      }
    });
  };

  return (
    <div>
      <p>Available providers: {availableProviders.join(', ')}</p>
      <p>Selected: {selectedProvider}</p>
      <p>Ready: {isReady ? 'Yes' : 'No'}</p>
      {/* Chat UI */}
    </div>
  );
}
```

**Returns:**

- `availableProviders`: Array of available AI provider names
- `selectedProvider`: Currently selected provider
- `ai`: AI provider instance
- `isReady`: Whether the AI provider is ready
- `handleMessage`: Function to send messages to AI
- `introMessage`: Initial message object
- `textInput`: Input configuration
- `requestBodyLimits`: Message limits
- `history`: Chat message history

#### useDeployment

Manages deployment workflow and GitHub Pages deployment.

```typescript
import { useDeployment } from '@/hooks/useDeployment';

function DeploymentComponent() {
  const {
    activeSection,
    content,
    setActiveSection,
    sections
  } = useDeployment();

  return (
    <div>
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={activeSection === section.id ? 'active' : ''}
        >
          {section.icon} {section.label}
        </button>
      ))}

      {activeSection === 'repository' && (
        <RepositorySetup content={content} />
      )}

      {activeSection === 'deployment' && (
        <DeployToPages content={content} />
      )}
    </div>
  );
}
```

**Returns:**

- `activeSection`: Current active section ('repository' | 'deployment')
- `content`: Current site content
- `setActiveSection`: Function to change active section
- `sections`: Array of available sections with labels and icons

#### useEditorContent

Manages editor content state and synchronization.

```typescript
import { useEditorContent } from '@/hooks/useEditorContent';

function EditorComponent() {
  const {
    localContent,
    isDirty,
    handleContentChange,
    handleSave,
    handleBlur,
    resetDirtyState
  } = useEditorContent();

  return (
    <div>
      <textarea
        value={localContent}
        onChange={handleContentChange}
        onBlur={handleBlur}
        className={isDirty ? 'dirty' : ''}
      />

      <button onClick={handleSave} disabled={!isDirty}>
        Save Changes
      </button>

      {isDirty && <span>Unsaved changes</span>}
    </div>
  );
}
```

**Returns:**

- `localContent`: Current editor content
- `isDirty`: Whether content has unsaved changes
- `handleContentChange`: Handle textarea changes
- `handleSave`: Save content to store
- `handleBlur`: Handle blur events (auto-save)
- `resetDirtyState`: Reset dirty flag

#### useEditorState

Composite hook that combines editor functionality.

```typescript
import { useEditorState } from '@/hooks/useEditorState';

function AdvancedEditor() {
  const {
    // Content management
    localContent,
    isDirty,
    handleContentChange,
    handleSave,

    // Syntax highlighting
    syntaxHighlighting,
    detectedLanguage,
    highlightCode,

    // Keyboard shortcuts
    handleKeyDown,

    // View mode
    viewMode,
    setViewMode,
    cycleViewMode,

    // Computed values
    linesCount,
    contentLength,
    canUndo,
    canRedo
  } = useEditorState();

  return (
    <div>
      <div className="editor-toolbar">
        <span>Lines: {linesCount}</span>
        <span>Length: {contentLength}</span>
        <button onClick={cycleViewMode}>
          {viewMode === 'editor' ? 'Preview' : 'Editor'}
        </button>
      </div>

      <textarea
        value={localContent}
        onChange={handleContentChange}
        onKeyDown={handleKeyDown}
        className={isDirty ? 'dirty' : ''}
      />

      <div className="syntax-info">
        <span>Language: {detectedLanguage}</span>
        <span>Syntax highlighting: {syntaxHighlighting ? 'On' : 'Off'}</span>
      </div>
    </div>
  );
}
```

**Returns:**

- Content management: `localContent`, `isDirty`, `handleContentChange`, `handleSave`
- Syntax highlighting: `syntaxHighlighting`, `detectedLanguage`, `highlightCode`
- Keyboard shortcuts: `handleKeyDown`
- View mode: `viewMode`, `setViewMode`, `cycleViewMode`
- Computed values: `linesCount`, `contentLength`, `canUndo`, `canRedo`

#### useGitHub

Manages GitHub authentication and operations.

```typescript
import { useGitHub } from '@/hooks/useGitHub';

function GitHubIntegration() {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    scopes,
    login,
    startDeviceAuth,
    logout,
    repositories,
    createRepository,
    deployToPages,
    refreshRepositories,
    clearError,
    testConnection
  } = useGitHub();

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleCreateRepo = async () => {
    try {
      const repo = await createRepository({
        name: 'my-ai-site',
        description: 'AI-generated website'
      });
      console.log('Created repo:', repo);
    } catch (err) {
      console.error('Failed to create repo:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.login}!</p>
          <button onClick={logout}>Logout</button>

          <div>
            <h3>Your Repositories</h3>
            {repositories.map(repo => (
              <div key={repo.id}>
                <h4>{repo.name}</h4>
                <p>{repo.description}</p>
                <button onClick={() => deployToPages(repo.name, files)}>
                  Deploy to Pages
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with GitHub</button>
      )}
    </div>
  );
}
```

**Returns:**

- Authentication: `isAuthenticated`, `user`, `login`, `logout`, `startDeviceAuth`
- State: `isLoading`, `error`, `scopes`
- Repository operations: `repositories`, `createRepository`, `deployToPages`, `refreshRepositories`
- Utilities: `clearError`, `testConnection`

## Types API

### Core Types

#### AIMessage

```typescript
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

#### ProviderOptions

```typescript
interface ProviderOptions {
  temperature?: number; // 0.0 to 1.0
  maxTokens?: number; // Maximum tokens to generate
  model?: string; // Specific model name
  topP?: number; // Nucleus sampling
  frequencyPenalty?: number;
  presencePenalty?: number;
}
```

#### GenerateResult

```typescript
interface GenerateResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}
```

#### StreamChunk

```typescript
interface StreamChunk {
  text: string;
  done: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}
```

### GitHub Types

#### GitHubUser

```typescript
interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
  html_url: string;
}
```

#### GitHubRepository

```typescript
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  clone_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  language?: string;
  private: boolean;
}
```

#### CreateRepositoryParams

```typescript
interface CreateRepositoryParams {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}
```

### UI Types

#### ViewMode

```typescript
type ViewMode = 'editor' | 'preview' | 'split';
```

#### Theme

```typescript
type Theme = 'light' | 'dark' | 'sci-fi';
```

## Constants API

### AI Constants

```typescript
import { AI_PROVIDERS, DEFAULT_PROVIDER, DEFAULT_MODEL } from '@/constants/ai';

// Available providers
console.log(AI_PROVIDERS); // ['google', 'openai', 'anthropic', 'cohere']

// Default settings
console.log(DEFAULT_PROVIDER); // 'google'
console.log(DEFAULT_MODEL); // 'gemini-2.0-flash'
```

### Route Constants

```typescript
import { ROUTES } from '@/constants/routes';

console.log(ROUTES.HOME); // '/'
console.log(ROUTES.EDITOR); // '/editor'
console.log(ROUTES.DEPLOYMENT); // '/deployment'
```

### Configuration Constants

```typescript
import { readEnv } from '@/constants/config';

// Read environment variables with fallbacks
const apiKey = readEnv('API_KEY', 'DEFAULT_KEY');
const port = readEnv('PORT', '3000');
```

## Error Handling

### AI Service Errors

```typescript
try {
  const result = await provider.generate(messages);
} catch (error) {
  if (error.message.includes('API key not configured')) {
    // Handle missing API key
  } else if (error.message.includes('Provider not available')) {
    // Handle unavailable provider
  } else {
    // Handle other errors
  }
}
```

### GitHub Service Errors

```typescript
try {
  await githubService.login();
} catch (error) {
  if (error.message.includes('authentication')) {
    // Handle auth errors
  } else if (error.message.includes('network')) {
    // Handle network errors
  }
}
```

## Best Practices

### Error Handling

- Always wrap API calls in try-catch blocks
- Provide meaningful error messages to users
- Handle both network and authentication errors

### Performance

- Use streaming for large content generation
- Cache repository data when possible
- Debounce rapid user interactions

### Security

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Validate user input before API calls

### Testing

- Mock external services in unit tests
- Use contract tests for interface compliance
- Test error scenarios thoroughly

---

_This documentation is automatically generated and kept in sync with the codebase. Last updated: August 31, 2025_
