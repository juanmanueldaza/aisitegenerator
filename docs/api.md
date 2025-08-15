# API Documentation

This document describes the APIs and services used in the AI Site Generator application.

## Table of Contents

- [GitHub Service](#github-service)
- [Gemini AI Service](#gemini-ai-service)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## GitHub Service

The `GitHubService` class provides methods to interact with the GitHub REST API.

### Constructor

```typescript
constructor(token?: string)
```

Creates a new instance of GitHubService. If a token is provided, it will be used for authentication.

### Methods

#### `setToken(token: string): void`

Sets the GitHub access token for API authentication.

**Parameters:**
- `token` (string): GitHub personal access token or OAuth token

**Example:**
```typescript
const githubService = new GitHubService();
githubService.setToken('your-github-token');
```

#### `getCurrentUser(): Promise<GitHubUser>`

Retrieves the authenticated user's information.

**Returns:** Promise resolving to a `GitHubUser` object

**Throws:** Error if no token is set or authentication fails

**Example:**
```typescript
const user = await githubService.getCurrentUser();
console.log(user.login); // 'username'
```

#### `getUserRepositories(): Promise<GitHubRepository[]>`

Retrieves the authenticated user's repositories.

**Returns:** Promise resolving to an array of `GitHubRepository` objects

**Example:**
```typescript
const repos = await githubService.getUserRepositories();
repos.forEach(repo => console.log(repo.name));
```

#### `createRepository(name: string, description: string, isPrivate: boolean): Promise<GitHubRepository>`

Creates a new repository for the authenticated user.

**Parameters:**
- `name` (string): Repository name
- `description` (string): Repository description
- `isPrivate` (boolean, optional): Whether the repository should be private (default: false)

**Returns:** Promise resolving to the created `GitHubRepository` object

**Example:**
```typescript
const repo = await githubService.createRepository(
  'my-website',
  'My awesome website',
  false
);
```

#### `createFile(owner: string, repo: string, path: string, content: string, message: string): Promise<any>`

Creates or updates a file in a repository.

**Parameters:**
- `owner` (string): Repository owner username
- `repo` (string): Repository name
- `path` (string): File path within the repository
- `content` (string): File content (will be base64 encoded automatically)
- `message` (string): Commit message

**Returns:** Promise resolving to GitHub API response

**Example:**
```typescript
await githubService.createFile(
  'username',
  'my-website',
  'index.html',
  '<html><body>Hello World</body></html>',
  'Add index.html'
);
```

#### `enablePages(owner: string, repo: string): Promise<void>`

Enables GitHub Pages for a repository.

**Parameters:**
- `owner` (string): Repository owner username
- `repo` (string): Repository name

**Example:**
```typescript
await githubService.enablePages('username', 'my-website');
```

#### `getAuthUrl(clientId: string, redirectUri: string): string`

Generates GitHub OAuth authorization URL.

**Parameters:**
- `clientId` (string): GitHub OAuth app client ID
- `redirectUri` (string): OAuth callback URL

**Returns:** Authorization URL string

**Example:**
```typescript
const authUrl = githubService.getAuthUrl(
  'your-client-id',
  'http://localhost:3000/callback'
);
```

## Gemini AI Service

The `GeminiService` class provides methods to interact with Google's Gemini AI API.

### Constructor

```typescript
constructor(apiKey: string)
```

Creates a new instance of GeminiService with the provided API key.

**Parameters:**
- `apiKey` (string): Google Gemini API key

### Methods

#### `generateContent(prompt: string): Promise<AIResponse>`

Generates AI content based on a prompt.

**Parameters:**
- `prompt` (string): The prompt to send to the AI

**Returns:** Promise resolving to an `AIResponse` object

**Example:**
```typescript
const geminiService = new GeminiService('your-api-key');
const response = await geminiService.generateContent('Create a website about cats');
console.log(response.text);
```

#### `generateWebsiteStructure(requirements: string): Promise<AIResponse>`

Generates a website structure based on requirements.

**Parameters:**
- `requirements` (string): Website requirements and specifications

**Returns:** Promise resolving to an `AIResponse` with structured website suggestions

**Example:**
```typescript
const response = await geminiService.generateWebsiteStructure(
  'A portfolio website for a web developer with dark theme'
);
```

#### `generatePageContent(pageTitle: string, pageDescription: string, websiteContext: string): Promise<AIResponse>`

Generates HTML content for a specific page.

**Parameters:**
- `pageTitle` (string): Title of the page
- `pageDescription` (string): Description of the page content
- `websiteContext` (string): Context about the overall website

**Returns:** Promise resolving to an `AIResponse` with HTML content

**Example:**
```typescript
const response = await geminiService.generatePageContent(
  'About Us',
  'Company information and team',
  'Tech startup website'
);
```

#### `improvePage(currentContent: string, improvementRequest: string): Promise<AIResponse>`

Improves existing page content based on feedback.

**Parameters:**
- `currentContent` (string): Current HTML content
- `improvementRequest` (string): Specific improvement requests

**Returns:** Promise resolving to an `AIResponse` with improved content

**Example:**
```typescript
const response = await geminiService.improvePage(
  '<h1>Basic Title</h1>',
  'Make it more professional and add CSS styling'
);
```

## Authentication

The application uses GitHub OAuth for authentication. The authentication flow includes:

1. **Authorization**: User clicks login button and is redirected to GitHub
2. **Callback**: GitHub redirects back with authorization code
3. **Token Exchange**: Code is exchanged for access token (in production, this should be done server-side)
4. **Token Storage**: Token is stored in localStorage for subsequent API calls

### Authentication Hook

The `useAuth` hook provides authentication state and methods:

```typescript
const {
  isAuthenticated,  // boolean
  user,            // GitHubUser | null
  token,           // string | null
  loading,         // boolean
  error,           // string | null
  login,           // (code: string) => Promise<void>
  logout,          // () => void
  getAuthUrl,      // (clientId: string) => string
  githubService    // GitHubService | null
} = useAuth();
```

## Error Handling

All services implement comprehensive error handling:

### GitHub Service Errors

- **Authentication Error**: Thrown when token is missing or invalid
- **API Error**: Thrown when GitHub API returns error responses
- **Network Error**: Thrown when network requests fail

### Gemini Service Errors

- **API Key Error**: Thrown when API key is missing
- **Content Generation Error**: Thrown when AI fails to generate content
- **Rate Limit Error**: Thrown when API rate limits are exceeded

### Error Response Format

```typescript
interface ErrorResponse {
  message: string;
  status?: number;
  code?: string;
}
```

### Best Practices

1. Always wrap API calls in try-catch blocks
2. Provide user-friendly error messages
3. Log detailed errors for debugging
4. Implement retry logic for transient failures
5. Handle rate limiting gracefully

**Example Error Handling:**

```typescript
try {
  const user = await githubService.getCurrentUser();
  // Handle success
} catch (error) {
  if (error.status === 401) {
    // Handle authentication error
    logout();
  } else {
    // Handle other errors
    showErrorMessage('Failed to load user information');
  }
}
```