# AI Site Generator - GitHub Integration

A modern, frontend-only web application for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages.

## Features

- **GitHub OAuth Integration**: Secure authentication with GitHub
- **Octokit Browser Support**: Full GitHub API access from the browser
- **Repository Management**: Create, list, and manage repositories
- **File Operations**: Create and update files in repositories
- **GitHub Pages**: Enable and configure GitHub Pages for repositories
- **Rate Limiting**: Built-in rate limit awareness and handling
- **Error Handling**: Comprehensive error handling for API failures
- **TypeScript**: Full TypeScript support with proper type definitions

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A GitHub personal access token or OAuth app credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/juanmanueldaza/aisitegenerator.git
   cd aisitegenerator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Building for Production

```bash
npm run build
npm run preview
```

## GitHub Integration

### Authentication

The application supports GitHub OAuth authentication. For development and testing, you can use a personal access token:

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create a new token with the following scopes:
   - `repo` (Full control of private repositories)
   - `user` (Read/write access to profile info)
   - `pages` (Access to GitHub Pages)
   - `admin:repo_hook` (Repository hooks)

### Octokit Configuration

The GitHub service is configured for browser usage with:

```typescript
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: userToken,
  userAgent: 'AI Site Generator v1.0.0',
});
```

### Available Operations

- **List Repositories**: Get user's repositories with pagination
- **Create Repository**: Create new public or private repositories
- **File Operations**: Create and update files with commit messages
- **GitHub Pages**: Enable GitHub Pages for repositories
- **Permissions**: Check repository permissions for the authenticated user
- **Rate Limiting**: Monitor and handle GitHub API rate limits

### Error Handling

The service includes comprehensive error handling for:

- Authentication failures (401)
- Permission errors (403)
- Rate limit exceeded (403)
- Resource not found (404)
- Network and API errors

### Rate Limiting

The service automatically monitors GitHub API rate limits and:

- Tracks remaining requests
- Provides rate limit status
- Prevents requests when limit is exceeded
- Calculates reset time

## Project Structure

```
src/
├── github-service.ts    # Main GitHub API service with Octokit
├── oauth-service.ts     # OAuth authentication handling
├── main.ts             # Demo application and UI
├── style.css           # Application styles
└── vite-env.d.ts       # TypeScript environment definitions
```

## API Documentation

### GitHubService

The main service class that wraps Octokit for browser usage:

#### Methods

- `initialize(token: string)`: Initialize with OAuth token
- `listRepositories(options?)`: List user repositories
- `createRepository(options)`: Create a new repository
- `getRepository(owner, repo)`: Get repository details
- `createOrUpdateFile(options)`: Create or update files
- `enableGitHubPages(owner, repo, source?)`: Enable GitHub Pages
- `checkRepositoryPermissions(owner, repo)`: Check permissions
- `getRateLimit()`: Get current rate limit status
- `getAuthenticatedUser()`: Get user information

#### Error Handling

All methods throw typed `GitHubError` objects with:
- `message`: Human-readable error message
- `status`: HTTP status code
- `response`: Original API response (if available)

### OAuthService

Handles GitHub OAuth flow:

- `configure(config)`: Set OAuth configuration
- `startAuthFlow()`: Redirect to GitHub OAuth
- `handleCallback()`: Process OAuth callback
- `setToken(token, user?)`: Store authentication
- `logout()`: Clear authentication
- `getState()`: Get current auth state

## Development

### TypeScript

The project uses TypeScript with strict type checking. All GitHub API responses are properly typed.

### Vite

Built with Vite for fast development and optimized production builds.

### Browser Compatibility

- Modern browsers with ES2015+ support
- Uses `btoa()` for base64 encoding (supported in all modern browsers)
- No Node.js dependencies in the browser bundle

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
