# Architectural Patterns Documentation

## Overview

This document outlines the architectural patterns and design decisions implemented in the AI Site Generator application. The architecture follows Clean Architecture principles with SOLID design patterns, emphasizing maintainability, testability, and extensibility.

## Table of Contents

- [Clean Architecture](#clean-architecture)
- [SOLID Principles Implementation](#solid-principles-implementation)
- [Component Architecture](#component-architecture)
- [State Management Patterns](#state-management-patterns)
- [Service Layer Architecture](#service-layer-architecture)
- [Testing Architecture](#testing-architecture)
- [Error Handling Patterns](#error-handling-patterns)

## Clean Architecture

The application follows Clean Architecture principles with clear separation of concerns across multiple layers:

### Layer Structure

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  - React Components                 │
│  - Custom Hooks                     │
│  - UI Logic                         │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│       Application Layer             │
│  - Use Cases                        │
│  - Application Services             │
│  - Business Logic                   │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│       Domain Layer                  │
│  - Entities                         │
│  - Domain Services                  │
│  - Business Rules                   │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│     Infrastructure Layer            │
│  - External APIs                    │
│  - Database                         │
│  - File System                      │
└─────────────────────────────────────┘
```

### Layer Responsibilities

#### Presentation Layer

- **Components**: React functional components with hooks
- **Hooks**: Custom hooks encapsulating component logic
- **UI Logic**: View-specific business logic
- **State Management**: Local component state and global state integration

#### Application Layer

- **Use Cases**: Application-specific business logic
- **Services**: Coordination between domain and infrastructure
- **DTOs**: Data transfer objects for API communication
- **Validation**: Input validation and business rule enforcement

#### Domain Layer

- **Entities**: Core business objects with business rules
- **Domain Services**: Business logic that doesn't belong to entities
- **Value Objects**: Immutable objects representing concepts
- **Domain Events**: Events representing business occurrences

#### Infrastructure Layer

- **Repositories**: Data access abstractions
- **External APIs**: Third-party service integrations
- **Persistence**: Database and file system operations
- **Frameworks**: External framework integrations

### Dependency Direction

Dependencies flow inward:

- **Outer layers** depend on **inner layers**
- **Inner layers** have no knowledge of **outer layers**
- **Interfaces** are defined in inner layers
- **Implementations** are in outer layers

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

Each class, function, or module has one reason to change:

```typescript
// ❌ Bad: Multiple responsibilities
class UserManager {
  createUser(userData: UserData): User {
    // Validate input
    // Create user entity
    // Save to database
    // Send welcome email
    // Log activity
  }
}

// ✅ Good: Single responsibility per class
class UserValidator {
  validate(userData: UserData): ValidationResult {
    // Only validation logic
  }
}

class UserRepository {
  save(user: User): Promise<User> {
    // Only data persistence
  }
}

class EmailService {
  sendWelcomeEmail(user: User): Promise<void> {
    // Only email sending
  }
}

class UserService {
  constructor(
    private validator: UserValidator,
    private repository: UserRepository,
    private emailService: EmailService
  ) {}

  async createUser(userData: UserData): Promise<User> {
    const validation = this.validator.validate(userData);
    if (!validation.isValid) throw new ValidationError(validation.errors);

    const user = new User(userData);
    const savedUser = await this.repository.save(user);
    await this.emailService.sendWelcomeEmail(savedUser);

    return savedUser;
  }
}
```

### Open/Closed Principle (OCP)

Software entities should be open for extension but closed for modification:

```typescript
// ✅ Good: Extensible provider system
interface IAIProvider {
  generate(messages: AIMessage[]): Promise<GenerateResult>;
  getProviderType(): string;
}

class GoogleProvider implements IAIProvider {
  async generate(messages: AIMessage[]): Promise<GenerateResult> {
    // Google-specific implementation
  }

  getProviderType(): string {
    return 'google';
  }
}

class OpenAIProvider implements IAIProvider {
  async generate(messages: AIMessage[]): Promise<GenerateResult> {
    // OpenAI-specific implementation
  }

  getProviderType(): string {
    return 'openai';
  }
}

// Easy to add new providers without modifying existing code
class AnthropicProvider implements IAIProvider {
  async generate(messages: AIMessage[]): Promise<GenerateResult> {
    // Anthropic-specific implementation
  }

  getProviderType(): string {
    return 'anthropic';
  }
}
```

### Liskov Substitution Principle (LSP)

Subtypes must be substitutable for their base types:

```typescript
// ✅ Good: Proper inheritance hierarchy
interface IShape {
  area(): number;
  perimeter(): number;
}

class Rectangle implements IShape {
  constructor(
    private width: number,
    private height: number
  ) {}

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }

  // Rectangle-specific methods
  getWidth(): number {
    return this.width;
  }
  getHeight(): number {
    return this.height;
  }
}

class Square extends Rectangle {
  constructor(side: number) {
    super(side, side);
  }

  // Square-specific methods
  getSide(): number {
    return this.getWidth();
  }
}

// LSP compliant: Square can be used anywhere Rectangle is expected
function printShapeInfo(shape: IShape): void {
  console.log(`Area: ${shape.area()}`);
  console.log(`Perimeter: ${shape.perimeter()}`);
}

const rectangle = new Rectangle(4, 5);
const square = new Square(4);

printShapeInfo(rectangle); // Works
printShapeInfo(square); // Works - LSP satisfied
```

### Interface Segregation Principle (ISP)

Clients should not be forced to depend on interfaces they don't use:

```typescript
// ❌ Bad: Fat interface
interface IWorker {
  work(): void;
  eat(): void;
  sleep(): void;
}

class Robot implements IWorker {
  work(): void {
    /* Robot working */
  }
  eat(): void {
    throw new Error("Robots don't eat");
  } // Forced implementation
  sleep(): void {
    throw new Error("Robots don't sleep");
  } // Forced implementation
}

// ✅ Good: Segregated interfaces
interface IWorkable {
  work(): void;
}

interface IEatable {
  eat(): void;
}

interface ISleepable {
  sleep(): void;
}

class Human implements IWorkable, IEatable, ISleepable {
  work(): void {
    /* Human working */
  }
  eat(): void {
    /* Human eating */
  }
  sleep(): void {
    /* Human sleeping */
  }
}

class Robot implements IWorkable {
  work(): void {
    /* Robot working */
  }
  // No forced implementations
}
```

### Dependency Inversion Principle (DIP)

High-level modules should not depend on low-level modules. Both should depend on abstractions:

```typescript
// ❌ Bad: High-level module depends on low-level module
class OrderService {
  constructor(private repository: MySQLOrderRepository) {} // Direct dependency

  async createOrder(orderData: OrderData): Promise<Order> {
    // Business logic
    return this.repository.save(orderData);
  }
}

// ✅ Good: Both depend on abstraction
interface IOrderRepository {
  save(orderData: OrderData): Promise<Order>;
  findById(id: string): Promise<Order | null>;
}

class MySQLOrderRepository implements IOrderRepository {
  async save(orderData: OrderData): Promise<Order> {
    // MySQL implementation
  }

  async findById(id: string): Promise<Order | null> {
    // MySQL implementation
  }
}

class MongoOrderRepository implements IOrderRepository {
  async save(orderData: OrderData): Promise<Order> {
    // MongoDB implementation
  }

  async findById(id: string): Promise<Order | null> {
    // MongoDB implementation
  }
}

class OrderService {
  constructor(private repository: IOrderRepository) {} // Depends on abstraction

  async createOrder(orderData: OrderData): Promise<Order> {
    // Business logic
    return this.repository.save(orderData);
  }
}
```

## Component Architecture

### Component Patterns

#### Container/Presentational Pattern

```typescript
// Presentational Component - Only UI concerns
interface UserProfileProps {
  user: User;
  onEdit: () => void;
  isLoading: boolean;
}

function UserProfile({ user, onEdit, isLoading }: UserProfileProps) {
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={onEdit}>Edit Profile</button>
    </div>
  );
}

// Container Component - Business logic and state
function UserProfileContainer() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    // Edit logic
  };

  return (
    <UserProfile
      user={user}
      onEdit={handleEdit}
      isLoading={isLoading}
    />
  );
}
```

#### Custom Hook Pattern

```typescript
// Custom hook encapsulates related logic
function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await userService.updateUser(user.id, updates);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }, [user]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    error,
    loadUser,
    updateUser
  };
}

// Usage in component
function UserProfileComponent() {
  const { user, isLoading, error, updateUser } = useUserProfile();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={() => updateUser({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

#### Compound Component Pattern

```typescript
// Compound component for complex UI structures
interface TabsProps {
  children: React.ReactNode;
  defaultActive?: string;
  onChange?: (activeId: string) => void;
}

interface TabProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (id: string) => void;
} | null>(null);

function Tabs({ children, defaultActive, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActive || '');

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    onChange?.(id);
  }, [onChange]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      {children}
    </TabsContext.Provider>
  );
}

function Tab({ id, title, children }: TabProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === id;

  return (
    <div className={`tab ${isActive ? 'active' : ''}`}>
      <button onClick={() => setActiveTab(id)}>
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
    </Tabs>
  );
}
```

## State Management Patterns

### Zustand Store Pattern

```typescript
// Store definition with actions
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'sci-fi';

  // Actions
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'sci-fi') => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  theme: 'light',

  setUser: (user) => set({
    user,
    isAuthenticated: user !== null
  }),

  setTheme: (theme) => set({ theme }),

  logout: () => set({
    user: null,
    isAuthenticated: false
  })
}));

// Usage in components
function UserProfile() {
  const { user, isAuthenticated, logout } = useAppStore();

  if (!isAuthenticated) return <LoginForm />;

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useAppStore();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as typeof theme)}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="sci-fi">Sci-Fi</option>
    </select>
  );
}
```

### Custom Hook State Management

```typescript
// Custom hook for complex state logic
function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsTyping(true);
      setError(null);

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      const aiResponse = await aiService.generateResponse(content);
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearMessages,
  };
}
```

## Service Layer Architecture

### Service Interface Pattern

```typescript
// Service interface definition
interface IAIService {
  generateText(messages: AIMessage[], options?: GenerateOptions): Promise<GenerateResult>;
  generateStream(messages: AIMessage[], options?: GenerateOptions): AsyncIterable<StreamChunk>;
  isAvailable(): Promise<boolean>;
  getProviderType(): string;
}

// Service implementation
class SimpleAIProvider implements IAIService {
  constructor(
    private providerType: string,
    private model: string,
    private apiKey?: string
  ) {}

  async generateText(messages: AIMessage[], options?: GenerateOptions): Promise<GenerateResult> {
    // Implementation
  }

  async *generateStream(
    messages: AIMessage[],
    options?: GenerateOptions
  ): AsyncIterable<StreamChunk> {
    // Implementation
  }

  async isAvailable(): Promise<boolean> {
    // Implementation
  }

  getProviderType(): string {
    return this.providerType;
  }
}
```

### Repository Pattern

```typescript
// Repository interface
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

// Repository implementation
class UserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.users.findUnique({
      where: { id },
    });
    return result ? this.mapToUser(result) : null;
  }

  async save(user: User): Promise<User> {
    const data = this.mapFromUser(user);
    const result = await this.db.users.create({ data });
    return this.mapToUser(result);
  }

  // Other methods...
}
```

## Testing Architecture

### Unit Testing Patterns

```typescript
// Interface contract testing
describe('IAIService Contract', () => {
  let service: IAIService;

  beforeEach(() => {
    service = new MockAIService();
  });

  it('should implement generateText method', async () => {
    const messages: AIMessage[] = [{ role: 'user', content: 'Hello' }];
    const result = await service.generateText(messages);

    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('usage');
    expect(typeof result.text).toBe('string');
  });

  it('should implement isAvailable method', async () => {
    const available = await service.isAvailable();
    expect(typeof available).toBe('boolean');
  });
});

// Component testing with hooks
describe('useChat Hook', () => {
  it('should send message and receive response', async () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: TestWrapper,
    });

    await act(async () => {
      await result.current.sendMessage('Hello AI');
    });

    expect(result.current.messages).toHaveLength(2); // User + AI messages
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');
  });
});
```

### Integration Testing Patterns

```typescript
// API integration testing
describe('AI Service Integration', () => {
  let aiService: IAIService;

  beforeAll(async () => {
    aiService = new SimpleAIProvider('google', 'gemini-2.0-flash');
  });

  it('should generate text successfully', async () => {
    const messages: AIMessage[] = [{ role: 'user', content: 'Say hello in French' }];

    const result = await aiService.generateText(messages);

    expect(result.text).toContain('Bonjour');
    expect(result.usage.promptTokens).toBeGreaterThan(0);
    expect(result.usage.completionTokens).toBeGreaterThan(0);
  });

  it('should handle streaming responses', async () => {
    const messages: AIMessage[] = [{ role: 'user', content: 'Count to 3' }];

    const chunks: string[] = [];
    for await (const chunk of aiService.generateStream(messages)) {
      chunks.push(chunk.text);
    }

    const fullText = chunks.join('');
    expect(fullText).toMatch(/1.*2.*3/);
  });
});
```

### E2E Testing Patterns

```typescript
// End-to-end user journey testing
describe('AI Site Generation Journey', () => {
  it('should create and deploy a website', async () => {
    // Navigate to application
    await page.goto('/');

    // Authenticate with GitHub
    await page.click('[data-testid="login-button"]');
    // Handle OAuth flow...

    // Generate content
    await page.fill('[data-testid="prompt-input"]', 'Create a landing page for a coffee shop');
    await page.click('[data-testid="generate-button"]');

    // Wait for generation to complete
    await page.waitForSelector('[data-testid="generated-content"]');

    // Deploy to GitHub Pages
    await page.click('[data-testid="deploy-button"]');
    await page.fill('[data-testid="repo-name"]', 'my-coffee-site');
    await page.click('[data-testid="confirm-deploy"]');

    // Verify deployment
    await page.waitForSelector('[data-testid="deployment-success"]');
    const deployUrl = await page.getAttribute('[data-testid="deploy-url"]', 'href');
    expect(deployUrl).toMatch(/^https:\/\/.*\.github\.io\//);
  });
});
```

## Error Handling Patterns

### Error Boundary Pattern

```typescript
// React Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    errorReportingService.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } }
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary fallback={CustomErrorFallback}>
      <MainApplication />
    </ErrorBoundary>
  );
}
```

### Service Error Handling

```typescript
// Service with comprehensive error handling
class AIService implements IAIService {
  async generateText(messages: AIMessage[], options?: GenerateOptions): Promise<GenerateResult> {
    try {
      // Validate input
      this.validateMessages(messages);
      this.validateOptions(options);

      // Attempt generation
      const result = await this.provider.generate(messages, options);

      // Validate result
      this.validateResult(result);

      return result;
    } catch (error) {
      // Categorize and handle different error types
      if (error instanceof ValidationError) {
        throw new AIServiceError('Invalid input', 'VALIDATION_ERROR', error);
      }

      if (error instanceof NetworkError) {
        throw new AIServiceError('Network error', 'NETWORK_ERROR', error);
      }

      if (error instanceof APIError) {
        throw new AIServiceError('API error', 'API_ERROR', error);
      }

      // Unknown error
      throw new AIServiceError('Unknown error', 'UNKNOWN_ERROR', error);
    }
  }

  private validateMessages(messages: AIMessage[]): void {
    if (!messages || messages.length === 0) {
      throw new ValidationError('Messages array cannot be empty');
    }

    for (const message of messages) {
      if (!message.role || !message.content) {
        throw new ValidationError('Invalid message format');
      }
    }
  }
}
```

### Async Operation Error Handling

```typescript
// Custom hook for async operations with error handling
function useAsyncOperation<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    result: T | null;
    error: Error | null;
  }>({
    status: 'idle',
    result: null,
    error: null
  });

  const execute = useCallback(async (...args: Args) => {
    try {
      setState({ status: 'loading', result: null, error: null });
      const result = await operation(...args);
      setState({ status: 'success', result, error: null });
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({ status: 'error', result: null, error: errorObj });
      throw errorObj;
    }
  }, [operation]);

  const reset = useCallback(() => {
    setState({ status: 'idle', result: null, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error'
  };
}

// Usage
function DataFetcher() {
  const fetchData = useAsyncOperation(async (userId: string) => {
    const response = await api.getUser(userId);
    return response.data;
  });

  const handleFetch = async () => {
    try {
      await fetchData.execute('user123');
    } catch (error) {
      // Error already handled by hook
      console.log('Fetch failed:', error.message);
    }
  };

  return (
    <div>
      <button onClick={handleFetch} disabled={fetchData.isLoading}>
        {fetchData.isLoading ? 'Loading...' : 'Fetch Data'}
      </button>

      {fetchData.isError && (
        <div className="error">
          Error: {fetchData.error?.message}
          <button onClick={fetchData.reset}>Retry</button>
        </div>
      )}

      {fetchData.isSuccess && (
        <div className="success">
          Data: {JSON.stringify(fetchData.result)}
        </div>
      )}
    </div>
  );
}
```

---

_This architectural documentation is automatically generated and kept in sync with the codebase. Last updated: August 31, 2025_
