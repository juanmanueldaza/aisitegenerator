<<<<<<< HEAD

# AI Site Generator - Architecture Documentation

This document outlines the folder structure, naming conventions, and architectural principles implemented in the AI Site Generator project.

## Folder Structure

The project follows a clean, organized structure that promotes separation of concerns and maintainability:

```
src/
├── components/           # React components organized by purpose
│   ├── ui/              # Reusable UI components (Button, Input, etc.)
│   ├── layout/          # Layout components (Header, Footer, Layout)
│   └── features/        # Feature-specific components (SiteBuilder, Auth)
├── hooks/               # Custom React hooks
├── services/            # API and external service integrations
├── utils/               # Pure utility functions
├── types/               # TypeScript type definitions
├── constants/           # Application constants and configuration
└── assets/              # Static assets (images, icons, styles)
```

## Naming Conventions

### Files and Directories

- **Components**: PascalCase for component names and directories (`Button`, `SiteBuilder`)
- **Files**: Match the component/export name (`Button.tsx`, `Button.types.ts`)
- **Utilities**: camelCase for utility files (`stringUtils.ts`, `validation.ts`)
- **Constants**: camelCase for files (`config.ts`, `routes.ts`)
- **Assets**: kebab-case for asset files (`logo-small.svg`, `hero-background.jpg`)

### Code Conventions

- **Components**: PascalCase (`<Button>`, `<SiteBuilder>`)
- **Functions**: camelCase (`capitalize`, `isValidEmail`)
- **Variables**: camelCase (`userName`, `apiResponse`)
- **Constants**: UPPER_SNAKE_CASE for primitives, PascalCase for objects (`API_URL`, `ApiConfig`)
- **Types/Interfaces**: PascalCase (`ButtonProps`, `ApiResponse`)

## Import/Export Patterns

### Absolute Imports

The project uses absolute imports with path mapping for clean, maintainable code:

```typescript
// Instead of relative imports
import { Button } from '../../../components/ui/Button';

// Use absolute imports
import { Button } from '@/components/ui';
import { useLocalStorage } from '@/hooks';
import { API_CONFIG } from '@/constants';
```

### Index File Pattern

Each directory includes an `index.ts` file that exports all public components/functions:

```typescript
// components/ui/index.ts
export * from './Button';
export * from './Input';

// Usage
import { Button, Input } from '@/components/ui';
```

### Component Structure

Each component follows a consistent structure:

```
Button/
├── index.ts          # Clean exports
├── Button.tsx        # Main component implementation
├── Button.types.ts   # TypeScript interfaces
└── Button.test.tsx   # Component tests (when added)
```

## Architectural Principles

### SOLID Principles

1. **Single Responsibility Principle (SRP)**
   - Each component has a single, well-defined purpose
   - Utility functions perform one specific task
   - Hooks encapsulate one piece of stateful logic

2. **Open/Closed Principle (OCP)**
   - Components are extensible through props without modification
   - Interfaces allow for different implementations
   - Plugin-style architecture for features

3. **Liskov Substitution Principle (LSP)**
   - Components can be replaced with their variants without breaking functionality
   - Type system ensures substitutability

4. **Interface Segregation Principle (ISP)**
   - Components receive only the props they need
   - Types are specific and focused

5. **Dependency Inversion Principle (DIP)**
   - Components depend on abstractions (interfaces) not concretions
   - Service layer abstracts external dependencies

### CLEAN Architecture Concepts

1. **Separation of Concerns**
   - UI components are separated from business logic
   - UI depends on hooks and services, not the other way around

### DRY Principle

1. **Reusable Components**
   - UI components are generic and reusable
   - Common patterns are abstracted into hooks
   - Utilities handle repeated logic

2. **Centralized Configuration**
   - Constants are defined once and imported
   - Types are shared across the application
   - Configuration is environment-aware

## Development Guidelines

### Adding New Components

1. Create component directory in appropriate location (`ui`, `layout`, or `features`)
2. Follow the established file structure pattern
3. Define TypeScript interfaces in `.types.ts` file
4. Implement component following SOLID principles
5. Export through `index.ts` file
6. Update parent directory's `index.ts` if needed

### Adding New Utilities

1. Create utility file in `utils/` directory
2. Implement pure functions with clear responsibilities
3. Add comprehensive TypeScript types
4. Include JSDoc documentation
5. Export through `utils/index.ts`

### Adding New Constants

1. Group related constants in appropriate file
2. Use immutable patterns (`as const`, `Object.freeze()`)
3. Document purpose and usage
4. Export through `constants/index.ts`

## Path Mapping Configuration

The `tsconfig.json` includes path mapping for clean imports:

    "paths": {
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/services/*": ["services/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"],
      "@/constants/*": ["constants/*"],
      "@/assets/*": ["assets/*"]
    }

=======

# Architecture Documentation

This document outlines the architectural principles, design patterns, and technical decisions that guide the AI Site Generator project.

## 🏗 Architectural Principles

### KISS (Keep It Simple, Stupid)

- **Minimal Dependencies**: Only essential libraries are included
- **Clear Component Hierarchy**: Simple, predictable component structure
- **Straightforward Data Flow**: Unidirectional data flow patterns
- **No Over-Engineering**: Solutions match the complexity of problems

### SOLID Principles

#### Single Responsibility Principle (SRP)

Each component and function has one clear purpose:

```typescript
// ✅ Good: Single responsibility
export const ChatMessage = ({ message, timestamp, sender }) => {
  return (
    <div className="chat-message">
      <MessageContent message={message} />
      <MessageMeta timestamp={timestamp} sender={sender} />
    </div>
  );
};

// ❌ Bad: Multiple responsibilities
export const ChatMessageWithActions = ({ message, onEdit, onDelete, onShare }) => {
  // Handles display, editing, deletion, and sharing
};
```

#### Open/Closed Principle (OCP)

Components are open for extension but closed for modification:

```typescript
// Base component
export interface ChatProvider {
  sendMessage(message: string): Promise<string>;
}

// Extensions without modifying the base
export class OpenAIChatProvider implements ChatProvider {
  async sendMessage(message: string): Promise<string> {
    // OpenAI implementation
  }
}

export class ClaudeChatProvider implements ChatProvider {
  async sendMessage(message: string): Promise<string> {
    // Claude implementation
>>>>>>> decbc82 (feat: add comprehensive documentation for project principles and conventions)
  }
}
```

<<<<<<< HEAD
This enables clean, absolute imports throughout the application while maintaining clear separation between different layers of the architecture.
=======

#### Liskov Substitution Principle (LSP)

Derived components can replace base components without breaking functionality:

```typescript
// Base component contract
interface EditorComponent {
  render(): ReactElement;
  validate(): boolean;
  getValue(): string;
}

// All implementations honor the contract
export class TextEditor implements EditorComponent {
  /* ... */
}
export class MarkdownEditor implements EditorComponent {
  /* ... */
}
export class CodeEditor implements EditorComponent {
  /* ... */
}
```

#### Interface Segregation Principle (ISP)

Interfaces are focused and specific:

```typescript
// ✅ Good: Focused interfaces
interface Readable {
  read(): string;
}

interface Writable {
  write(content: string): void;
}

interface FileManager extends Readable, Writable {
  delete(): void;
}

// ❌ Bad: Fat interface
interface FileOperations {
  read(): string;
  write(content: string): void;
  delete(): void;
  compress(): void;
  encrypt(): void;
  backup(): void;
}
```

#### Dependency Inversion Principle (DIP)

High-level modules depend on abstractions, not concretions:

```typescript
// Abstraction
interface GitHubService {
  createRepository(name: string): Promise<Repository>;
  deployToPages(content: string): Promise<void>;
}

// High-level component depends on abstraction
export const SiteDeployer = ({ gitHubService }: { gitHubService: GitHubService }) => {
  const deploy = async () => {
    const repo = await gitHubService.createRepository(siteName);
    await gitHubService.deployToPages(siteContent);
  };
};
```

### CLEAN Architecture Layers

```
┌─────────────────────────────────────┐
│          Presentation Layer         │ ← React Components, Hooks
├─────────────────────────────────────┤
│           Use Cases Layer           │ ← Business Logic, State Management
├─────────────────────────────────────┤
│         Interface Adapters          │ ← API Services, Data Transformation
├─────────────────────────────────────┤
│        Infrastructure Layer         │ ← External APIs, Local Storage
└─────────────────────────────────────┘
```

### DRY (Don't Repeat Yourself)

- **Shared Components**: Reusable UI components in `/components/ui/`
- **Custom Hooks**: Common logic extracted to hooks
- **Utility Functions**: Shared helpers in `/utils/`
- **Type Definitions**: Centralized types in `/types/`

## 📁 Folder Structure

```
src/
├── components/              # UI Components (Presentation Layer)
│   ├── ui/                 # Base design system components
│   │   ├── Button.tsx      # Reusable button component
│   │   ├── Input.tsx       # Form input components
│   │   ├── Modal.tsx       # Modal/dialog components
│   │   └── index.ts        # Barrel exports
│   ├── chat/               # AI chat interface
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── ChatProvider.tsx
│   ├── editor/             # Website building interface
│   │   ├── VisualEditor.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── PreviewPane.tsx
│   │   └── ComponentPalette.tsx
│   └── common/             # Shared components
│       ├── Layout.tsx
│       ├── Navigation.tsx
│       └── ErrorBoundary.tsx
├── hooks/                  # Custom React Hooks (Use Cases)
│   ├── useAuth.ts          # Authentication logic
│   ├── useChat.ts          # Chat functionality
│   ├── useGitHub.ts        # GitHub integration
│   └── useLocalStorage.ts  # Local storage management
├── stores/                 # State Management (Use Cases)
│   ├── authStore.ts        # Authentication state
│   ├── chatStore.ts        # Chat history and state
│   ├── editorStore.ts      # Editor state and content
│   └── deploymentStore.ts  # Deployment status
├── services/               # External Service Integration (Interface Adapters)
│   ├── openai/            # OpenAI API integration
│   │   ├── client.ts      # API client
│   │   ├── types.ts       # OpenAI-specific types
│   │   └── prompts.ts     # Prompt templates
│   ├── github/            # GitHub API integration
│   │   ├── client.ts      # GitHub API client
│   │   ├── auth.ts        # OAuth handling
│   │   └── pages.ts       # Pages deployment
│   └── analytics/         # Analytics integration
├── utils/                  # Utility Functions
│   ├── validation.ts      # Input validation
│   ├── formatting.ts      # Text/code formatting
│   ├── constants.ts       # Application constants
│   └── helpers.ts         # General helpers
├── types/                  # TypeScript Definitions
│   ├── api.ts             # API response types
│   ├── component.ts       # Component prop types
│   ├── store.ts           # State shape types
│   └── global.d.ts        # Global type declarations
├── pages/                  # Route Components (Presentation)
│   ├── Home.tsx           # Landing page
│   ├── Editor.tsx         # Main editor interface
│   ├── Deploy.tsx         # Deployment management
│   └── Settings.tsx       # User settings
└── styles/                 # Styling
    ├── globals.css        # Global styles
    ├── components.css     # Component-specific styles
    └── tailwind.config.js # Tailwind configuration
```

## 🎯 Design Patterns

### Component Patterns

#### Compound Components Pattern

For complex UI components with multiple related parts:

```typescript
export const Chat = {
  Root: ChatRoot,
  Messages: ChatMessages,
  Input: ChatInput,
  Actions: ChatActions,
};

// Usage
<Chat.Root>
  <Chat.Messages messages={messages} />
  <Chat.Input onSend={handleSend} />
  <Chat.Actions onClear={handleClear} />
</Chat.Root>
```

#### Render Props Pattern

For sharing logic between components:

```typescript
interface LoadingProps {
  children: (isLoading: boolean) => ReactElement;
}

export const Loading: React.FC<LoadingProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  return children(isLoading);
};

// Usage
<Loading>
  {(isLoading) => (
    <Button disabled={isLoading}>
      {isLoading ? 'Generating...' : 'Generate Site'}
    </Button>
  )}
</Loading>
```

#### Custom Hooks Pattern

For reusable stateful logic:

```typescript
export const useAPICall = <T>(apiFunction: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute };
};
```

## 🗃 State Management Strategy

### Zustand Store Structure

Following the principle of separation of concerns:

```typescript
// Authentication Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

// Chat Store
interface ChatState {
  messages: Message[];
  isTyping: boolean;
  addMessage: (message: Message) => void;
  clearHistory: () => void;
  setTyping: (typing: boolean) => void;
}

// Editor Store
interface EditorState {
  content: EditorContent;
  history: EditorHistory[];
  canUndo: boolean;
  canRedo: boolean;
  updateContent: (content: EditorContent) => void;
  undo: () => void;
  redo: () => void;
}
```

### State Normalization

Keep state flat and normalized for better performance:

```typescript
// ✅ Good: Normalized state
interface AppState {
  sites: { [id: string]: Site };
  pages: { [id: string]: Page };
  components: { [id: string]: Component };
  ui: {
    selectedSiteId: string | null;
    selectedPageId: string | null;
  };
}

// ❌ Bad: Nested state
interface AppState {
  sites: Array<{
    id: string;
    pages: Array<{
      id: string;
      components: Array<Component>;
    }>;
  }>;
}
```

## 🔌 API Integration Patterns

### Service Layer Pattern

Encapsulate external API calls in service classes:

```typescript
export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateSiteStructure(prompt: string): Promise<SiteStructure> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    return this.parseSiteStructure(response.choices[0].message.content);
  }

  private parseSiteStructure(content: string): SiteStructure {
    // Implementation
  }
}
```

### Repository Pattern

Abstract data access logic:

```typescript
interface SiteRepository {
  save(site: Site): Promise<void>;
  load(id: string): Promise<Site>;
  delete(id: string): Promise<void>;
  list(): Promise<Site[]>;
}

export class GitHubSiteRepository implements SiteRepository {
  async save(site: Site): Promise<void> {
    // GitHub-specific implementation
  }

  async load(id: string): Promise<Site> {
    // GitHub-specific implementation
  }
}

export class LocalStorageSiteRepository implements SiteRepository {
  async save(site: Site): Promise<void> {
    // LocalStorage implementation
  }
}
```

## 🎨 Component Design Guidelines

### Component Composition

Build complex UIs from simple, composable components:

```typescript
// Base components
export const Card = ({ children, className }) => (
  <div className={`rounded-lg border p-4 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="mb-4 border-b pb-2">
    {children}
  </div>
);

// Composed component
export const SiteCard = ({ site, onEdit, onDelete }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <h3>{site.name}</h3>
    </CardHeader>
    <p>{site.description}</p>
    <div className="mt-4 flex gap-2">
      <Button onClick={() => onEdit(site.id)}>Edit</Button>
      <Button variant="danger" onClick={() => onDelete(site.id)}>
        Delete
      </Button>
    </div>
  </Card>
);
```

### Error Boundaries

Graceful error handling at component boundaries:

```typescript
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🔄 Data Flow Architecture

### Unidirectional Data Flow

Data flows down, events flow up:

```
┌─────────────────┐
│   App State     │ ← Single source of truth
└─────────┬───────┘
          │ props
          ▼
┌─────────────────┐
│   Components    │ ← Pure, predictable
└─────────┬───────┘
          │ events
          ▼
┌─────────────────┐
│   Actions       │ ← State updates
└─────────────────┘
```

### Event Handling Pattern

Consistent event handling throughout the application:

```typescript
interface AppEvents {
  'site:created': { site: Site };
  'site:updated': { site: Site };
  'site:deleted': { siteId: string };
  'chat:message': { message: string };
  'deploy:started': { siteId: string };
  'deploy:completed': { siteId: string; url: string };
}

export const useEventBus = () => {
  const emit = <T extends keyof AppEvents>(event: T, data: AppEvents[T]) => {
    // Event emission logic
  };

  const subscribe = <T extends keyof AppEvents>(
    event: T,
    handler: (data: AppEvents[T]) => void
  ) => {
    // Event subscription logic
  };

  return { emit, subscribe };
};
```

## 🧪 Testing Strategy

### Component Testing

Test components in isolation with clear contracts:

```typescript
describe('ChatInterface', () => {
  it('should send message when form is submitted', async () => {
    const mockOnSend = jest.fn();

    render(<ChatInterface onSend={mockOnSend} />);

    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Hello AI');
    await user.click(submitButton);

    expect(mockOnSend).toHaveBeenCalledWith('Hello AI');
  });
});
```

### Integration Testing

Test complete user flows:

```typescript
describe('Site Creation Flow', () => {
  it('should create and deploy a site', async () => {
    render(<App />);

    // Navigate to editor
    await user.click(screen.getByText('Create New Site'));

    // Enter site details
    await user.type(screen.getByLabelText('Site Name'), 'My Test Site');

    // Generate with AI
    await user.click(screen.getByText('Generate with AI'));

    // Wait for generation
    await waitFor(() => {
      expect(screen.getByText('Site generated successfully')).toBeInTheDocument();
    });

    // Deploy
    await user.click(screen.getByText('Deploy to GitHub Pages'));

    // Verify deployment
    await waitFor(() => {
      expect(screen.getByText('Deployed successfully')).toBeInTheDocument();
    });
  });
});
```

## 📋 Code Quality Standards

### TypeScript Configuration

Strict type checking for better code quality:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint Rules

Enforce architectural principles through linting:

```json
{
  "rules": {
    "max-lines-per-function": ["error", 50],
    "max-params": ["error", 3],
    "complexity": ["error", 10],
    "no-duplicate-imports": "error",
    "@typescript-eslint/explicit-function-return-type": "error"
  }
}
```

This architecture ensures maintainable, scalable, and testable code that follows industry best practices while keeping the complexity manageable.

> > > > > > > decbc82 (feat: add comprehensive documentation for project principles and conventions)
