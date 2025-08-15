# AI Site Generator

A modern, frontend-only web app for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

## Features

- 🤖 **AI-Guided Creation**: Interactive chat interface for website building
- 🔐 **GitHub Integration**: Secure OAuth authentication with comprehensive error handling
- 🚀 **Automatic Deployment**: Direct deployment to GitHub Pages
- ⚡ **Live Preview**: Real-time website preview during creation
- 🛡️ **Robust Error Handling**: Comprehensive GitHub API error handling with user-friendly feedback
- 🔄 **Smart Retry Logic**: Automatic retry mechanisms with exponential backoff
- 📊 **Progress Tracking**: Visual feedback for all GitHub operations

## Error Handling & Reliability

This application implements comprehensive error handling for all GitHub API operations:

- **Automatic Error Detection**: Categorizes and handles authentication, authorization, rate limiting, network, and repository errors
- **User-Friendly Feedback**: Clear, actionable error messages with step-by-step solutions
- **Smart Retry Logic**: Exponential backoff with jitter for transient failures
- **Rate Limit Management**: Proactive monitoring and handling of GitHub API limits
- **Network Resilience**: Offline detection and graceful degradation
- **Progress Indicators**: Real-time feedback for long-running operations

See [ERROR_HANDLING.md](ERROR_HANDLING.md) for detailed documentation.

## Getting Started

1. **Open the Application**: Navigate to the deployed app or run locally
2. **Connect GitHub**: Click "Connect GitHub" to authenticate
3. **Start Creating**: Use the chat interface to describe your website
4. **Deploy Automatically**: Your site will be deployed to GitHub Pages

## Architecture

### Frontend Components
- **Authentication**: GitHub OAuth with token management
- **Error Handling**: Comprehensive error categorization and user feedback
- **API Integration**: GitHub API wrapper with retry logic
- **User Interface**: Responsive design with progress tracking
- **Chat Interface**: AI-guided website creation process

### Error Handling System
- **GitHubErrorHandler**: Categorizes and processes all GitHub API errors
- **RetryManager**: Implements smart retry logic with exponential backoff
- **UserFeedback**: Modal dialogs, toast notifications, and progress indicators
- **NetworkMonitoring**: Online/offline detection and health checks

## Testing

The error handling system has been thoroughly tested with:
- Authentication failures and token expiration
- Permission and authorization errors
- Rate limiting scenarios with proper reset handling
- Network connectivity issues and offline behavior
- Repository access and validation errors
- Server errors and service unavailability

## Development

### Local Development
```bash
# Serve the application locally
python3 -m http.server 8000
# Navigate to http://localhost:8000
```

### Error Testing
The application includes built-in error simulation for testing:
```javascript
// Test authentication error
GitHubErrorHandler.handleError(authError, { operation: 'test' });

// Test progress tracking
Progress.show({ title: 'Test', message: 'Testing...', percentage: 50 });
```

## Security

- **Token Security**: Secure token storage with automatic cleanup
- **Minimal Permissions**: Request only necessary GitHub scopes
- **Error Privacy**: No sensitive data exposed in error messages
- **Validation**: Input validation and sanitization throughout
