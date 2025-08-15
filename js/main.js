// Main application logic
class AIWebsiteGenerator {
    constructor() {
        this.auth = new GitHubAuth();
        this.repoManager = new RepositoryManager(this.auth);
        this.currentSection = 'welcome';
        
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    initializeElements() {
        // Sections
        this.sections = {
            welcome: document.getElementById('welcome-section'),
            repoCreation: document.getElementById('repo-creation-section'),
            loading: document.getElementById('loading-section'),
            success: document.getElementById('success-section'),
            error: document.getElementById('error-section')
        };

        // Auth elements
        this.authSection = document.getElementById('auth-section');
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.userInfo = document.getElementById('user-info');
        this.username = document.getElementById('username');

        // Form elements
        this.repoForm = document.getElementById('repo-form');
        this.repoNameInput = document.getElementById('repo-name');
        this.repoDescInput = document.getElementById('repo-description');
        this.repoPrivateInput = document.getElementById('repo-private');
        this.createRepoBtn = document.getElementById('create-repo-btn');
        this.cancelBtn = document.getElementById('cancel-btn');

        // Action buttons
        this.createAnotherBtn = document.getElementById('create-another-btn');
        this.retryBtn = document.getElementById('retry-btn');

        // Result elements
        this.repoLink = document.getElementById('repo-link');
        this.pagesLink = document.getElementById('pages-link');
        this.errorText = document.getElementById('error-text');
    }

    bindEvents() {
        // Auth events
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        // Form events
        this.repoForm.addEventListener('submit', (e) => this.handleCreateRepository(e));
        this.cancelBtn.addEventListener('click', () => this.showSection('welcome'));
        
        // Action button events
        this.createAnotherBtn.addEventListener('click', () => this.showRepoCreationForm());
        this.retryBtn.addEventListener('click', () => this.showRepoCreationForm());

        // Real-time name validation
        this.repoNameInput.addEventListener('input', () => this.validateNameInput());
        this.repoNameInput.addEventListener('blur', () => this.validateNameInput());

        // Private repository warning
        this.repoPrivateInput.addEventListener('change', () => this.updatePrivateRepoWarning());
    }

    async initializeApp() {
        try {
            // Try to restore existing session
            const restored = await this.auth.restoreSession();
            if (restored) {
                await this.updateAuthUI();
                this.showRepoCreationForm();
            } else {
                this.showSection('welcome');
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showSection('welcome');
        }
    }

    async handleLogin() {
        try {
            this.setLoading(this.loginBtn, true);
            const result = await this.auth.login();
            
            if (result.success) {
                await this.updateAuthUI();
                this.showRepoCreationForm();
                this.showSuccessMessage('Successfully logged in to GitHub!');
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(this.loginBtn, false);
        }
    }

    async handleLogout() {
        try {
            await this.auth.logout();
            this.updateAuthUI();
            this.showSection('welcome');
            this.showSuccessMessage('Successfully logged out!');
        } catch (error) {
            this.showError('Error logging out: ' + error.message);
        }
    }

    async updateAuthUI() {
        if (this.auth.isAuthenticated()) {
            const user = await this.auth.getCurrentUser();
            if (user) {
                this.username.textContent = user.login;
                this.loginBtn.classList.add('hidden');
                this.userInfo.classList.remove('hidden');
            }
        } else {
            this.loginBtn.classList.remove('hidden');
            this.userInfo.classList.add('hidden');
            this.username.textContent = '';
        }
    }

    async handleCreateRepository(event) {
        event.preventDefault();
        
        const formData = new FormData(this.repoForm);
        const repoName = formData.get('repo-name').trim();
        const repoDescription = formData.get('repo-description').trim();
        const isPrivate = formData.has('repo-private');

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        try {
            this.showSection('loading');
            
            const result = await this.repoManager.createRepository({
                name: repoName,
                description: repoDescription,
                isPrivate: isPrivate
            });

            if (result.success) {
                this.showRepositorySuccess(result);
            }
        } catch (error) {
            this.showRepositoryError(error.message, repoName);
        }
    }

    validateForm() {
        const repoName = this.repoNameInput.value.trim();
        
        if (!repoName) {
            this.showFieldError(this.repoNameInput, 'Repository name is required');
            return false;
        }

        const validation = this.repoManager.validateRepositoryName(repoName);
        if (!validation.isValid) {
            this.showFieldError(this.repoNameInput, validation.errors[0]);
            return false;
        }

        this.clearFieldError(this.repoNameInput);
        return true;
    }

    validateNameInput() {
        const repoName = this.repoNameInput.value.trim();
        
        if (!repoName) {
            this.clearFieldError(this.repoNameInput);
            return;
        }

        const validation = this.repoManager.validateRepositoryName(repoName);
        if (!validation.isValid) {
            this.showFieldError(this.repoNameInput, validation.errors[0]);
        } else {
            this.clearFieldError(this.repoNameInput);
        }
    }

    updatePrivateRepoWarning() {
        const isPrivate = this.repoPrivateInput.checked;
        const helpText = this.repoPrivateInput.parentElement.nextElementSibling;
        
        if (isPrivate) {
            helpText.textContent = 'Note: Private repositories cannot use GitHub Pages for free accounts.';
            helpText.style.color = '#e53e3e';
        } else {
            helpText.textContent = 'Note: Public repositories are required for GitHub Pages hosting.';
            helpText.style.color = '#718096';
        }
    }

    showFieldError(field, message) {
        field.style.borderColor = '#e53e3e';
        
        // Remove existing error message
        this.clearFieldError(field);
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#e53e3e';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        
        field.parentElement.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '#e2e8f0';
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showRepositorySuccess(result) {
        this.repoLink.href = result.url;
        this.repoLink.textContent = result.repository.full_name;
        
        if (result.pagesUrl) {
            this.pagesLink.href = result.pagesUrl;
            this.pagesLink.textContent = result.pagesUrl;
            this.pagesLink.parentElement.style.display = 'block';
        } else {
            this.pagesLink.parentElement.style.display = 'none';
        }
        
        this.showSection('success');
        this.resetForm();
    }

    showRepositoryError(message, repoName = '') {
        this.errorText.textContent = message;
        
        // Add suggestions for common errors
        if (message.includes('already exists') && repoName) {
            const suggestions = this.repoManager.generateNameSuggestions(repoName);
            const suggestionText = `\n\nTry these alternatives:\n• ${suggestions.join('\n• ')}`;
            this.errorText.textContent += suggestionText;
        }
        
        this.showSection('error');
    }

    showRepoCreationForm() {
        if (!this.auth.isAuthenticated()) {
            this.showSection('welcome');
            return;
        }
        this.showSection('repoCreation');
        this.repoNameInput.focus();
    }

    showSection(sectionName) {
        // Hide all sections
        Object.values(this.sections).forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show requested section
        if (this.sections[sectionName]) {
            this.sections[sectionName].classList.remove('hidden');
            this.currentSection = sectionName;
        }
    }

    resetForm() {
        this.repoForm.reset();
        this.clearFieldError(this.repoNameInput);
        this.updatePrivateRepoWarning();
    }

    setLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.getAttribute('data-original-text') || 'Submit';
        }
    }

    showSuccessMessage(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #38a169;
            color: white;
            padding: 1rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        this.errorText.textContent = message;
        this.showSection('error');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AIWebsiteGenerator();
});

// Store button original text for loading states
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(button => {
        button.setAttribute('data-original-text', button.textContent);
    });
});