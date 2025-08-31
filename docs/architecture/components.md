# Component Architecture Patterns

## Overview

This document outlines the component architecture patterns used in the AI Site Generator application, focusing on React component design, composition patterns, and best practices for maintainable UI code.

## Table of Contents

- [Component Organization](#component-organization)
- [Composition Patterns](#composition-patterns)
- [State Management Patterns](#state-management-patterns)
- [Performance Patterns](#performance-patterns)
- [Testing Patterns](#testing-patterns)

## Component Organization

### File Structure

```
src/components/
├── ui/                    # Base UI components (Button, Input, Card, etc.)
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── ...
├── layout/               # Layout components
│   ├── Header/
│   ├── Sidebar/
│   └── MainLayout/
├── features/             # Feature-specific components
│   ├── auth/
│   ├── chat/
│   ├── editor/
│   └── deployment/
├── pages/               # Page components
│   ├── HomePage/
│   ├── EditorPage/
│   └── DeploymentPage/
└── index.ts            # Component exports
```

### Component Categories

#### 1. UI Components (Atomic)

Basic, reusable UI components that form the foundation of the design system.

```typescript
// src/components/ui/Button/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    isLoading && 'btn-loading',
    className
  );

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      {isLoading ? 'Loading...' : children}
      {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>
  );
}
```

#### 2. Layout Components

Components that define the structure and layout of the application.

```typescript
// src/components/layout/MainLayout/MainLayout.tsx
interface MainLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function MainLayout({
  header,
  sidebar,
  footer,
  children
}: MainLayoutProps) {
  return (
    <div className="main-layout">
      {header && <header className="layout-header">{header}</header>}

      <div className="layout-content">
        {sidebar && (
          <aside className="layout-sidebar">
            {sidebar}
          </aside>
        )}

        <main className="layout-main">
          {children}
        </main>
      </div>

      {footer && <footer className="layout-footer">{footer}</footer>}
    </div>
  );
}
```

#### 3. Feature Components

Components specific to application features, containing business logic.

```typescript
// src/components/features/chat/ChatInterface/ChatInterface.tsx
export function ChatInterface() {
  const { messages, sendMessage, isTyping } = useChat();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    await sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="chat-interface">
      <MessageList messages={messages} />

      <form onSubmit={handleSubmit} className="chat-input-form">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isTyping}
        />
        <Button type="submit" disabled={isTyping || !inputValue.trim()}>
          Send
        </Button>
      </form>

      {isTyping && <TypingIndicator />}
    </div>
  );
}
```

#### 4. Page Components

Top-level components that represent entire pages or routes.

```typescript
// src/components/pages/EditorPage/EditorPage.tsx
export function EditorPage() {
  const { content, isDirty, saveContent } = useEditorContent();
  const { deployToPages } = useDeployment();

  const handleSave = async () => {
    await saveContent();
  };

  const handleDeploy = async () => {
    if (isDirty) {
      await saveContent();
    }
    await deployToPages();
  };

  return (
    <MainLayout
      header={<EditorHeader />}
      sidebar={<EditorSidebar />}
    >
      <div className="editor-page">
        <EditorToolbar
          onSave={handleSave}
          onDeploy={handleDeploy}
          isDirty={isDirty}
        />

        <Editor content={content} />

        <PreviewPanel content={content} />
      </div>
    </MainLayout>
  );
}
```

## Composition Patterns

### 1. Compound Components Pattern

Create components that work together as a cohesive unit.

```typescript
// src/components/ui/Tabs/Tabs.tsx
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultActive?: string;
  activeTab?: string;
  onChange?: (activeTab: string) => void;
  children: React.ReactNode;
}

export function Tabs({
  defaultActive,
  activeTab: controlledActiveTab,
  onChange,
  children
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultActive || '');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const setActiveTab = useCallback((id: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(id);
    }
    onChange?.(id);
  }, [controlledActiveTab, onChange]);

  const contextValue = useMemo(() => ({
    activeTab,
    setActiveTab
  }), [activeTab, setActiveTab]);

  return (
    <TabsContext.Provider value={contextValue}>
      {children}
    </TabsContext.Provider>
  );
}

interface TabProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function Tab({ id, title, children }: TabProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab must be used within Tabs');
  }

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === id;

  return (
    <div className="tab">
      <button
        className={clsx('tab-button', isActive && 'active')}
        onClick={() => setActiveTab(id)}
      >
        {title}
      </button>
      {isActive && <div className="tab-content">{children}</div>}
    </div>
  );
}

// Usage
function App() {
  return (
    <Tabs defaultActive="profile">
      <Tab id="profile" title="Profile">
        <UserProfile />
      </Tab>
      <Tab id="settings" title="Settings">
        <UserSettings />
      </Tab>
      <Tab id="security" title="Security">
        <SecuritySettings />
      </Tab>
    </Tabs>
  );
}
```

### 2. Render Props Pattern

Share code between components using a prop whose value is a function.

```typescript
// src/components/common/DataFetcher/DataFetcher.tsx
interface DataFetcherProps<T> {
  fetchData: () => Promise<T>;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
  }) => React.ReactNode;
  initialData?: T;
}

export function DataFetcher<T>({
  fetchData,
  children,
  initialData = null
}: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <>
      {children({
        data,
        loading,
        error,
        refetch: fetch
      })}
    </>
  );
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  return (
    <DataFetcher fetchData={() => api.getUser(userId)}>
      {({ data: user, loading, error, refetch }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error.message}</div>;
        if (!user) return <div>User not found</div>;

        return (
          <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <button onClick={refetch}>Refresh</button>
          </div>
        );
      }}
    </DataFetcher>
  );
}
```

### 3. Higher-Order Components (HOC) Pattern

Enhance components with additional functionality.

```typescript
// src/components/common/withErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error }>
) {
  const WrappedComponent = (props: P) => {
    const [errorState, setErrorState] = useState<ErrorBoundaryState>({
      hasError: false,
      error: null
    });

    const resetError = useCallback(() => {
      setErrorState({ hasError: false, error: null });
    }, []);

    if (errorState.hasError) {
      const FallbackComponent = fallback || DefaultErrorFallback;
      return <FallbackComponent error={errorState.error!} />;
    }

    return (
      <ErrorBoundary
        onError={(error) => setErrorState({ hasError: true, error })}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Usage
const SafeUserProfile = withErrorBoundary(UserProfile, CustomErrorFallback);
```

### 4. Hooks Composition Pattern

Combine multiple hooks to create complex behavior.

```typescript
// src/hooks/useForm.ts
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: yup.ObjectSchema<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));

    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setTouched = useCallback(<K extends keyof T>(field: K) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validate = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: Partial<Record<keyof T, string>> = {};
        err.inner.forEach(error => {
          if (error.path) {
            validationErrors[error.path as keyof T] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    setIsSubmitting(true);

    const isValid = await validate();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setTouched,
    validate,
    handleSubmit,
    reset
  };
}

// Usage
function ContactForm() {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setTouched,
    handleSubmit
  } = useForm({
    name: '',
    email: '',
    message: ''
  }, contactSchema);

  const onSubmit = async (formValues: typeof values) => {
    await api.sendContactForm(formValues);
    alert('Message sent!');
  };

  return (
    <form onSubmit={() => handleSubmit(onSubmit)}>
      <Input
        label="Name"
        value={values.name}
        onChange={(e) => setValue('name', e.target.value)}
        onBlur={() => setTouched('name')}
        error={touched.name ? errors.name : undefined}
      />

      <Input
        label="Email"
        type="email"
        value={values.email}
        onChange={(e) => setValue('email', e.target.value)}
        onBlur={() => setTouched('email')}
        error={touched.email ? errors.email : undefined}
      />

      <Textarea
        label="Message"
        value={values.message}
        onChange={(e) => setValue('message', e.target.value)}
        onBlur={() => setTouched('message')}
        error={touched.message ? errors.message : undefined}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
```

## State Management Patterns

### 1. Local Component State

For component-specific state that doesn't need to be shared.

```typescript
function SearchInput() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await api.search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  return (
    <div className="search-input">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {isSearching && <div>Searching...</div>}

      {results.length > 0 && (
        <ul className="search-results">
          {results.map(result => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 2. Zustand Store Pattern

For global application state that needs to be shared across components.

```typescript
// src/store/userStore.ts
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authService.login(credentials);
      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    set({ isLoading: true, error: null });

    try {
      const updatedUser = await userService.updateProfile(user.id, updates);
      set({
        user: updatedUser,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Update failed',
        isLoading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

// Usage
function UserProfile() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    updateProfile,
    clearError
  } = useUserStore();

  const handleUpdateName = async (newName: string) => {
    try {
      await updateProfile({ name: newName });
    } catch (error) {
      // Error is already handled in the store
    }
  };

  if (!isAuthenticated) return <LoginForm />;

  return (
    <div>
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      <h2>{user?.name}</h2>

      <input
        value={user?.name || ''}
        onChange={(e) => handleUpdateName(e.target.value)}
        disabled={isLoading}
      />
    </div>
  );
}
```

### 3. Custom Hook State Management

For complex state logic that can be reused across components.

```typescript
// src/hooks/useAsyncData.ts
export function useAsyncData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch
  };
}

// Usage
function UserList() {
  const {
    data: users,
    loading,
    error,
    refetch
  } = useAsyncData(
    () => api.getUsers(),
    [] // Empty dependencies means fetch once on mount
  );

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Performance Patterns

### 1. Memoization

```typescript
// Memoize expensive calculations
const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  filter
}: {
  data: DataItem[];
  filter: string;
}) {
  const filteredData = useMemo(() => {
    console.log('Filtering data...'); // Only logs when dependencies change
    return data.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  return (
    <ul>
      {filteredData.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// Memoize callback functions
function DataList({ items, onItemClick }: DataListProps) {
  const handleItemClick = useCallback((item: DataItem) => {
    onItemClick(item.id);
  }, [onItemClick]);

  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => handleItemClick(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### 2. Code Splitting

```typescript
// Lazy load components
const LazyUserProfile = lazy(() => import('./UserProfile'));
const LazyAdminPanel = lazy(() => import('./AdminPanel'));

function App() {
  const [currentView, setCurrentView] = useState<'profile' | 'admin'>('profile');

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {currentView === 'profile' && <LazyUserProfile />}
      {currentView === 'admin' && <LazyAdminPanel />}
    </Suspense>
  );
}

// Lazy load routes
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./Dashboard'))
  },
  {
    path: '/reports',
    component: lazy(() => import('./Reports'))
  }
];
```

### 3. Virtualization

```typescript
// Virtualize large lists
function VirtualizedList({ items }: { items: DataItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: '400px',
        overflow: 'auto'
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing Patterns

### 1. Component Testing

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn', 'btn-primary', 'btn-md');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);

    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn-loading');
  });

  it('renders with icons', () => {
    const { container } = render(
      <Button leftIcon={<span>←</span>} rightIcon={<span>→</span>}>
        Click me
      </Button>
    );

    expect(container.querySelector('.btn-icon-left')).toBeInTheDocument();
    expect(container.querySelector('.btn-icon-right')).toBeInTheDocument();
  });
});
```

### 2. Custom Hook Testing

```typescript
// useForm.test.ts
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useForm({ name: '', email: '' }));

    expect(result.current.values).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('updates field values', () => {
    const { result } = renderHook(() => useForm({ name: '', email: '' }));

    act(() => {
      result.current.setValue('name', 'John Doe');
    });

    expect(result.current.values.name).toBe('John Doe');
  });

  it('handles form submission', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useForm({ name: 'John', email: 'john@example.com' }));

    await act(async () => {
      await result.current.handleSubmit(onSubmit);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
    });
  });
});
```

### 3. Integration Testing

```typescript
// ChatInterface.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from './ChatInterface';

describe('ChatInterface', () => {
  it('sends message and displays response', async () => {
    // Mock the chat hook
    jest.mock('./useChat', () => ({
      useChat: () => ({
        messages: [
          { id: '1', role: 'user', content: 'Hello' },
          { id: '2', role: 'assistant', content: 'Hi there!' }
        ],
        sendMessage: jest.fn(),
        isTyping: false
      })
    }));

    render(<ChatInterface />);

    // Check that messages are displayed
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();

    // Type and send a new message
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    await userEvent.type(input, 'How are you?');
    await userEvent.click(sendButton);

    // Verify the send function was called
    expect(mockSendMessage).toHaveBeenCalledWith('How are you?');
  });
});
```

---

_This component architecture documentation is automatically generated and kept in sync with the codebase. Last updated: August 31, 2025_
