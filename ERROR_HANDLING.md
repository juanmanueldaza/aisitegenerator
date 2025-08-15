# GitHub API Error Handling Documentation

This document describes the comprehensive error handling system implemented for GitHub API operations in the AI Site Generator application.

## Overview

The error handling system provides:
- **Comprehensive error categorization** for all GitHub API operations
- **User-friendly error messages** with actionable solutions
- **Automatic retry mechanisms** with exponential backoff
- **Rate limiting detection** and handling
- **Network connectivity monitoring**
- **Visual feedback** through modals, toasts, and progress indicators

## Architecture

### Core Components

1. **GitHubErrorHandler** (`js/utils/error-handler.js`)
   - Categorizes and handles all GitHub API errors
   - Provides user-friendly error messages
   - Maps technical errors to actionable solutions

2. **RetryManager** (`js/utils/retry-manager.js`)
   - Implements retry logic with exponential backoff
   - Handles different retry strategies for different operations
   - Provides retry notifications and progress tracking

3. **GitHubAPI** (`js/utils/github-api.js`)
   - Wrapper around GitHub API with integrated error handling
   - Automatic rate limit monitoring
   - Batch operation support with progress tracking

4. **User Feedback Components**
   - **ErrorModal** (`js/components/error-modal.js`) - Detailed error information
   - **Toast** (`js/components/toast.js`) - Quick notifications
   - **Progress** (`js/components/progress.js`) - Operation progress tracking

## Error Categories

### Authentication Errors (401)
- **Cause**: Invalid or expired GitHub tokens
- **User Message**: "GitHub authentication failed. Please log in again."
- **Actions**: Re-authentication flow, token validation
- **Retry**: No (requires user action)

### Authorization Errors (403)
- **Cause**: Insufficient permissions for repository access
- **User Message**: "Insufficient permissions for this GitHub operation."
- **Actions**: Permission check, scope verification
- **Retry**: No (requires permission changes)

### Rate Limiting (403 with rate limit)
- **Cause**: GitHub API rate limits exceeded
- **User Message**: "GitHub API rate limit exceeded. Please wait before trying again."
- **Actions**: Wait for reset, reduce frequency
- **Retry**: Yes (with calculated delay)

### Repository Errors (404)
- **Cause**: Repository not found or inaccessible
- **User Message**: "Repository not found or not accessible."
- **Actions**: Verify repository name and permissions
- **Retry**: No (requires correction)

### Network Errors
- **Cause**: Connection failures, DNS issues
- **User Message**: "Connection to GitHub failed. Please check your internet connection."
- **Actions**: Check connectivity, verify GitHub status
- **Retry**: Yes (with exponential backoff)

### Validation Errors (422)
- **Cause**: Invalid data format or constraints
- **User Message**: "Invalid data provided for GitHub operation."
- **Actions**: Validate input format, check constraints
- **Retry**: No (requires data correction)

### Server Errors (5xx)
- **Cause**: GitHub service issues
- **User Message**: "GitHub is experiencing technical difficulties."
- **Actions**: Wait and retry, check GitHub status
- **Retry**: Yes (with backoff)

## Retry Strategy

### Exponential Backoff
- **Base delay**: 1 second
- **Maximum delay**: 30 seconds (configurable)
- **Jitter**: Random component to prevent thundering herd
- **Max retries**: 3 (configurable per operation type)

### Operation-Specific Retries
```javascript
// Authentication - No retries
RetryManager.forGitHubOperation('authentication', { maxRetries: 1 })

// Repository creation - Limited retries
RetryManager.forGitHubOperation('repository_creation', { maxRetries: 2 })

// File operations - More retries
RetryManager.forGitHubOperation('file_upload', { maxRetries: 5, maxDelay: 60000 })
```

### Rate Limit Handling
- **Detection**: `x-ratelimit-*` headers monitoring
- **Warning**: Toast notification when < 100 calls remaining
- **Reset wait**: Exact wait time until rate limit resets
- **Graceful handling**: No unnecessary API calls during wait

## User Feedback

### Error Modal
- **Trigger**: High-severity errors (auth, permissions, network)
- **Content**: 
  - Error title and user-friendly message
  - Technical details (collapsible)
  - Step-by-step solution guide
  - Help documentation links
  - Retry button (when applicable)

### Toast Notifications
- **Trigger**: Medium/low-severity errors, status updates
- **Types**: Success, Error, Warning, Info
- **Duration**: 4-6 seconds (error-dependent)
- **Content**: Brief message with title

### Progress Tracking
- **Operations**: Long-running GitHub operations
- **Features**:
  - Real-time progress percentage
  - Current operation status
  - Detailed activity log
  - Time-stamped progress events

### Retry Indicators
- **Banner**: Shows retry countdown and remaining attempts
- **Toast**: Retry notifications with delay information
- **Progress**: Integrated with operation tracking

## Implementation Examples

### Basic Error Handling
```javascript
try {
  const repo = await githubAPI.createRepository(name);
} catch (error) {
  const handledError = await GitHubErrorHandler.handleError(error, {
    operation: 'repository_creation'
  });
  // Error modal or toast automatically shown
}
```

### With Retry Manager
```javascript
const retryManager = RetryManager.forGitHubOperation('file_upload');
const result = await retryManager.execute(async () => {
  return githubAPI.createOrUpdateFile(owner, repo, path, content, message);
});
```

### Progress Tracking
```javascript
const result = await Progress.trackGitHubOperation(
  'Creating Website Project',
  async (updateProgress) => {
    updateProgress({ percentage: 25, message: 'Creating repository...' });
    const repo = await githubAPI.createRepository(name);
    
    updateProgress({ percentage: 75, message: 'Setting up files...' });
    await createProjectFiles(repo);
    
    updateProgress({ percentage: 100, message: 'Project ready!' });
    return repo;
  }
);
```

## Network Monitoring

### Connectivity Detection
- **Online/Offline events**: Automatic detection
- **Status indicators**: Visual feedback in UI
- **Background validation**: Periodic token validation
- **Health checks**: GitHub API connectivity tests

### Graceful Degradation
- **Offline mode**: Limited functionality when disconnected
- **Cached data**: Use local storage when possible
- **Queue operations**: Defer non-critical operations
- **User notification**: Clear offline status indication

## Security Considerations

### Token Management
- **Secure storage**: LocalStorage with appropriate expiration
- **Validation**: Regular token validity checks
- **Revocation handling**: Automatic cleanup on auth failures
- **Scope verification**: Ensure minimal required permissions

### Error Information
- **No sensitive data**: Error messages don't expose tokens
- **Technical details**: Optional, collapsible technical information
- **Logging**: Client-side logging for debugging (no sensitive data)

## Testing

### Error Scenarios Tested
- ✅ Authentication failures (401)
- ✅ Authorization errors (403)
- ✅ Rate limiting with reset time
- ✅ Network connectivity issues
- ✅ Repository not found (404)
- ✅ Validation errors (422)
- ✅ Server errors (5xx)

### User Experience Testing
- ✅ Error modal display and interaction
- ✅ Toast notification timing and content
- ✅ Progress tracking with real-time updates
- ✅ Retry mechanisms with proper delays
- ✅ Network status monitoring

## Configuration

### Error Handler Settings
```javascript
GitHubErrorHandler.ERROR_TYPES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  REPOSITORY: 'repository',
  RATE_LIMIT: 'rate_limit',
  NETWORK: 'network',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};
```

### Retry Manager Settings
```javascript
const retryManager = new RetryManager({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  retryJitter: true
});
```

## Best Practices

1. **Always use error handling**: Wrap all GitHub API calls
2. **Provide context**: Include operation details in error context
3. **Use appropriate feedback**: Modal for critical, toast for minor
4. **Test error scenarios**: Regularly test error handling paths
5. **Monitor rate limits**: Proactive rate limit management
6. **Graceful degradation**: Handle offline/connectivity issues
7. **Clear messaging**: User-friendly, actionable error messages

## Future Enhancements

- **Error analytics**: Track common error patterns
- **Predictive retry**: Machine learning for optimal retry timing
- **Bulk operation resilience**: Better handling of partial failures
- **Custom error rules**: User-configurable error handling
- **Integration testing**: Automated error scenario testing