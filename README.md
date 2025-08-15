# AI Site Generator

A modern, frontend-only web app for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

## GitHub OAuth Implementation

This repository now includes a comprehensive GitHub OAuth permissions interface that educates users about the required permissions and their purposes.

### Features

- **Clear Permission Explanations**: Each GitHub scope is explained in detail with visual icons and descriptions
- **Educational Tooltips**: Interactive help buttons provide detailed information about each permission
- **User Consent Flow**: Two-step consent process ensures users understand what they're authorizing
- **Security Information**: Comprehensive security and privacy details
- **Help Documentation**: Full documentation page explaining OAuth, permissions, and troubleshooting
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and ARIA attributes for screen readers

### Required GitHub Scopes

1. **`repo`** - Create and manage your website repositories
   - Create new repositories for generated websites
   - Upload and manage website files
   - Configure repository settings for GitHub Pages

2. **`workflow`** - Enable GitHub Actions for automatic deployments
   - Set up automated deployment workflows
   - Enable continuous integration
   - Monitor deployment status

3. **`user:email`** - Set up GitHub Pages with your email
   - Configure proper git commit attribution
   - Set up GitHub Pages contact information
   - Comply with GitHub's terms of service

### Files Structure

```
├── index.html          # Main authorization interface
├── help.html           # Comprehensive help documentation
├── callback.html       # OAuth callback handling page
├── styles.css          # Responsive CSS styling
├── script.js           # Interactive JavaScript functionality
└── README.md           # This documentation
```

### Getting Started

1. **Development Setup**:
   - Clone this repository
   - Open `index.html` in a web browser
   - The interface will show a demo mode for testing

2. **Production Setup**:
   - Register your application with GitHub OAuth
   - Update `GITHUB_CLIENT_ID` in `script.js`
   - Configure your redirect URI in GitHub settings
   - Deploy to your hosting platform

### OAuth Flow

1. User visits the authorization page (`index.html`)
2. User reads permission explanations and gives consent
3. User clicks "Authorize with GitHub"
4. Redirected to GitHub's OAuth authorization page
5. User grants permissions on GitHub
6. GitHub redirects back to callback page (`callback.html`)
7. Application exchanges authorization code for access token
8. User can begin using the website builder

### Security Features

- **OAuth 2.0 Standard**: Uses GitHub's official OAuth implementation
- **CSRF Protection**: State parameter prevents cross-site request forgery
- **Secure Token Handling**: No sensitive data exposed to client-side
- **Minimal Permissions**: Only requests necessary scopes
- **User Control**: Clear revocation instructions provided

### Educational Content

The implementation includes extensive educational content:

- **Permission Explanations**: What each scope allows and why it's needed
- **Security Information**: How OAuth protects user data
- **Management Instructions**: How to revoke and manage permissions
- **Troubleshooting Guide**: Common issues and solutions
- **GitHub Documentation Links**: Direct links to official GitHub docs

### Compliance

- Follows GitHub's OAuth best practices
- Implements proper error handling
- Provides clear user communication
- Includes privacy and security disclosures
- Offers easy permission management

### Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Keyboard navigation support
- Screen reader compatibility

### Development Notes

The current implementation includes a demo mode that shows how the OAuth flow would work without requiring actual GitHub OAuth credentials. This allows for testing and demonstration of the user interface and educational content.

To enable production OAuth:
1. Set up a GitHub OAuth App
2. Update the `GITHUB_CLIENT_ID` constant in `script.js`
3. Configure proper redirect URIs
4. Implement server-side token exchange (recommended for security)

---

**Part of Issue #14** - Manage GitHub scopes and user permissions
