# Gemini API Integration Guide

This document explains how to configure and use the Google Gemini API integration in the AI Site Generator application.

## Overview

The application integrates with Google's Gemini AI to provide intelligent website generation capabilities. The integration includes:

- ✅ Secure API key management
- ✅ Rate limiting and quota management
- ✅ Comprehensive error handling
- ✅ Response caching for performance
- ✅ Usage tracking and monitoring
- ✅ TypeScript support with full type safety

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key (it should start with "AIza...")

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   VITE_APP_ENV=development
   VITE_GEMINI_MAX_REQUESTS_PER_MINUTE=60
   VITE_GEMINI_MAX_TOKENS_PER_REQUEST=4096
   VITE_GEMINI_MODEL=gemini-1.5-flash
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

## Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_GEMINI_API_KEY` | Your Gemini API key | - | ✅ Yes |
| `VITE_APP_ENV` | Environment (development/production) | `development` | No |
| `VITE_GEMINI_MODEL` | Gemini model to use | `gemini-1.5-flash` | No |
| `VITE_GEMINI_MAX_REQUESTS_PER_MINUTE` | Rate limit per minute | `60` | No |
| `VITE_GEMINI_MAX_TOKENS_PER_REQUEST` | Max tokens per request | `4096` | No |

### Available Models

- `gemini-1.5-flash` - Fast, efficient model (recommended for most use cases)
- `gemini-1.5-pro` - More capable model for complex tasks
- `gemini-1.0-pro` - Previous generation model

## Usage

### React Hook Integration

The easiest way to use the Gemini API is through the provided React hook:

```tsx
import { useGemini } from './hooks/useGemini';

function MyComponent() {
  const gemini = useGemini();

  const handleGenerate = async () => {
    if (!gemini.isConfigured) {
      alert('Please configure your API key first');
      return;
    }

    await gemini.generateText({
      prompt: 'Create a landing page for a coffee shop',
      maxTokens: 2000,
      temperature: 0.7
    });
  };

  if (gemini.isLoading) {
    return <div>Generating...</div>;
  }

  if (gemini.error) {
    return <div>Error: {gemini.error.message}</div>;
  }

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      {gemini.response && (
        <div>{gemini.response.text}</div>
      )}
    </div>
  );
}
```

### Direct Service Usage

For more advanced use cases, you can use the service directly:

```tsx
import { GeminiService } from './services/geminiService';

const geminiService = new GeminiService();

try {
  const response = await geminiService.generateText({
    prompt: 'Your prompt here',
  });
  console.log(response.text);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Security Features

### API Key Protection

- API keys are stored in environment variables, not in source code
- Keys are validated on initialization
- No API keys are logged or exposed in production builds

### Input Sanitization

All prompts are automatically sanitized to remove:
- HTML script tags
- JavaScript protocols
- Data URLs
- Other potentially dangerous content

### Output Sanitization

All API responses are sanitized to remove:
- Script tags
- JavaScript protocols
- Potentially harmful content

## Rate Limiting & Quota Management

### Built-in Rate Limiting

- Configurable requests per minute (default: 60)
- Automatic rate limit tracking using localStorage
- Clear error messages when limits are exceeded
- Automatic reset when time window expires

### Usage Tracking

The integration tracks:
- Daily request count
- Daily token usage
- Hourly request count
- Last request timestamp

### Cost Monitoring

Monitor your usage through:
- Real-time usage statistics in the UI
- Console logging in development mode
- Local storage tracking

## Error Handling

### Common Error Types

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INVALID_API_KEY` | API key is missing or invalid | Check your `.env` file and API key |
| `RATE_LIMITED` | Too many requests | Wait for rate limit to reset |
| `QUOTA_EXCEEDED` | API quota exceeded | Check your Google Cloud billing |
| `NETWORK_ERROR` | Connection issues | Check internet connection |
| `PROMPT_TOO_LONG` | Prompt exceeds token limit | Shorten your prompt |

### Error Recovery

- Automatic retry for transient network errors
- Clear error messages with actionable solutions
- Graceful degradation when API is unavailable

## Performance Optimization

### Response Caching

- Automatic caching of responses for 5 minutes
- Cache key based on prompt and parameters
- Automatic cache cleanup to prevent memory leaks

### Request Batching

Future enhancement: Support for batching multiple requests to improve efficiency.

## Development vs Production

### Development Mode

- Detailed console logging
- Configuration validation warnings
- Extended error messages

### Production Mode

- Minimal logging
- Optimized performance
- Secure error handling

## Testing

Run the test suite to validate the integration:

```bash
npm test
```

The tests cover:
- Configuration validation
- Error handling
- Rate limiting
- Input sanitization

## Troubleshooting

### "API key is required" Error

1. Check that your `.env` file exists and contains `VITE_GEMINI_API_KEY`
2. Ensure the API key starts with "AIza"
3. Restart the development server after adding the key

### Rate Limiting Issues

1. Check the rate limit settings in your `.env` file
2. Monitor usage in the stats panel
3. Consider upgrading your Google Cloud quota if needed

### Network Errors

1. Check your internet connection
2. Verify that Google AI services are accessible
3. Check for firewall or proxy issues

### Performance Issues

1. Monitor token usage in the stats panel
2. Consider using shorter prompts
3. Check if response caching is working

## Best Practices

### Security

- Never commit API keys to version control
- Use different API keys for development and production
- Regularly rotate API keys
- Monitor usage for unusual activity

### Performance

- Use specific, concise prompts
- Monitor token usage
- Implement request debouncing for user input
- Consider implementing custom caching strategies

### Cost Management

- Set up Google Cloud billing alerts
- Monitor daily usage limits
- Use the most cost-effective model for your use case
- Implement usage quotas for users

## Support

For issues with the Gemini integration:

1. Check this documentation
2. Review the error messages in the console
3. Check the GitHub issues for known problems
4. Consult the [Google AI documentation](https://ai.google.dev/docs)

For Google API specific issues, refer to the [Google AI Studio documentation](https://ai.google.dev/aistudio).