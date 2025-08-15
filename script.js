// Educational Content Management System
class EducationContentManager {
    constructor() {
        this.contentData = {};
        this.currentTopic = null;
        this.currentStep = 0;
        this.init();
    }

    init() {
        this.loadContentData();
        this.setupEventListeners();
        this.setupAccessibility();
    }

    // Load educational content data
    loadContentData() {
        this.contentData = {
            scopes: {
                title: "Understanding GitHub Scopes",
                description: "Learn about the permissions our app requests and why they're needed",
                steps: [
                    {
                        title: "What are GitHub Scopes?",
                        content: `
                            <div class="content-section">
                                <h3>GitHub Scopes Explained</h3>
                                <p>GitHub scopes are permissions that define what actions an OAuth application can perform on your behalf. Think of them as keys that unlock specific areas of your GitHub account.</p>
                                
                                <div class="scope-visual">
                                    <div class="scope-item">
                                        <span class="scope-icon">🔓</span>
                                        <strong>Limited Access:</strong> The app can only access what you explicitly allow
                                    </div>
                                    <div class="scope-item">
                                        <span class="scope-icon">🛡️</span>
                                        <strong>Secure by Design:</strong> Permissions can be revoked at any time
                                    </div>
                                    <div class="scope-item">
                                        <span class="scope-icon">🎯</span>
                                        <strong>Purpose-Driven:</strong> Each scope has a specific function
                                    </div>
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Repository Access (repo scope)",
                        content: `
                            <div class="content-section">
                                <h3>Why We Need Repository Access</h3>
                                <p>The <code>repo</code> scope allows our AI Site Generator to:</p>
                                
                                <ul class="permission-list">
                                    <li>
                                        <span class="permission-icon">📁</span>
                                        <strong>Create repositories</strong> for your generated websites
                                    </li>
                                    <li>
                                        <span class="permission-icon">📝</span>
                                        <strong>Commit files</strong> with your website's HTML, CSS, and assets
                                    </li>
                                    <li>
                                        <span class="permission-icon">🔄</span>
                                        <strong>Update content</strong> when you make changes to your site
                                    </li>
                                    <li>
                                        <span class="permission-icon">🌐</span>
                                        <strong>Configure GitHub Pages</strong> to make your site live
                                    </li>
                                </ul>
                                
                                <div class="security-note">
                                    <span class="note-icon">🔒</span>
                                    <strong>Security Note:</strong> We only access repositories we create for your websites. We cannot see or modify your existing personal repositories.
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "User Information (user scope)",
                        content: `
                            <div class="content-section">
                                <h3>User Information Access</h3>
                                <p>The <code>user</code> scope allows us to:</p>
                                
                                <ul class="permission-list">
                                    <li>
                                        <span class="permission-icon">👤</span>
                                        <strong>Get your username</strong> to personalize the experience
                                    </li>
                                    <li>
                                        <span class="permission-icon">📧</span>
                                        <strong>Access your email</strong> for notifications and support
                                    </li>
                                    <li>
                                        <span class="permission-icon">🏷️</span>
                                        <strong>Read your profile</strong> to set proper attribution in generated sites
                                    </li>
                                </ul>
                                
                                <div class="privacy-note">
                                    <span class="note-icon">🛡️</span>
                                    <strong>Privacy Note:</strong> We only use this information to improve your experience. We never share your personal data with third parties.
                                </div>
                            </div>
                        `
                    }
                ]
            },
            security: {
                title: "Security Best Practices",
                description: "Keep your GitHub account secure while using OAuth applications",
                steps: [
                    {
                        title: "Regular Security Audits",
                        content: `
                            <div class="content-section">
                                <h3>Review Connected Applications</h3>
                                <p>Regularly audit which applications have access to your GitHub account:</p>
                                
                                <ol class="step-list">
                                    <li>Go to GitHub Settings → Applications → Authorized OAuth Apps</li>
                                    <li>Review each connected application</li>
                                    <li>Check when you last used each app</li>
                                    <li>Revoke access for unused applications</li>
                                </ol>
                                
                                <div class="recommendation">
                                    <span class="rec-icon">💡</span>
                                    <strong>Recommendation:</strong> Perform this review monthly or quarterly
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Understanding Permission Scopes",
                        content: `
                            <div class="content-section">
                                <h3>Permission Scope Guidelines</h3>
                                
                                <div class="scope-traffic-light">
                                    <div class="scope-level green">
                                        <span class="light-icon">🟢</span>
                                        <strong>Safe Scopes:</strong> user:email, read:user, public_repo
                                    </div>
                                    <div class="scope-level yellow">
                                        <span class="light-icon">🟡</span>
                                        <strong>Moderate Scopes:</strong> repo (full repository access)
                                    </div>
                                    <div class="scope-level red">
                                        <span class="light-icon">🔴</span>
                                        <strong>High-Risk Scopes:</strong> admin:org, delete_repo
                                    </div>
                                </div>
                                
                                <p><strong>Our app only requests moderate-level scopes</strong> that are necessary for website creation and deployment.</p>
                            </div>
                        `
                    }
                ]
            },
            management: {
                title: "Permission Management",
                description: "Learn how to manage and revoke permissions for OAuth applications",
                steps: [
                    {
                        title: "Viewing Connected Apps",
                        content: `
                            <div class="content-section">
                                <h3>How to View Connected Applications</h3>
                                
                                <div class="step-by-step">
                                    <div class="step">
                                        <span class="step-number">1</span>
                                        <div class="step-content">
                                            <strong>Navigate to Settings</strong>
                                            <p>Click your profile picture → Settings</p>
                                        </div>
                                    </div>
                                    <div class="step">
                                        <span class="step-number">2</span>
                                        <div class="step-content">
                                            <strong>Find Applications</strong>
                                            <p>In the left sidebar, click "Applications"</p>
                                        </div>
                                    </div>
                                    <div class="step">
                                        <span class="step-number">3</span>
                                        <div class="step-content">
                                            <strong>Review OAuth Apps</strong>
                                            <p>Click "Authorized OAuth Apps" tab</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Revoking Access",
                        content: `
                            <div class="content-section">
                                <h3>How to Revoke Application Access</h3>
                                
                                <div class="warning-box">
                                    <span class="warning-icon">⚠️</span>
                                    <strong>Before Revoking:</strong> Make sure you're not actively using the application, as this will immediately stop all access.
                                </div>
                                
                                <div class="step-by-step">
                                    <div class="step">
                                        <span class="step-number">1</span>
                                        <div class="step-content">
                                            <strong>Find the Application</strong>
                                            <p>Locate "AI Site Generator" in your authorized apps list</p>
                                        </div>
                                    </div>
                                    <div class="step">
                                        <span class="step-number">2</span>
                                        <div class="step-content">
                                            <strong>Click Revoke</strong>
                                            <p>Click the "Revoke" button next to the application</p>
                                        </div>
                                    </div>
                                    <div class="step">
                                        <span class="step-number">3</span>
                                        <div class="step-content">
                                            <strong>Confirm Action</strong>
                                            <p>Confirm the revocation in the dialog that appears</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                    }
                ]
            },
            troubleshooting: {
                title: "Troubleshooting",
                description: "Common issues and solutions for GitHub authentication",
                steps: [
                    {
                        title: "Authentication Failures",
                        content: `
                            <div class="content-section">
                                <h3>Common Authentication Issues</h3>
                                
                                <div class="troubleshoot-item">
                                    <h4>🚫 "OAuth App access restrictions" error</h4>
                                    <p><strong>Cause:</strong> Your organization has restricted OAuth app access.</p>
                                    <p><strong>Solution:</strong> Contact your organization admin to approve the AI Site Generator app.</p>
                                </div>
                                
                                <div class="troubleshoot-item">
                                    <h4>🔄 Redirect loop during authentication</h4>
                                    <p><strong>Cause:</strong> Browser cookies or cache issues.</p>
                                    <p><strong>Solution:</strong> Clear browser cache and cookies, then try again.</p>
                                </div>
                                
                                <div class="troubleshoot-item">
                                    <h4>❌ "Application suspended" message</h4>
                                    <p><strong>Cause:</strong> The OAuth application has been temporarily suspended.</p>
                                    <p><strong>Solution:</strong> Contact support or try again later.</p>
                                </div>
                            </div>
                        `
                    },
                    {
                        title: "Permission Errors",
                        content: `
                            <div class="content-section">
                                <h3>Repository and Permission Errors</h3>
                                
                                <div class="troubleshoot-item">
                                    <h4>🔒 "Insufficient permissions" error</h4>
                                    <p><strong>Cause:</strong> The app doesn't have required repository permissions.</p>
                                    <p><strong>Solution:</strong> Re-authorize the application to grant necessary scopes.</p>
                                </div>
                                
                                <div class="troubleshoot-item">
                                    <h4>📁 Cannot create repository</h4>
                                    <p><strong>Cause:</strong> Repository name conflicts or quota limits.</p>
                                    <p><strong>Solution:</strong> Choose a different repository name or check your GitHub plan limits.</p>
                                </div>
                                
                                <div class="help-contact">
                                    <span class="contact-icon">💬</span>
                                    <strong>Still need help?</strong> Contact our support team with details about your issue.
                                </div>
                            </div>
                        `
                    }
                ]
            }
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Help panel toggle
        const helpToggle = document.getElementById('help-toggle');
        const helpPanel = document.getElementById('help-panel');
        const helpClose = document.getElementById('help-close');

        helpToggle?.addEventListener('click', () => this.toggleHelpPanel());
        helpClose?.addEventListener('click', () => this.closeHelpPanel());

        // Education card actions
        document.querySelectorAll('.card-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const topic = e.target.getAttribute('data-topic');
                this.openContentModal(topic);
            });
        });

        // Modal controls
        const modalClose = document.getElementById('modal-close');
        const modalPrev = document.getElementById('modal-prev');
        const modalNext = document.getElementById('modal-next');
        const overlay = document.getElementById('overlay');

        modalClose?.addEventListener('click', () => this.closeModal());
        modalPrev?.addEventListener('click', () => this.previousStep());
        modalNext?.addEventListener('click', () => this.nextStep());
        overlay?.addEventListener('click', () => this.closeModal());

        // Help search
        const helpSearch = document.getElementById('help-search');
        helpSearch?.addEventListener('input', (e) => this.searchHelp(e.target.value));

        // Help links
        document.querySelectorAll('[data-help]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const helpTopic = e.target.getAttribute('data-help');
                this.showQuickHelp(helpTopic);
            });
        });

        // Tutorial button
        const startTutorial = document.getElementById('start-tutorial');
        startTutorial?.addEventListener('click', () => this.startInteractiveTutorial());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    // Setup accessibility features
    setupAccessibility() {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add ARIA labels dynamically
        this.updateAriaLabels();

        // Focus management
        this.setupFocusManagement();
    }

    updateAriaLabels() {
        const helpPanel = document.getElementById('help-panel');
        const modal = document.getElementById('content-modal');
        
        if (helpPanel) {
            helpPanel.setAttribute('role', 'complementary');
            helpPanel.setAttribute('aria-label', 'Help documentation');
        }
        
        if (modal) {
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
        }
    }

    setupFocusManagement() {
        // Store previous focus for restoration
        this.previousFocus = null;
    }

    // Help panel methods
    toggleHelpPanel() {
        const helpPanel = document.getElementById('help-panel');
        const isOpen = helpPanel.classList.contains('open');
        
        if (isOpen) {
            this.closeHelpPanel();
        } else {
            this.openHelpPanel();
        }
    }

    openHelpPanel() {
        const helpPanel = document.getElementById('help-panel');
        helpPanel.classList.add('open');
        helpPanel.setAttribute('aria-hidden', 'false');
        
        // Focus management
        this.previousFocus = document.activeElement;
        const firstFocusable = helpPanel.querySelector('input, button, a');
        firstFocusable?.focus();
    }

    closeHelpPanel() {
        const helpPanel = document.getElementById('help-panel');
        helpPanel.classList.remove('open');
        helpPanel.setAttribute('aria-hidden', 'true');
        
        // Restore focus
        if (this.previousFocus) {
            this.previousFocus.focus();
        }
    }

    // Modal methods
    openContentModal(topic) {
        if (!this.contentData[topic]) return;

        this.currentTopic = topic;
        this.currentStep = 0;
        
        const modal = document.getElementById('content-modal');
        const overlay = document.getElementById('overlay');
        
        this.updateModalContent();
        
        modal.classList.add('open');
        overlay.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        this.previousFocus = document.activeElement;
        const modalTitle = document.getElementById('modal-title');
        modalTitle?.focus();
    }

    closeModal() {
        const modal = document.getElementById('content-modal');
        const overlay = document.getElementById('overlay');
        
        modal.classList.remove('open');
        overlay.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore focus
        if (this.previousFocus) {
            this.previousFocus.focus();
        }
    }

    updateModalContent() {
        const topicData = this.contentData[this.currentTopic];
        const currentStepData = topicData.steps[this.currentStep];
        
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalPrev = document.getElementById('modal-prev');
        const modalNext = document.getElementById('modal-next');
        
        modalTitle.textContent = currentStepData.title;
        modalBody.innerHTML = currentStepData.content;
        
        // Update navigation buttons
        modalPrev.disabled = this.currentStep === 0;
        modalNext.disabled = this.currentStep === topicData.steps.length - 1;
        
        // Update button text for last step
        if (this.currentStep === topicData.steps.length - 1) {
            modalNext.textContent = 'Complete';
        } else {
            modalNext.textContent = 'Next';
        }
        
        // Add step indicator
        this.updateStepIndicator();
    }

    updateStepIndicator() {
        const topicData = this.contentData[this.currentTopic];
        const modalBody = document.getElementById('modal-body');
        
        // Remove existing indicator
        const existingIndicator = modalBody.querySelector('.step-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'step-indicator';
        indicator.innerHTML = `
            <span class="step-progress">Step ${this.currentStep + 1} of ${topicData.steps.length}</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${((this.currentStep + 1) / topicData.steps.length) * 100}%"></div>
            </div>
        `;
        
        modalBody.insertBefore(indicator, modalBody.firstChild);
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateModalContent();
        }
    }

    nextStep() {
        const topicData = this.contentData[this.currentTopic];
        if (this.currentStep < topicData.steps.length - 1) {
            this.currentStep++;
            this.updateModalContent();
        } else {
            // Last step - close modal
            this.closeModal();
        }
    }

    // Search functionality
    searchHelp(query) {
        const helpBody = document.getElementById('help-body');
        const sections = helpBody.querySelectorAll('.help-section');
        
        if (!query.trim()) {
            // Show all sections
            sections.forEach(section => {
                section.style.display = 'block';
                const links = section.querySelectorAll('a');
                links.forEach(link => link.style.display = 'block');
            });
            return;
        }
        
        query = query.toLowerCase();
        
        sections.forEach(section => {
            const sectionTitle = section.querySelector('h3').textContent.toLowerCase();
            const links = section.querySelectorAll('a');
            let hasVisibleLinks = false;
            
            links.forEach(link => {
                const linkText = link.textContent.toLowerCase();
                if (linkText.includes(query) || sectionTitle.includes(query)) {
                    link.style.display = 'block';
                    hasVisibleLinks = true;
                } else {
                    link.style.display = 'none';
                }
            });
            
            section.style.display = hasVisibleLinks ? 'block' : 'none';
        });
    }

    // Quick help for specific topics
    showQuickHelp(topic) {
        const helpContent = {
            'github-auth': {
                title: 'GitHub Authentication',
                content: 'Click "Connect GitHub" to securely link your account. We use OAuth for secure, limited access.'
            },
            'permissions-overview': {
                title: 'Permissions Overview',
                content: 'We request minimal permissions: repository access for site creation and user info for personalization.'
            },
            'scope-repo': {
                title: 'Repository Access',
                content: 'Allows creating and managing repositories for your generated websites. Read-only access to existing repos.'
            },
            'scope-user': {
                title: 'User Information',
                content: 'Basic profile information for personalization and proper attribution in generated sites.'
            },
            'revoke-access': {
                title: 'Revoking Access',
                content: 'Go to GitHub Settings → Applications → Authorized OAuth Apps → Find our app → Click Revoke.'
            }
        };
        
        const content = helpContent[topic];
        if (content) {
            this.showTooltip(content.title, content.content);
        }
    }

    showTooltip(title, content) {
        // Create and show a temporary tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <strong>${title}</strong>
                <button class="tooltip-close">×</button>
            </div>
            <div class="tooltip-content">${content}</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        tooltip.style.zIndex = '300';
        
        // Auto-remove after 5 seconds or on click
        const closeBtn = tooltip.querySelector('.tooltip-close');
        const autoClose = setTimeout(() => tooltip.remove(), 5000);
        
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoClose);
            tooltip.remove();
        });
    }

    // Interactive tutorial
    startInteractiveTutorial() {
        this.openContentModal('scopes');
    }

    // Keyboard navigation
    handleKeyboardNavigation(e) {
        const modal = document.getElementById('content-modal');
        const helpPanel = document.getElementById('help-panel');
        
        // Modal navigation
        if (modal.classList.contains('open')) {
            if (e.key === 'Escape') {
                this.closeModal();
            } else if (e.key === 'ArrowLeft') {
                this.previousStep();
            } else if (e.key === 'ArrowRight') {
                this.nextStep();
            }
        }
        
        // Help panel navigation
        if (helpPanel.classList.contains('open')) {
            if (e.key === 'Escape') {
                this.closeHelpPanel();
            }
        }
        
        // Global shortcuts
        if (e.key === 'F1' || (e.ctrlKey && e.key === '/')) {
            e.preventDefault();
            this.toggleHelpPanel();
        }
    }
}

// Initialize the education system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EducationContentManager();
    
    // Add additional styles for dynamic content
    const additionalStyles = `
        <style>
        .step-indicator {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: var(--background-secondary);
            border-radius: 0.5rem;
            border: 1px solid var(--border-color);
        }
        
        .step-progress {
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .progress-bar {
            margin-top: 0.5rem;
            height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--primary-color);
            transition: width 0.3s ease;
        }
        
        .content-section h3 {
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        .permission-list, .step-list {
            list-style: none;
            margin: 1rem 0;
        }
        
        .permission-list li, .step-list li {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: var(--background-secondary);
            border-radius: 0.5rem;
        }
        
        .permission-icon, .step-icon {
            font-size: 1.2em;
            flex-shrink: 0;
        }
        
        .security-note, .privacy-note, .recommendation, .warning-box {
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        
        .security-note { background: #f0f9ff; border-left: 4px solid var(--primary-color); }
        .privacy-note { background: #f0fdf4; border-left: 4px solid var(--success-color); }
        .recommendation { background: #fffbeb; border-left: 4px solid var(--warning-color); }
        .warning-box { background: #fef2f2; border-left: 4px solid var(--danger-color); }
        
        .scope-visual, .scope-traffic-light {
            display: grid;
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        .scope-item, .scope-level {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            border-radius: 0.5rem;
            background: var(--background-secondary);
        }
        
        .scope-level.green { border-left: 4px solid var(--success-color); }
        .scope-level.yellow { border-left: 4px solid var(--warning-color); }
        .scope-level.red { border-left: 4px solid var(--danger-color); }
        
        .step-by-step {
            margin: 1.5rem 0;
        }
        
        .step {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            align-items: flex-start;
        }
        
        .step-number {
            width: 2rem;
            height: 2rem;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: var(--font-size-sm);
            flex-shrink: 0;
        }
        
        .step-content {
            flex: 1;
        }
        
        .step-content strong {
            display: block;
            margin-bottom: 0.25rem;
            color: var(--text-primary);
        }
        
        .troubleshoot-item {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            background: var(--background-secondary);
        }
        
        .troubleshoot-item h4 {
            margin-bottom: 0.75rem;
            color: var(--text-primary);
        }
        
        .help-contact {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--primary-color);
            color: white;
            border-radius: 0.5rem;
            text-align: center;
        }
        
        .help-tooltip {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            max-width: 300px;
            animation: fadeIn 0.2s ease;
        }
        
        .tooltip-header {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .tooltip-content {
            padding: 1rem;
            font-size: var(--font-size-sm);
            line-height: 1.5;
        }
        
        .tooltip-close {
            background: none;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            color: var(--text-secondary);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', additionalStyles);
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EducationContentManager;
}