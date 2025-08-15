# Secure Token Persistence Configuration

This file contains configuration options for the secure token management system.

## Configuration Options

### Session Management
- **Session Timeout**: 30 minutes (configurable in TokenManager)
- **Cleanup Interval**: 1 minute automatic cleanup
- **Timer Update Interval**: 1 second for session timer display

### Encryption Settings
- **Algorithm**: AES-GCM
- **Key Length**: 256 bits
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Hash Function**: SHA-256

### Storage Configuration
- **Primary Storage**: SessionStorage (tab-scoped)
- **Encryption Key**: Session-specific, generated per page load
- **Token Validation**: Origin, timestamp, and integrity checks

### Security Headers
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.github.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Development vs Production
- **Development**: Full debugging, relaxed CSP for development tools
- **Production**: Console clearing, restricted developer tools, strict CSP

## Customization

To customize the security settings, modify the following files:

1. **js/token-manager.js**: Session timeout, cleanup intervals
2. **js/crypto-utils.js**: Encryption parameters
3. **index.html**: CSP headers and security policies
4. **js/app.js**: Production security restrictions

## Environment Variables (for future backend integration)

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_TIMEOUT=1800000
ENCRYPTION_ROUNDS=100000
```