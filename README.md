# AI Site Generator

A modern, frontend-only web app for step-by-step website creation, guided by an AI chat interface. Users authenticate with GitHub and deploy both the app and their generated sites via GitHub Pages. Live preview is available throughout the site-building process.

## 🔥 Features Implemented

### ✅ GitHub OAuth Authentication & Permission Management

This implementation provides secure GitHub OAuth authentication with comprehensive permission management:

- **Secure OAuth Flow**: PKCE (Proof Key for Code Exchange) implementation for enhanced security
- **Permission Revocation**: Users can revoke GitHub permissions with clear confirmation dialogs
- **Secure Sign-Out**: Complete session cleanup and data clearing
- **Educational Content**: Clear explanations of GitHub permissions and their purpose
- **Error Handling**: Graceful handling of network failures, invalid tokens, and edge cases
- **Progress Indicators**: Real-time feedback during authentication and revocation processes

### 🔒 Security Features

- **Frontend-Only Architecture**: No server-side storage of sensitive data
- **Secure Token Storage**: Uses sessionStorage for security (cleared on tab close)
- **CSRF Protection**: State parameter validation in OAuth flow
- **Content Security**: XSS prevention and secure data handling
- **Token Validation**: Automatic validation of stored tokens

### 📱 User Experience

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clear UI/UX**: Intuitive interface with educational content
- **Confirmation Dialogs**: User-friendly confirmation for destructive actions
- **Error Notifications**: Clear error messages with actionable advice
- **Accessibility**: Screen reader compatible and keyboard navigation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- GitHub OAuth App (for authentication)

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Create a GitHub OAuth App:**
   - Go to [GitHub Settings → Applications](https://github.com/settings/applications/new)
   - Fill in the details:
     - Application name: `AI Site Generator`
     - Homepage URL: `http://localhost:5173` (for development)
     - Authorization callback URL: `http://localhost:5173/auth/callback`
   - Copy the Client ID

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your GitHub OAuth App credentials:
   ```
   VITE_GITHUB_CLIENT_ID=your-github-client-id-here
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser and navigate to `http://localhost:5173`**

## 📋 Required GitHub Scopes

The application requests these GitHub permissions:

- **`repo`**: Create and manage your website repositories
- **`workflow`**: Enable GitHub Actions for automatic deployments  
- **`user:email`**: Access your email for GitHub Pages setup

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛡️ Security Considerations

This implementation follows OAuth 2.0 security best practices:

- **PKCE Flow**: Protects against code interception attacks
- **State Parameter**: Prevents CSRF attacks
- **Secure Storage**: Uses sessionStorage (cleared on tab close)
- **Token Validation**: Automatically validates stored tokens
- **No Client Secret**: Frontend-only approach with no secret exposure

## 📚 Architecture

### Authentication Flow

1. User clicks "Sign in with GitHub"
2. App generates PKCE code verifier and challenge
3. User is redirected to GitHub for authorization
4. GitHub redirects back with authorization code
5. App exchanges code for access token using PKCE
6. User information is fetched and stored securely
7. App state is updated to authenticated

### Permission Revocation

1. User clicks "Revoke Permissions" 
2. Confirmation dialog explains the process
3. App clears local authentication data
4. User is provided with GitHub settings link for complete revocation
5. Educational content guides users through manual revocation

### Security Architecture

- **Frontend-Only**: No backend server to compromise
- **Secure Storage**: sessionStorage for automatic cleanup
- **Token Validation**: Periodic validation of stored tokens
- **Error Recovery**: Graceful handling of invalid/expired tokens

## 🎯 Implementation Status

This implementation addresses **Issue #22: Implement permission revocation and secure sign-out**:

- ✅ Users can revoke GitHub OAuth permissions  
- ✅ Secure sign-out clears all authentication data
- ✅ Clear feedback about revocation status
- ✅ Graceful handling of already-revoked tokens
- ✅ Educational content about permission management
- ✅ Clear revocation confirmation dialog
- ✅ Progress indicators during revocation
- ✅ Success/error notifications
- ✅ Link to GitHub's app permissions page
- ✅ Complete session cleanup
- ✅ Secure data clearing
- ✅ Network error handling

## 🔗 Related Issues

- **Issue #6**: Epic 2: GitHub OAuth Authentication (Frontend-Only)
- **Issue #8**: Implement GitHub OAuth authentication flow (dependency)
- **Issue #22**: Implement permission revocation and secure sign-out ✅

## 📖 User Guide

### Signing In
1. Click "Sign in with GitHub"
2. Review the permissions explanation
3. Authorize the app on GitHub
4. You'll be redirected back and signed in

### Managing Permissions
1. View your current permissions in the app
2. Use "Revoke Permissions" for local sign-out
3. Visit GitHub Settings for complete revocation
4. Educational content explains each step

### Security Best Practices
- The app only stores data in your browser session
- Tokens are automatically cleared when you close the tab
- You can revoke access anytime from GitHub settings
- All data processing happens in your browser
