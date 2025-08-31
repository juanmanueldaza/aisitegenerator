# Hooks API Documentation

## Overview

This document provides comprehensive documentation for the custom React hooks used throughout the AI Site Generator application. These hooks follow React best practices and provide clean abstractions for complex state management and side effects.

## Table of Contents

- [Core Hooks](#core-hooks)
- [AI Integration Hooks](#ai-integration-hooks)
- [GitHub Integration Hooks](#github-integration-hooks)
- [UI State Hooks](#ui-state-hooks)
- [Utility Hooks](#utility-hooks)

## Core Hooks

### useAsyncOperation

A generic hook for managing asynchronous operations with loading states, error handling, and cancellation support.

```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

function DataFetcher() {
  const {
    execute,
    cancel,
    status,
    result,
    error,
    progress,
    isLoading,
    isCompleted,
    isError,
    reset
  } = useAsyncOperation();

  const fetchData = async () => {
    await execute(async (signal) => {
      // Check for cancellation
      if (signal.aborted) return;

      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      return data;
    });
  };

  const handleCancel = () => {
    cancel();
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </button>

      {isLoading && (
        <div>
          <progress value={progress} max={100} />
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}

      {isCompleted && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          <button onClick={handleReset}>Reset</button>
        </div>
      )}

      {isError && (
        <div>
          <p>Error: {error?.message}</p>
          <button onClick={handleReset}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

**Parameters:**

- `initialValue?: T` - Initial value for the result
- `onSuccess?: (result: T) => void` - Callback when operation succeeds
- `onError?: (error: Error) => void` - Callback when operation fails
- `onCancel?: () => void` - Callback when operation is cancelled

**Returns:**

- `execute: (operation: (signal: AbortSignal) => Promise<T>) => Promise<void>` - Execute an async operation
- `cancel: () => void` - Cancel the current operation
- `status: 'idle' | 'loading' | 'completed' | 'error' | 'cancelled'` - Current operation status
- `result: T | null` - Operation result
- `error: Error | null` - Operation error
- `progress: number` - Operation progress (0-100)
- `isLoading: boolean` - Whether operation is in progress
- `isCompleted: boolean` - Whether operation completed successfully
- `isError: boolean` - Whether operation failed
- `reset: () => void` - Reset hook state

### useLocalStorage

A hook for managing localStorage with TypeScript support and error handling.

```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage';

function SettingsComponent() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [userPrefs, setUserPrefs] = useLocalStorage('userPrefs', {
    notifications: true,
    autoSave: false
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const updatePrefs = (newPrefs: Partial<typeof userPrefs>) => {
    setUserPrefs({ ...userPrefs, ...newPrefs });
  };

  return (
    <div>
      <h3>Settings</h3>

      <div>
        <label>
          Theme: {theme}
          <button onClick={toggleTheme}>Toggle Theme</button>
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={userPrefs.notifications}
            onChange={(e) => updatePrefs({ notifications: e.target.checked })}
          />
          Enable Notifications
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={userPrefs.autoSave}
            onChange={(e) => updatePrefs({ autoSave: e.target.checked })}
          />
          Auto Save
        </label>
      </div>
    </div>
  );
}
```

**Parameters:**

- `key: string` - localStorage key
- `initialValue: T` - Initial value if key doesn't exist
- `options?: LocalStorageOptions` - Additional options

**LocalStorageOptions:**

```typescript
interface LocalStorageOptions {
  serialize?: (value: T) => string; // Custom serialization function
  deserialize?: (value: string) => T; // Custom deserialization function
  errorHandler?: (error: Error) => void; // Error handling callback
}
```

**Returns:**

- `[value: T, setValue: (value: T | ((prev: T) => T)) => void]` - Value and setter function

## AI Integration Hooks

### useAiSdk

Hook for integrating with Vercel AI SDK with provider management.

```typescript
import { useAiSdk } from '@/hooks/useAiSdk';

function AIChatComponent() {
  const {
    availableProviders,
    selectedProvider,
    setSelectedProvider,
    generateText,
    generateStream,
    isLoading,
    error,
    clearError
  } = useAiSdk();

  const handleGenerate = async () => {
    try {
      const result = await generateText([
        { role: 'user', content: 'Create a simple HTML page' }
      ], {
        temperature: 0.7,
        maxTokens: 1000
      });
      console.log('Generated:', result.text);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleStream = async () => {
    try {
      for await (const chunk of generateStream([
        { role: 'user', content: 'Create a simple HTML page' }
      ])) {
        console.log('Chunk:', chunk.text);
      }
    } catch (err) {
      console.error('Streaming failed:', err);
    }
  };

  return (
    <div>
      <h3>AI Text Generation</h3>

      <div>
        <label>
          Provider:
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            {availableProviders.map(provider => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <button onClick={handleGenerate} disabled={isLoading}>
          Generate Text
        </button>
        <button onClick={handleStream} disabled={isLoading}>
          Stream Text
        </button>
      </div>

      {error && (
        <div style={{ color: 'red' }}>
          Error: {error.message}
          <button onClick={clearError}>Clear</button>
        </div>
      )}
    </div>
  );
}
```

**Returns:**

- `availableProviders: string[]` - List of available AI providers
- `selectedProvider: string` - Currently selected provider
- `setSelectedProvider: (provider: string) => void` - Change selected provider
- `generateText: (messages: AIMessage[], options?: ProviderOptions) => Promise<GenerateResult>` - Generate text synchronously
- `generateStream: (messages: AIMessage[], options?: ProviderOptions) => AsyncIterable<StreamChunk>` - Generate text as stream
- `isLoading: boolean` - Whether generation is in progress
- `error: Error | null` - Generation error
- `clearError: () => void` - Clear error state

### useProviderHealth

Hook for monitoring AI provider health and status.

```typescript
import { useProviderHealth } from '@/hooks/useProviderHealth';

function ProviderStatusComponent() {
  const {
    healthStatus,
    checkHealth,
    isChecking,
    lastChecked,
    getHealthColor,
    getHealthIcon
  } = useProviderHealth();

  const handleCheckHealth = async () => {
    await checkHealth();
  };

  return (
    <div>
      <h3>Provider Health Status</h3>

      <div>
        <button onClick={handleCheckHealth} disabled={isChecking}>
          {isChecking ? 'Checking...' : 'Check Health'}
        </button>
      </div>

      <div>
        <span style={{ color: getHealthColor() }}>
          {getHealthIcon()} Status: {healthStatus.state}
        </span>
      </div>

      {lastChecked && (
        <div>
          Last checked: {lastChecked.toLocaleString()}
        </div>
      )}

      {healthStatus.error && (
        <div style={{ color: 'red' }}>
          Error: {healthStatus.error}
        </div>
      )}
    </div>
  );
}
```

**Returns:**

- `healthStatus: ProviderStatus` - Current health status
- `checkHealth: () => Promise<void>` - Manually check provider health
- `isChecking: boolean` - Whether health check is in progress
- `lastChecked: Date | null` - When health was last checked
- `getHealthColor: () => string` - Get color for health status
- `getHealthIcon: () => string` - Get icon for health status

## GitHub Integration Hooks

### useGitHub

Comprehensive hook for GitHub integration including authentication and repository management.

```typescript
import { useGitHub } from '@/hooks/useGitHub';

function GitHubDashboard() {
  const {
    // Authentication
    isAuthenticated,
    user,
    login,
    logout,
    startDeviceAuth,
    scopes,

    // State
    isLoading,
    error,
    clearError,

    // Repository operations
    repositories,
    createRepository,
    deployToPages,
    refreshRepositories,

    // Utilities
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
        description: 'AI-generated website',
        private: false
      });
      console.log('Created repository:', repo.full_name);
    } catch (err) {
      console.error('Failed to create repository:', err);
    }
  };

  const handleDeploy = async (repoName: string) => {
    try {
      const files = [
        { path: 'index.html', content: '<html>...</html>' },
        { path: 'style.css', content: 'body { ... }' }
      ];
      const url = await deployToPages(repoName, files);
      console.log('Deployed to:', url);
    } catch (err) {
      console.error('Deployment failed:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={clearError}>Clear Error</button>
      </div>
    );
  }

  return (
    <div>
      {!isAuthenticated ? (
        <div>
          <h3>GitHub Authentication</h3>
          <button onClick={handleLogin}>Login with GitHub</button>
          <button onClick={startDeviceAuth}>Device Auth</button>
        </div>
      ) : (
        <div>
          <h3>Welcome, {user?.login}!</h3>
          <p>Scopes: {scopes.join(', ')}</p>
          <button onClick={logout}>Logout</button>

          <div>
            <h4>Repositories</h4>
            <button onClick={refreshRepositories}>Refresh</button>
            <button onClick={handleCreateRepo}>Create New Repo</button>

            <ul>
              {repositories.map(repo => (
                <li key={repo.id}>
                  <strong>{repo.name}</strong>
                  <p>{repo.description}</p>
                  <button onClick={() => handleDeploy(repo.name)}>
                    Deploy to Pages
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Authentication Methods:**

- `login(): Promise<void>` - Web-based OAuth login
- `startDeviceAuth(): Promise<DeviceAuthResponse>` - Device authentication flow
- `logout(): Promise<void>` - Clear authentication

**Repository Methods:**

- `createRepository(params: CreateRepositoryParams): Promise<GitHubRepository>` - Create new repository
- `deployToPages(repo: string, files: FileContent[]): Promise<string>` - Deploy to GitHub Pages
- `refreshRepositories(): Promise<void>` - Refresh repository list

**State:**

- `isAuthenticated: boolean` - Authentication status
- `user: GitHubUser | null` - Current user
- `repositories: GitHubRepository[]` - User's repositories
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message

## UI State Hooks

### useViewMode

Hook for managing different view modes (editor, preview, split).

```typescript
import { useViewMode } from '@/hooks/useViewMode';

function ViewModeController() {
  const {
    viewMode,
    setViewMode,
    cycleViewMode,
    isEditor,
    isPreview,
    isSplit
  } = useViewMode();

  return (
    <div>
      <h3>View Mode: {viewMode}</h3>

      <div>
        <button
          onClick={() => setViewMode('editor')}
          disabled={isEditor}
        >
          Editor
        </button>
        <button
          onClick={() => setViewMode('preview')}
          disabled={isPreview}
        >
          Preview
        </button>
        <button
          onClick={() => setViewMode('split')}
          disabled={isSplit}
        >
          Split
        </button>
      </div>

      <div>
        <button onClick={cycleViewMode}>
          Cycle Mode
        </button>
      </div>

      <div>
        {isEditor && <p>Currently in editor mode</p>}
        {isPreview && <p>Currently in preview mode</p>}
        {isSplit && <p>Currently in split mode</p>}
      </div>
    </div>
  );
}
```

**Returns:**

- `viewMode: ViewMode` - Current view mode ('editor' | 'preview' | 'split')
- `setViewMode: (mode: ViewMode) => void` - Set specific view mode
- `cycleViewMode: () => void` - Cycle through view modes
- `isEditor: boolean` - Whether current mode is editor
- `isPreview: boolean` - Whether current mode is preview
- `isSplit: boolean` - Whether current mode is split

### useKeyboardShortcuts

Hook for managing keyboard shortcuts and hotkeys.

```typescript
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function EditorWithShortcuts() {
  const {
    registerShortcut,
    unregisterShortcut,
    isShortcutPressed,
    getActiveShortcuts
  } = useKeyboardShortcuts();

  useEffect(() => {
    // Register common shortcuts
    registerShortcut('save', ['ctrl+s', 'cmd+s'], (event) => {
      event.preventDefault();
      handleSave();
    });

    registerShortcut('preview', ['ctrl+p', 'cmd+p'], (event) => {
      event.preventDefault();
      togglePreview();
    });

    registerShortcut('new', ['ctrl+n', 'cmd+n'], (event) => {
      event.preventDefault();
      createNew();
    });

    return () => {
      unregisterShortcut('save');
      unregisterShortcut('preview');
      unregisterShortcut('new');
    };
  }, []);

  const handleSave = () => {
    console.log('Saving...');
  };

  const togglePreview = () => {
    console.log('Toggling preview...');
  };

  const createNew = () => {
    console.log('Creating new...');
  };

  return (
    <div>
      <h3>Editor with Shortcuts</h3>

      <div>
        <p>Active shortcuts: {getActiveShortcuts().join(', ')}</p>
      </div>

      <div>
        <button onClick={handleSave}>Save (Ctrl+S)</button>
        <button onClick={togglePreview}>Preview (Ctrl+P)</button>
        <button onClick={createNew}>New (Ctrl+N)</button>
      </div>

      <div>
        <p>Ctrl+S pressed: {isShortcutPressed('ctrl+s') ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
```

**Parameters:**

- `options?: KeyboardOptions` - Configuration options

**KeyboardOptions:**

```typescript
interface KeyboardOptions {
  preventDefault?: boolean; // Prevent default browser behavior
  stopPropagation?: boolean; // Stop event propagation
  target?: HTMLElement; // Target element for shortcuts
  caseSensitive?: boolean; // Case sensitivity for shortcuts
}
```

**Returns:**

- `registerShortcut: (id: string, keys: string[], handler: KeyboardHandler) => void` - Register a shortcut
- `unregisterShortcut: (id: string) => void` - Unregister a shortcut
- `isShortcutPressed: (shortcut: string) => boolean` - Check if shortcut is currently pressed
- `getActiveShortcuts: () => string[]` - Get list of active shortcuts

## Utility Hooks

### useSyntaxHighlighting

Hook for syntax highlighting with Prism.js integration.

```typescript
import { useSyntaxHighlighting } from '@/hooks/useSyntaxHighlighting';

function CodeEditor() {
  const [code, setCode] = useState('<html>...</html>');
  const {
    highlightedCode,
    detectedLanguage,
    highlightCode,
    supportedLanguages,
    isHighlighting
  } = useSyntaxHighlighting();

  useEffect(() => {
    highlightCode(code);
  }, [code, highlightCode]);

  return (
    <div>
      <h3>Code Editor with Syntax Highlighting</h3>

      <div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code here..."
        />
      </div>

      <div>
        <p>Detected Language: {detectedLanguage}</p>
        <p>Supported Languages: {supportedLanguages.join(', ')}</p>
      </div>

      <div>
        <h4>Highlighted Output:</h4>
        {isHighlighting ? (
          <p>Loading...</p>
        ) : (
          <pre dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        )}
      </div>
    </div>
  );
}
```

**Returns:**

- `highlightedCode: string` - HTML with syntax highlighting
- `detectedLanguage: string` - Auto-detected language
- `highlightCode: (code: string, language?: string) => void` - Highlight code
- `supportedLanguages: string[]` - List of supported languages
- `isHighlighting: boolean` - Whether highlighting is in progress

### useSettings

Hook for managing application settings with persistence.

```typescript
import { useSettings } from '@/hooks/useSettings';

function SettingsPanel() {
  const {
    settings,
    updateSetting,
    resetSetting,
    resetAllSettings,
    exportSettings,
    importSettings,
    isDirty
  } = useSettings();

  const handleUpdateTheme = (theme: string) => {
    updateSetting('theme', theme);
  };

  const handleUpdateFontSize = (size: number) => {
    updateSetting('fontSize', size);
  };

  const handleExport = () => {
    const settingsJson = exportSettings();
    // Download or copy to clipboard
    console.log('Settings exported:', settingsJson);
  };

  const handleImport = (settingsJson: string) => {
    try {
      importSettings(settingsJson);
    } catch (err) {
      console.error('Failed to import settings:', err);
    }
  };

  return (
    <div>
      <h3>Application Settings</h3>

      <div>
        <label>
          Theme:
          <select
            value={settings.theme}
            onChange={(e) => handleUpdateTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="sci-fi">Sci-Fi</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Font Size:
          <input
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={(e) => handleUpdateFontSize(Number(e.target.value))}
          />
          {settings.fontSize}px
        </label>
      </div>

      <div>
        <button onClick={() => resetSetting('theme')}>Reset Theme</button>
        <button onClick={() => resetSetting('fontSize')}>Reset Font Size</button>
        <button onClick={resetAllSettings}>Reset All</button>
      </div>

      <div>
        <button onClick={handleExport}>Export Settings</button>
        <button onClick={() => handleImport('{"theme":"dark","fontSize":16}')}>
          Import Settings
        </button>
      </div>

      {isDirty && <p>You have unsaved changes</p>}
    </div>
  );
}
```

**Returns:**

- `settings: AppSettings` - Current settings object
- `updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void` - Update a specific setting
- `resetSetting: (key: keyof AppSettings) => void` - Reset a setting to default
- `resetAllSettings: () => void` - Reset all settings to defaults
- `exportSettings: () => string` - Export settings as JSON string
- `importSettings: (settingsJson: string) => void` - Import settings from JSON string
- `isDirty: boolean` - Whether settings have unsaved changes

---

_This hooks documentation is automatically generated from the TypeScript definitions in the codebase. Last updated: August 31, 2025_
