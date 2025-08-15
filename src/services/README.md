# Services

This directory contains API and external service integrations.

## Guidelines
- Handle external API communications
- Implement authentication and authorization logic
- Provide abstraction layers for third-party services
- Include error handling and retry logic
- Use consistent patterns for async operations

## Example Structure
```
services/
├── api/
│   ├── index.ts
│   ├── client.ts
│   └── endpoints.ts
├── auth/
│   ├── index.ts
│   ├── github.ts
│   └── auth.types.ts
└── deployment/
    ├── index.ts
    ├── githubPages.ts
    └── deployment.types.ts
```

## Example Service
```typescript
// api/client.ts
class ApiClient {
  private baseURL: string;
  private token?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options?.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}
```