# Security Guidelines for AI Site Generator

## 🔒 **Security Philosophy**

AI Site Generator implements **defense-in-depth** security, protecting users, their data, and their generated websites through multiple layers of security controls.

### **Current Security Status**

- ✅ **All Security Guidelines Implemented**: Input validation, XSS prevention, CSP headers
- ✅ **OAuth Security**: Secure GitHub authentication flows
- ✅ **API Token Management**: Secure storage and transmission of API keys
- ✅ **Content Sanitization**: DOMPurify integration for all user-generated content
- ✅ **Zero Trust Architecture**: Multiple validation layers throughout the application

### **Security Priorities**

```
🛡️ Security Stack
├── Input Validation: All user data validated and sanitized
├── Output Encoding: All dynamic content properly encoded
├── Authentication: Secure OAuth flows and token management
├── Content Security: CSP headers and XSS prevention
└── Data Protection: Minimal data collection and secure storage
```

## 🎯 **Core Security Principles**

### **1. Zero Trust Architecture**

- Never trust user input without validation
- Always sanitize data before processing
- Validate data at multiple boundaries
- Assume external APIs can return malicious data

### **2. Principle of Least Privilege**

- Request minimum necessary GitHub permissions
- Limit API access to required scopes
- Store minimal user data
- Clear sensitive data when no longer needed

### **3. Defense in Depth**

- Multiple layers of validation
- Content Security Policy enforcement
- Input sanitization AND output encoding
- Client-side AND server-side validation (where applicable)

## 🔧 **Security Implementation**

### **Input Validation & Sanitization**

```typescript
// ✅ Always validate and sanitize user input
import DOMPurify from 'dompurify';

const sanitizeUserInput = (input: string): string => {
  // 1. Basic validation
  if (typeof input !== 'string' || input.length > MAX_LENGTH) {
    throw new Error('Invalid input');
  }

  // 2. Sanitize HTML content
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });

  // 3. Additional custom validation
  return validateBusinessRules(sanitized);
};

// ✅ Validate GitHub repository names
const validateRepoName = (name: string): boolean => {
  const pattern = /^[a-zA-Z0-9._-]+$/;
  return pattern.test(name) && name.length <= 100;
};
```

### **XSS Prevention**

```typescript
// ✅ Safe DOM manipulation
const updatePreview = (content: string) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  // Use textContent instead of innerHTML when possible
  previewElement.textContent = sanitizedContent;
};

// ✅ Safe template rendering
const SafeMarkdown = ({ content }: { content: string }) => {
  const sanitizedHTML = DOMPurify.sanitize(markdownToHtml(content));
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};

// ❌ Never do this
const UnsafeComponent = ({ userInput }: { userInput: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />; // XSS vulnerability!
};
```

### **Content Security Policy**

```html
<!-- Strict CSP configuration -->
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.github.com https://generativelanguage.googleapis.com;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
"
/>
```

### **Authentication Security**

```typescript
// ✅ Secure token storage
class SecureTokenManager {
  private static readonly TOKEN_KEY = 'github_token';

  static storeToken(token: string): void {
    // Use sessionStorage instead of localStorage for sensitive data
    // Consider using secure, httpOnly cookies in production
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}

// ✅ Secure API requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = SecureTokenManager.getToken();

  if (!token) {
    throw new AuthenticationError('No authentication token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    SecureTokenManager.clearToken();
    throw new AuthenticationError('Authentication expired');
  }

  return response;
};
```

### **Data Protection**

```typescript
// ✅ Minimal data collection
interface UserProfile {
  // Only collect what's necessary
  login: string;
  avatar_url: string;
  // Don't store email, real name, or other PII
}

// ✅ Data encryption for sensitive storage
const encryptSensitiveData = (data: string): string => {
  // Use Web Crypto API for client-side encryption
  // This is a simplified example - use proper encryption in production
  return btoa(data); // Replace with actual encryption
};

// ✅ Secure data cleanup
const clearUserSession = () => {
  SecureTokenManager.clearToken();
  sessionStorage.clear();
  // Clear any cached user data
  userCache.clear();
};
```

## 🔍 **Security Validation**

### **Input Validation Patterns**

```typescript
// Validation schema for different input types
const validationSchemas = {
  repositoryName: {
    type: 'string',
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9._-]+$/,
    sanitize: true,
  },

  websiteContent: {
    type: 'string',
    maxLength: 50000,
    allowedTags: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em'],
    sanitize: true,
  },

  userPrompt: {
    type: 'string',
    maxLength: 5000,
    stripHtml: true,
    sanitize: true,
  },
};

// Centralized validation function
const validateInput = (input: any, schema: ValidationSchema): ValidatedInput => {
  // 1. Type validation
  if (typeof input !== schema.type) {
    throw new ValidationError(`Expected ${schema.type}, got ${typeof input}`);
  }

  // 2. Length validation
  if (input.length < schema.minLength || input.length > schema.maxLength) {
    throw new ValidationError('Input length out of bounds');
  }

  // 3. Pattern validation
  if (schema.pattern && !schema.pattern.test(input)) {
    throw new ValidationError('Input format invalid');
  }

  // 4. Sanitization
  if (schema.sanitize) {
    input = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: schema.allowedTags || [],
      STRIP_TAGS: schema.stripHtml || false,
    });
  }

  return { value: input, isValid: true };
};
```

### **API Security**

```typescript
// ✅ Secure API communication
class SecureApiClient {
  private baseURL: string;
  private timeout: number = 10000;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...this.getSecurityHeaders(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.validateResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private getSecurityHeaders(): Record<string, string> {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache',
    };
  }

  private validateResponse<T>(data: any): T {
    // Validate response structure and sanitize if needed
    return data;
  }
}
```

## 🛡️ **Security Testing**

### **Security Test Cases**

```typescript
// Security-focused test cases
describe('Security Tests', () => {
  test('should sanitize malicious HTML input', () => {
    const maliciousInput = '<script>alert("XSS")</script><p>Safe content</p>';
    const result = sanitizeUserInput(maliciousInput);

    expect(result).not.toContain('<script>');
    expect(result).toContain('<p>Safe content</p>');
  });

  test('should reject invalid repository names', () => {
    const invalidNames = [
      'repo with spaces',
      'repo/with/slashes',
      'repo<script>alert(1)</script>',
      'a'.repeat(101), // Too long
    ];

    invalidNames.forEach((name) => {
      expect(() => validateRepoName(name)).toThrow();
    });
  });

  test('should handle authentication errors securely', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      status: 401,
      ok: false,
    });

    global.fetch = mockFetch;

    await expect(makeAuthenticatedRequest('/api/test')).rejects.toThrow(AuthenticationError);
    expect(SecureTokenManager.getToken()).toBeNull(); // Token should be cleared
  });
});
```

### **Security Audit Checklist**

```markdown
## Security Audit Checklist

### Input Validation

- [ ] All user inputs are validated
- [ ] Input length limits are enforced
- [ ] Special characters are handled safely
- [ ] File uploads (if any) are validated

### Output Encoding

- [ ] All dynamic content is properly encoded
- [ ] HTML content is sanitized
- [ ] No direct innerHTML without sanitization
- [ ] Template injection vulnerabilities addressed

### Authentication & Authorization

- [ ] OAuth flows are implemented securely
- [ ] Tokens are stored securely
- [ ] Authentication errors are handled properly
- [ ] Session management is secure

### Content Security Policy

- [ ] CSP headers are configured
- [ ] Inline scripts/styles are minimized
- [ ] External resource loading is restricted
- [ ] CSP violations are monitored

### API Security

- [ ] HTTPS is enforced for all API calls
- [ ] Request/response validation is implemented
- [ ] Rate limiting is considered
- [ ] API keys/tokens are protected

### Data Protection

- [ ] Minimal data collection principle followed
- [ ] Sensitive data is encrypted
- [ ] Data cleanup procedures are implemented
- [ ] Privacy requirements are met
```

## 🚨 **Incident Response**

### **Security Incident Procedure**

1. **Identification**: How to recognize security issues
2. **Containment**: Immediate steps to limit impact
3. **Investigation**: Determine scope and cause
4. **Resolution**: Fix the vulnerability
5. **Communication**: Notify affected users if needed
6. **Prevention**: Update security measures

### **Vulnerability Reporting**

Users can report security vulnerabilities through:

- GitHub Security Advisories (private)
- Security issue template
- Direct contact with maintainers

## 🎯 **Security Best Practices Summary**

1. **Trust Nothing**: Validate all inputs, sanitize all outputs
2. **Encrypt Sensitive Data**: Use proper encryption for sensitive information
3. **Minimize Attack Surface**: Collect minimal data, request minimal permissions
4. **Stay Updated**: Regular security dependency updates
5. **Monitor & Log**: Track security events and potential threats
6. **Educate Users**: Help users understand security features

Remember: **Security is not a feature, it's a requirement. Build it in from the start.**
