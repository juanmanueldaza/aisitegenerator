# AI Site Generator

A modern, frontend-only web app for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

## Security Features

This application implements enterprise-grade security for token management:

- **Secure Token Storage**: Uses SessionStorage with AES-GCM encryption
- **XSS Protection**: Content Security Policy headers and script injection monitoring
- **Session Management**: Automatic 30-minute timeout with visual countdown
- **Token Encryption**: Client-side encryption using Web Crypto API
- **Integrity Validation**: Origin and timestamp checks for all tokens

## Quick Start

1. Open `index.html` in a modern web browser
2. Click "Login with GitHub" to authenticate (demo mode available)
3. Your session will be securely managed with automatic timeout

## Security Documentation

- See [SECURITY.md](SECURITY.md) for detailed security implementation
- See [config/security.md](config/security.md) for configuration options

## Files Structure

```
├── index.html              # Main application page with CSP headers
├── css/styles.css          # Application styling
├── js/
│   ├── crypto-utils.js     # AES-GCM encryption utilities
│   ├── token-manager.js    # Secure token storage and session management
│   ├── auth.js            # GitHub OAuth authentication flow
│   └── app.js             # Main application logic and security measures
├── config/security.md      # Security configuration options
├── tests.html             # Security validation tests
└── SECURITY.md            # Comprehensive security documentation
```

## Browser Compatibility

Requires a modern browser with:
- Web Crypto API support
- SessionStorage support
- ES6+ JavaScript features

## Development

For local development:
```bash
python3 -m http.server 8000
```

Navigate to `http://localhost:8000` to test the application.
