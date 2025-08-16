# Contributing to AI Site Generator

Thank you for your interest in contributing to AI Site Generator! This document provides guidelines and information to help you contribute effectively.

## 🎯 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our code of conduct:

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be collaborative**: Work together to improve the project

## 🚀 Getting Started

### Development Setup

1. **Fork and Clone**

   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/aisitegenerator.git
   cd aisitegenerator
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment template
   cp .env.example .env.local

   # Add your API keys (see README.md for details)
   # VITE_OPENAI_API_KEY=your_key_here
   # VITE_GITHUB_CLIENT_ID=your_client_id
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

2. **Make Changes**
   - Write code following our style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**

   ```bash
   npm run lint          # Check code style
   npm run type-check    # Verify TypeScript
   npm run test          # Run test suite
   npm run build         # Ensure it builds
   ```

4. **Commit and Push**

   ```bash
   git add .
   git commit -m "feat: add new component for site templates"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Open a PR from your branch to `main`
   - Follow the PR template
   - Link to related issues

## 📋 Code Style Guidelines

### TypeScript Standards

#### Function Declarations

```typescript
// ✅ Preferred: Arrow functions for simple functions
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ Acceptable: Function declarations for complex functions
export function processUserInput(input: string, options: ProcessingOptions): ProcessedResult {
  // Complex logic here
  return result;
}
```

#### Interface and Type Definitions

```typescript
// ✅ Good: Clear, specific interfaces
interface SiteConfig {
  readonly name: string;
  readonly description: string;
  readonly theme: ThemeConfig;
  readonly pages: readonly PageConfig[];
}

// ✅ Good: Descriptive type aliases
type EventHandler<T = unknown> = (data: T) => void;
type APIResponse<T> = {
  data: T;
  status: 'success' | 'error';
  message?: string;
};

// ❌ Avoid: Generic or vague names
interface Data {
  stuff: any;
}
```

#### Component Patterns

```typescript
// ✅ Good: Props interface with clear naming
interface ChatMessageProps {
  message: string;
  timestamp: Date;
  sender: User;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  timestamp,
  sender,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="chat-message">
      {/* Component content */}
    </div>
  );
};

// ✅ Good: Default export for main component
export default ChatMessage;

// ✅ Good: Named exports for related components
export { ChatMessage, ChatMessageList, ChatMessageInput };
```

### React Best Practices

#### Component Structure

```typescript
// ✅ Preferred component structure
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState(initialValue);
  const customHookValue = useCustomHook();

  // 2. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 4. Computed values
  const computedValue = useMemo(() => {
    return expensiveComputation(prop1, prop2);
  }, [prop1, prop2]);

  // 5. Early returns
  if (!data) {
    return <LoadingSpinner />;
  }

  // 6. Main render
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};
```

#### Custom Hooks

```typescript
// ✅ Good: Focused, reusable custom hooks
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
};
```

### Styling Guidelines

#### Tailwind CSS Usage

```typescript
// ✅ Good: Organized class names with consistent ordering
<div className="
  flex items-center justify-between
  w-full max-w-md mx-auto
  p-4 mb-4
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-lg shadow-sm
  hover:shadow-md transition-shadow
">
  Content
</div>

// ✅ Good: Extract complex styles to CSS classes
// styles/components.css
.chat-message {
  @apply flex flex-col p-4 mb-2 rounded-lg border;
  @apply bg-white dark:bg-gray-800;
  @apply border-gray-200 dark:border-gray-700;
  @apply hover:shadow-md transition-all duration-200;
}

// ❌ Avoid: Extremely long class strings
<div className="flex items-center justify-between w-full max-w-md mx-auto p-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out">
```

### File and Folder Conventions

#### Naming Conventions

```
✅ Good Examples:
components/
├── ui/
│   ├── Button.tsx          # PascalCase for components
│   ├── LoadingSpinner.tsx  # Descriptive names
│   └── index.ts            # Barrel exports
├── chat/
│   ├── ChatInterface.tsx   # Feature-based grouping
│   ├── MessageList.tsx
│   └── types.ts            # Related types
└── common/
    ├── Layout.tsx
    └── ErrorBoundary.tsx

hooks/
├── useAuth.ts              # camelCase with 'use' prefix
├── useLocalStorage.ts      # Descriptive hook names
└── useAPICall.ts

utils/
├── validation.ts           # camelCase for utilities
├── formatters.ts          # Plural for multiple functions
└── constants.ts           # Lowercase for constants file

❌ Avoid:
├── comp.tsx               # Abbreviated names
├── utils.ts               # Too generic
├── helper.tsx             # Vague purpose
└── stuff.ts               # Non-descriptive
```

#### Import/Export Conventions

```typescript
// ✅ Good: Organized imports
// 1. React and library imports
import React, { useState, useCallback } from 'react';
import { clsx } from 'clsx';

// 2. Internal imports (absolute paths)
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { validateEmail } from '@/utils/validation';

// 3. Relative imports
import './Component.css';

// ✅ Good: Barrel exports in index.ts files
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export type { ButtonProps, InputProps, ModalProps } from './types';

// ✅ Good: Default export for main component
export default Button;
```

## 🧪 Testing Guidelines

### Test Structure and Naming

```typescript
// ✅ Good: Descriptive test structure
describe('ChatInterface', () => {
  describe('when user sends a message', () => {
    it('should call onSend with the message text', async () => {
      // Test implementation
    });

    it('should clear the input field after sending', async () => {
      // Test implementation
    });

    it('should show loading state while sending', async () => {
      // Test implementation
    });
  });

  describe('when user is typing', () => {
    it('should show typing indicator', async () => {
      // Test implementation
    });
  });
});
```

### Component Testing Best Practices

```typescript
// ✅ Good: Comprehensive component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from './ChatInterface';

const defaultProps = {
  messages: [],
  onSend: jest.fn(),
  onClear: jest.fn(),
};

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render message input and send button', () => {
    render(<ChatInterface {...defaultProps} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should enable send button only when input has text', async () => {
    const user = userEvent.setup();
    render(<ChatInterface {...defaultProps} />);

    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });

    expect(sendButton).toBeDisabled();

    await user.type(input, 'Hello');
    expect(sendButton).toBeEnabled();

    await user.clear(input);
    expect(sendButton).toBeDisabled();
  });
});
```

### Custom Hook Testing

```typescript
// ✅ Good: Custom hook testing
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should store value in localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(localStorage.getItem('test-key')).toBe('"new value"');
  });
});
```

## 🔧 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```bash
feat(chat): add message history persistence
fix(auth): resolve GitHub OAuth callback issue
docs(api): update OpenAI integration guide
style(ui): improve button hover states
refactor(store): simplify state management logic
test(components): add tests for ChatInterface
chore(deps): update React to v18.2.0
```

## 📝 Pull Request Guidelines

### PR Title Format

Follow the same format as commit messages:

```
feat(scope): brief description of changes
```

### PR Description Template

```markdown
## Description

Brief summary of the changes and which issue is fixed.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Tests pass locally with my changes
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published
```

### PR Review Process

1. **Automated Checks**: All PRs must pass:
   - ESLint checks
   - TypeScript compilation
   - Test suite
   - Build process

2. **Code Review**: At least one maintainer must review and approve

3. **Testing**: Verify changes work as expected

4. **Documentation**: Ensure docs are updated if needed

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**

- OS: [e.g. macOS, Windows]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🎨 Design System Guidelines

### Component Hierarchy

```typescript
// ✅ Good: Clear component hierarchy
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

// Base component with consistent styling
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'rounded-md font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Accessibility Standards

- **Semantic HTML**: Use appropriate HTML elements
- **ARIA Labels**: Provide descriptive labels for screen readers
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Maintain WCAG 2.1 AA contrast ratios
- **Focus Management**: Clear focus indicators and logical tab order

```typescript
// ✅ Good: Accessible component
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="close-button"
          >
            ×
          </button>
        </header>
        <main className="modal-body">
          {children}
        </main>
      </div>
    </div>
  );
};
```

## 📚 Documentation Standards

### Code Documentation

````typescript
/**
 * Generates a website structure based on user input and AI recommendations.
 *
 * @param prompt - The user's description of their desired website
 * @param options - Configuration options for generation
 * @param options.template - Base template to use for generation
 * @param options.style - Visual style preferences
 * @returns Promise that resolves to generated website structure
 *
 * @example
 * ```typescript
 * const website = await generateWebsite(
 *   "A portfolio site for a photographer",
 *   { template: 'portfolio', style: 'minimal' }
 * );
 * ```
 *
 * @throws {APIError} When the AI service is unavailable
 * @throws {ValidationError} When the prompt is invalid
 */
export async function generateWebsite(
  prompt: string,
  options: GenerationOptions
): Promise<WebsiteStructure> {
  // Implementation
}
````

### README Updates

When adding new features, update the README with:

- Brief feature description
- Usage examples
- Configuration options
- Links to detailed documentation

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Update Version**: Bump version in `package.json`
2. **Update Changelog**: Document all changes
3. **Test**: Run full test suite
4. **Build**: Verify production build works
5. **Tag**: Create git tag with version
6. **Deploy**: Deploy to production
7. **Announce**: Update documentation and notify users

## 💡 Tips for Contributors

### Development Tips

1. **Use TypeScript**: Leverage type safety for better code quality
2. **Test Early**: Write tests alongside your code
3. **Keep it Simple**: Follow KISS principles
4. **Document**: Add JSDoc comments for complex functions
5. **Performance**: Use React.memo, useMemo, and useCallback appropriately

### Getting Help

- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Discord**: Join our community chat (link in README)
- **Code Review**: Request feedback on complex changes

### Recognition

Contributors will be:

- Listed in the contributors section
- Credited in release notes
- Invited to maintainer team (for regular contributors)

Thank you for contributing to AI Site Generator! 🎉
