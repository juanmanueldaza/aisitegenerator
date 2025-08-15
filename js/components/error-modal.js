/**
 * Error Modal Component
 * Displays detailed error information with actionable solutions
 */

class ErrorModal {
    static modal = null;
    static titleElement = null;
    static messageElement = null;
    static detailsElement = null;
    static solutionElement = null;
    static retryButton = null;
    static helpButton = null;
    static closeButton = null;
    static currentError = null;

    static init() {
        if (!this.modal) {
            this.modal = document.getElementById('error-modal');
            this.titleElement = document.getElementById('error-title');
            this.messageElement = document.getElementById('error-message');
            this.detailsElement = document.getElementById('error-details');
            this.solutionElement = document.getElementById('error-solution');
            this.retryButton = document.getElementById('error-retry');
            this.helpButton = document.getElementById('error-help');
            this.closeButton = document.getElementById('error-close');

            // Set up event listeners
            this.closeButton.onclick = () => this.hide();
            this.modal.onclick = (e) => {
                if (e.target === this.modal) this.hide();
            };

            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                    this.hide();
                }
            });
        }
    }

    /**
     * Show error modal with detailed information
     */
    static show(options = {}) {
        this.init();

        const {
            title = 'Error',
            message = 'An error occurred',
            details = '',
            solution = null,
            helpUrl = null,
            retryable = false,
            onRetry = null,
            error = null
        } = options;

        this.currentError = error;

        // Set content
        this.titleElement.textContent = title;
        this.messageElement.textContent = message;

        // Show/hide details
        if (details) {
            this.detailsElement.textContent = details;
            this.detailsElement.classList.remove('hidden');
        } else {
            this.detailsElement.classList.add('hidden');
        }

        // Show/hide solution
        if (solution && Array.isArray(solution) && solution.length > 0) {
            this.showSolution(solution);
        } else {
            this.solutionElement.classList.add('hidden');
        }

        // Show/hide retry button
        if (retryable && onRetry) {
            this.retryButton.onclick = () => {
                this.hide();
                onRetry();
            };
            this.retryButton.classList.remove('hidden');
        } else {
            this.retryButton.classList.add('hidden');
        }

        // Show/hide help button
        if (helpUrl) {
            this.helpButton.onclick = () => {
                window.open(helpUrl, '_blank');
            };
            this.helpButton.classList.remove('hidden');
        } else {
            this.helpButton.classList.add('hidden');
        }

        // Show modal
        this.modal.classList.remove('hidden');
    }

    /**
     * Show solution steps
     */
    static showSolution(solutionSteps) {
        const header = document.createElement('h4');
        header.textContent = 'How to fix this:';

        const list = document.createElement('ul');
        solutionSteps.forEach(step => {
            const listItem = document.createElement('li');
            listItem.textContent = step;
            list.appendChild(listItem);
        });

        this.solutionElement.innerHTML = '';
        this.solutionElement.appendChild(header);
        this.solutionElement.appendChild(list);
        this.solutionElement.classList.remove('hidden');
    }

    /**
     * Hide error modal
     */
    static hide() {
        this.init();
        this.modal.classList.add('hidden');
        this.currentError = null;
    }

    /**
     * Show authentication error
     */
    static showAuthError(error) {
        this.show({
            title: 'Authentication Required',
            message: 'Please connect your GitHub account to continue.',
            solution: [
                'Click the "Connect GitHub" button in the top right',
                'Sign in with your GitHub credentials',
                'Grant the necessary permissions'
            ],
            helpUrl: 'https://docs.github.com/en/authentication',
            error
        });
    }

    /**
     * Show permission error
     */
    static showPermissionError(error, repository = '') {
        const repoText = repository ? ` for repository "${repository}"` : '';
        
        this.show({
            title: 'Permission Denied',
            message: `You don't have the required permissions${repoText}.`,
            solution: [
                'Ensure you have write access to the repository',
                'Contact the repository owner for access',
                'Check if your GitHub token has the necessary scopes'
            ],
            helpUrl: 'https://docs.github.com/en/rest/overview/permissions-required-for-github-apps',
            error
        });
    }

    /**
     * Show rate limit error
     */
    static showRateLimitError(error) {
        const resetTime = error.resetTime ? new Date(error.resetTime * 1000) : null;
        const resetTimeText = resetTime ? ` (resets at ${resetTime.toLocaleTimeString()})` : '';

        this.show({
            title: 'Rate Limit Exceeded',
            message: `GitHub API rate limit exceeded${resetTimeText}.`,
            solution: [
                'Wait for the rate limit to reset',
                'Reduce the frequency of operations',
                'Consider upgrading your GitHub plan for higher limits'
            ],
            helpUrl: 'https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting',
            retryable: true,
            onRetry: error.context?.retryFunction,
            error
        });
    }

    /**
     * Show network error
     */
    static showNetworkError(error) {
        this.show({
            title: 'Connection Error',
            message: 'Unable to connect to GitHub. Please check your internet connection.',
            solution: [
                'Check your internet connection',
                'Try again in a few moments',
                'Verify GitHub is accessible from your network',
                'Check firewall or proxy settings'
            ],
            helpUrl: 'https://www.githubstatus.com/',
            retryable: true,
            onRetry: error.context?.retryFunction,
            error
        });
    }

    /**
     * Show repository error
     */
    static showRepositoryError(error, repository = '') {
        const repoText = repository ? ` "${repository}"` : '';
        
        this.show({
            title: 'Repository Error',
            message: `Repository${repoText} not found or not accessible.`,
            solution: [
                'Check if the repository name is correct',
                'Ensure the repository exists and is accessible',
                'Verify you have the required permissions',
                'Make sure the repository is not private (unless you have access)'
            ],
            helpUrl: 'https://docs.github.com/en/repositories',
            error
        });
    }

    /**
     * Show validation error
     */
    static showValidationError(error, field = '') {
        const fieldText = field ? ` in field "${field}"` : '';
        
        this.show({
            title: 'Invalid Data',
            message: `The data provided${fieldText} is not valid.`,
            details: error.response?.data?.errors ? 
                JSON.stringify(error.response.data.errors, null, 2) : '',
            solution: [
                'Check the format of the data you\'re submitting',
                'Ensure all required fields are provided',
                'Verify field constraints are met',
                'Review the error details for specific issues'
            ],
            helpUrl: 'https://docs.github.com/en/rest',
            error
        });
    }

    /**
     * Show server error
     */
    static showServerError(error) {
        this.show({
            title: 'Server Error',
            message: 'GitHub is experiencing technical difficulties. Please try again later.',
            details: `HTTP ${error.statusCode}: ${error.response?.statusText || 'Server Error'}`,
            solution: [
                'Wait a few minutes and try again',
                'Check GitHub status page for known issues',
                'Contact support if the problem persists'
            ],
            helpUrl: 'https://www.githubstatus.com/',
            retryable: true,
            onRetry: error.context?.retryFunction,
            error
        });
    }

    /**
     * Show generic error
     */
    static showGenericError(error) {
        this.show({
            title: 'Unexpected Error',
            message: 'An unexpected error occurred. Please try again.',
            details: error.technicalMessage || error.message,
            solution: error.solution || [
                'Try the operation again',
                'Refresh the page if the problem persists',
                'Contact support if you continue to experience issues'
            ],
            helpUrl: error.helpUrl || 'https://support.github.com/',
            retryable: error.retryable,
            onRetry: error.context?.retryFunction,
            error
        });
    }

    /**
     * Show appropriate error based on error type
     */
    static showError(error) {
        if (!error) return;

        // Use specific error handlers based on type
        switch (error.type) {
            case GitHubErrorHandler.ERROR_TYPES.AUTHENTICATION:
                this.showAuthError(error);
                break;
            case GitHubErrorHandler.ERROR_TYPES.AUTHORIZATION:
                this.showPermissionError(error);
                break;
            case GitHubErrorHandler.ERROR_TYPES.RATE_LIMIT:
                this.showRateLimitError(error);
                break;
            case GitHubErrorHandler.ERROR_TYPES.NETWORK:
                this.showNetworkError(error);
                break;
            case GitHubErrorHandler.ERROR_TYPES.REPOSITORY:
                this.showRepositoryError(error);
                break;
            case GitHubErrorHandler.ERROR_TYPES.VALIDATION:
                this.showValidationError(error);
                break;
            case GitHubErrorHandler.ERROR_TYPES.SERVER:
                this.showServerError(error);
                break;
            default:
                this.showGenericError(error);
        }
    }
}

// Make available globally
window.ErrorModal = ErrorModal;