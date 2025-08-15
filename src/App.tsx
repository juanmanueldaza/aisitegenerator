
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SignInButton } from './components/SignInButton';
import { SignOutButton } from './components/SignOutButton';
import { RevokePermissionsButton } from './components/RevokePermissionsButton';
import { UserProfile } from './components/UserProfile';
import { ErrorNotification } from './components/ErrorNotification';
import './App.css';

function AppContent() {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Site Generator</h1>
        <p>Create websites with AI assistance and deploy to GitHub Pages</p>
      </header>

      <main className="app-main">
        <ErrorNotification />

        {state.isAuthenticated ? (
          <div className="authenticated-view">
            <div className="user-section">
              <UserProfile />
              
              <div className="auth-actions">
                <SignOutButton />
                <RevokePermissionsButton />
              </div>
            </div>

            <div className="permission-info">
              <h3>📋 Current Permissions</h3>
              <div className="permissions-list">
                <div className="permission-item">
                  <span className="permission-icon">📁</span>
                  <div>
                    <strong>Repository Access</strong>
                    <p>Create and manage your website repositories</p>
                  </div>
                </div>
                <div className="permission-item">
                  <span className="permission-icon">⚙️</span>
                  <div>
                    <strong>Workflow Access</strong>
                    <p>Enable GitHub Actions for automatic deployments</p>
                  </div>
                </div>
                <div className="permission-item">
                  <span className="permission-icon">📧</span>
                  <div>
                    <strong>Email Access</strong>
                    <p>Access your email for GitHub Pages setup</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="next-steps">
              <h3>🚀 Next Steps</h3>
              <p>You're now authenticated! The site generation features will be available here.</p>
              <p>This implementation provides secure permission management and sign-out functionality.</p>
            </div>
          </div>
        ) : (
          <div className="unauthenticated-view">
            <div className="welcome-section">
              <h2>Welcome to AI Site Generator</h2>
              <p>
                Create beautiful websites with AI assistance and deploy them directly to GitHub Pages.
                To get started, you'll need to authenticate with GitHub.
              </p>
            </div>

            <div className="auth-section">
              <SignInButton />
              <p className="auth-note">
                We'll request permission to create repositories and enable GitHub Pages for your generated sites.
              </p>
            </div>

            <div className="permissions-explanation">
              <h3>🔒 About GitHub Permissions</h3>
              <div className="permission-explanation">
                <h4>Why do we need these permissions?</h4>
                <ul>
                  <li><strong>Repository Access:</strong> To create new repositories for your websites</li>
                  <li><strong>Workflow Access:</strong> To enable GitHub Actions for automatic deployments</li>
                  <li><strong>Email Access:</strong> To configure GitHub Pages with your account</li>
                </ul>
                
                <h4>🛡️ Your privacy and security:</h4>
                <ul>
                  <li>This app runs entirely in your browser - no server stores your data</li>
                  <li>You can revoke permissions at any time from GitHub settings</li>
                  <li>We only access what's needed to create and deploy your sites</li>
                  <li>Your authentication token is stored securely in your browser session</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer">
            Manage GitHub App Permissions
          </a>
          {' | '}
          <a href="https://docs.github.com/en/developers/apps/managing-oauth-apps" target="_blank" rel="noopener noreferrer">
            Learn about OAuth Apps
          </a>
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;