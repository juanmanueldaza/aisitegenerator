// GitHub OAuth configuration
const GITHUB_CLIENT_ID = 'your_github_client_id'; // This would be set in production
const GITHUB_REDIRECT_URI = window.location.origin + '/callback';
const REQUIRED_SCOPES = ['repo', 'workflow', 'user:email'];

// DOM elements
const helpButtons = document.querySelectorAll('.help-btn');
const consentCheckboxes = document.querySelectorAll('.consent-section input[type="checkbox"]');
const authorizeBtn = document.getElementById('authorize-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateAuthorizeBtnState();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Help button toggles
    helpButtons.forEach(button => {
        button.addEventListener('click', handleHelpToggle);
    });

    // Consent checkbox changes
    consentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateAuthorizeBtnState);
    });

    // Authorization button
    authorizeBtn.addEventListener('click', handleAuthorization);

    // Learn more button
    learnMoreBtn.addEventListener('click', handleLearnMore);

    // Keyboard accessibility
    document.addEventListener('keydown', handleKeyboardNavigation);
}

/**
 * Handle help button toggles to show/hide permission details
 * @param {Event} event - Click event
 */
function handleHelpToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const tooltipId = button.getAttribute('data-tooltip');
    const tooltip = document.getElementById(tooltipId);
    
    if (tooltip) {
        const isVisible = tooltip.classList.contains('show');
        
        // Hide all other tooltips
        document.querySelectorAll('.permission-details.show').forEach(detail => {
            detail.classList.remove('show');
        });
        
        // Toggle current tooltip
        if (!isVisible) {
            tooltip.classList.add('show');
            // Update button icon to indicate expanded state
            button.innerHTML = '<i class="fas fa-times"></i>';
            button.setAttribute('aria-expanded', 'true');
        } else {
            button.innerHTML = '<i class="fas fa-question-circle"></i>';
            button.setAttribute('aria-expanded', 'false');
        }
    }
}

/**
 * Update the state of the authorize button based on consent checkboxes
 */
function updateAuthorizeBtnState() {
    const allChecked = Array.from(consentCheckboxes).every(checkbox => checkbox.checked);
    authorizeBtn.disabled = !allChecked;
    
    if (allChecked) {
        authorizeBtn.classList.add('ready');
    } else {
        authorizeBtn.classList.remove('ready');
    }
}

/**
 * Handle the GitHub authorization process
 * @param {Event} event - Click event
 */
function handleAuthorization(event) {
    event.preventDefault();
    
    if (authorizeBtn.disabled) {
        return;
    }
    
    // Add loading state
    authorizeBtn.classList.add('loading');
    authorizeBtn.innerHTML = '<i class="fab fa-github"></i> Connecting to GitHub...';
    
    // Simulate OAuth flow (in a real implementation, this would redirect to GitHub)
    setTimeout(() => {
        if (GITHUB_CLIENT_ID === 'your_github_client_id') {
            // Development mode - show educational modal instead of real OAuth
            showDevelopmentModal();
        } else {
            // Production mode - redirect to GitHub OAuth
            initiateGitHubOAuth();
        }
    }, 1000);
}

/**
 * Initiate the actual GitHub OAuth flow
 */
function initiateGitHubOAuth() {
    const state = generateRandomState();
    sessionStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: GITHUB_REDIRECT_URI,
        scope: REQUIRED_SCOPES.join(' '),
        state: state,
        allow_signup: 'true'
    });
    
    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    window.location.href = authUrl;
}

/**
 * Show educational modal for development/demo purposes
 */
function showDevelopmentModal() {
    const modal = createModal();
    document.body.appendChild(modal);
    
    // Reset button state
    setTimeout(() => {
        authorizeBtn.classList.remove('loading');
        authorizeBtn.innerHTML = '<i class="fab fa-github"></i> Authorize with GitHub';
    }, 500);
}

/**
 * Create educational modal for development mode
 * @returns {HTMLElement} Modal element
 */
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> OAuth Flow Demo</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>In a production environment, this would:</strong></p>
                <ol>
                    <li>Redirect you to GitHub's OAuth authorization page</li>
                    <li>Show the exact permissions we've explained above</li>
                    <li>Allow you to authorize or deny access</li>
                    <li>Redirect back to our application with an authorization code</li>
                    <li>Exchange the code for an access token</li>
                </ol>
                <div class="demo-oauth-url">
                    <p><strong>GitHub OAuth URL would be:</strong></p>
                    <code>https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=${REQUIRED_SCOPES.join('%20')}&state=random_state</code>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary modal-understand">I Understand</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        <style>
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                background: white;
                border-radius: 8px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h3 {
                margin: 0;
                color: #333;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #666;
                cursor: pointer;
            }
            .modal-body {
                padding: 1.5rem;
            }
            .modal-body ol {
                margin: 1rem 0;
                padding-left: 1.5rem;
            }
            .modal-body li {
                margin-bottom: 0.5rem;
            }
            .demo-oauth-url {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 1rem;
                margin: 1rem 0;
            }
            .demo-oauth-url code {
                word-break: break-all;
                font-size: 0.85rem;
                color: #e83e8c;
            }
            .modal-actions {
                margin-top: 1.5rem;
                text-align: center;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
    `;
    
    if (!document.querySelector('#modal-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'modal-styles';
        styleElement.innerHTML = modalStyles;
        document.head.appendChild(styleElement);
    }
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-understand').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    return modal;
}

/**
 * Handle learn more button click
 * @param {Event} event - Click event
 */
function handleLearnMore(event) {
    event.preventDefault();
    
    // Open GitHub OAuth documentation in new tab
    window.open('https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps', '_blank');
}

/**
 * Handle keyboard navigation for accessibility
 * @param {Event} event - Keyboard event
 */
function handleKeyboardNavigation(event) {
    // Escape key closes any open tooltips
    if (event.key === 'Escape') {
        document.querySelectorAll('.permission-details.show').forEach(detail => {
            detail.classList.remove('show');
        });
        
        // Reset help button icons
        helpButtons.forEach(button => {
            button.innerHTML = '<i class="fas fa-question-circle"></i>';
            button.setAttribute('aria-expanded', 'false');
        });
    }
    
    // Enter or Space on help buttons
    if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('help-btn')) {
        event.preventDefault();
        handleHelpToggle(event);
    }
}

/**
 * Generate a random state for OAuth security
 * @returns {string} Random state string
 */
function generateRandomState() {
    const array = new Uint32Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

/**
 * Handle OAuth callback (would be used on the callback page)
 * @param {URLSearchParams} params - URL parameters from GitHub
 */
function handleOAuthCallback(params) {
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    
    if (error) {
        console.error('OAuth error:', error);
        showErrorMessage('Authorization failed: ' + error);
        return;
    }
    
    if (!code) {
        console.error('No authorization code received');
        showErrorMessage('No authorization code received');
        return;
    }
    
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
        console.error('State mismatch - possible CSRF attack');
        showErrorMessage('Security error: state mismatch');
        return;
    }
    
    // In a real implementation, you would exchange the code for an access token
    // This would be done on your backend to keep the client secret secure
    exchangeCodeForToken(code);
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from GitHub
 */
function exchangeCodeForToken(code) {
    // This would typically be done on your backend
    console.log('Exchanging code for token:', code);
    
    // For demo purposes, show success
    showSuccessMessage('Authorization successful! Your GitHub account is now connected.');
}

/**
 * Show error message to user
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const alert = createAlert('error', message);
    document.body.appendChild(alert);
}

/**
 * Show success message to user
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    const alert = createAlert('success', message);
    document.body.appendChild(alert);
}

/**
 * Create alert element
 * @param {string} type - Alert type (error, success, info)
 * @param {string} message - Alert message
 * @returns {HTMLElement} Alert element
 */
function createAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas ${type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close">&times;</button>
        </div>
    `;
    
    // Add alert styles if not already present
    if (!document.querySelector('#alert-styles')) {
        const alertStyles = `
            <style id="alert-styles">
                .alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    min-width: 300px;
                    padding: 1rem;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1001;
                    animation: slideInRight 0.3s ease;
                }
                .alert-error {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }
                .alert-success {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                }
                .alert-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .alert-content i {
                    font-size: 1.2rem;
                }
                .alert-content span {
                    flex: 1;
                }
                .alert-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    color: inherit;
                    cursor: pointer;
                    opacity: 0.7;
                }
                .alert-close:hover {
                    opacity: 1;
                }
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', alertStyles);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
    
    // Close button functionality
    alert.querySelector('.alert-close').addEventListener('click', () => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    });
    
    return alert;
}

// Check if we're on the callback page
if (window.location.pathname === '/callback' || window.location.search.includes('code=')) {
    const params = new URLSearchParams(window.location.search);
    handleOAuthCallback(params);
}