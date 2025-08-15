/**
 * GitHub API Wrapper
 * Comprehensive GitHub API integration with error handling and retry logic
 */

class GitHubAPI {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.token = null;
        this.user = null;
        this.rateLimitInfo = {
            remaining: null,
            reset: null,
            limit: null
        };
    }

    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Get authentication headers
     */
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        return headers;
    }

    /**
     * Make HTTP request with error handling
     */
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        
        const requestOptions = {
            method: options.method || 'GET',
            headers: { ...this.getHeaders(), ...options.headers },
            ...options
        };

        if (requestOptions.body && typeof requestOptions.body === 'object') {
            requestOptions.body = JSON.stringify(requestOptions.body);
        }

        let response;
        try {
            // Check network connectivity first
            if (!navigator.onLine) {
                throw new Error('No internet connection');
            }

            response = await fetch(url, requestOptions);
            
            // Update rate limit info from headers
            this.updateRateLimitInfo(response.headers);

        } catch (error) {
            // Network/fetch errors
            throw new GitHubAPIError(
                'Network request failed',
                GitHubErrorHandler.ERROR_TYPES.NETWORK,
                0,
                error
            );
        }

        // Handle HTTP error responses
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: response.statusText };
            }

            const error = new Error(errorData.message || `HTTP ${response.status}`);
            error.status = response.status;
            error.response = {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data: errorData
            };

            throw error;
        }

        // Parse response
        try {
            return await response.json();
        } catch (error) {
            // Return empty object for responses without body
            return {};
        }
    }

    /**
     * Update rate limit information from response headers
     */
    updateRateLimitInfo(headers) {
        this.rateLimitInfo = {
            remaining: parseInt(headers.get('x-ratelimit-remaining')) || null,
            reset: parseInt(headers.get('x-ratelimit-reset')) || null,
            limit: parseInt(headers.get('x-ratelimit-limit')) || null
        };

        // Warn if approaching rate limit
        if (this.rateLimitInfo.remaining !== null && this.rateLimitInfo.remaining < 100) {
            if (window.Toast) {
                window.Toast.show({
                    type: 'warning',
                    title: 'Rate Limit Warning',
                    message: `Only ${this.rateLimitInfo.remaining} API calls remaining`,
                    duration: 5000
                });
            }
        }
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        const retryManager = RetryManager.forGitHubOperation('authentication');
        
        return retryManager.execute(async () => {
            const user = await this.request('/user');
            this.user = user;
            return user;
        });
    }

    /**
     * Create a new repository
     */
    async createRepository(name, options = {}) {
        const retryManager = RetryManager.forGitHubOperation('repository_creation');
        
        return retryManager.execute(async () => {
            const payload = {
                name,
                description: options.description || '',
                private: options.private || false,
                has_issues: options.hasIssues !== false,
                has_projects: options.hasProjects !== false,
                has_wiki: options.hasWiki !== false,
                auto_init: options.autoInit !== false,
                ...options
            };

            return this.request('/user/repos', {
                method: 'POST',
                body: payload
            });
        });
    }

    /**
     * Get repository information
     */
    async getRepository(owner, repo) {
        const retryManager = RetryManager.forGitHubOperation('repository_read');
        
        return retryManager.execute(async () => {
            return this.request(`/repos/${owner}/${repo}`);
        });
    }

    /**
     * Create or update file in repository
     */
    async createOrUpdateFile(owner, repo, path, content, message, options = {}) {
        const retryManager = RetryManager.forGitHubOperation('file_upload');
        
        return retryManager.execute(async () => {
            const payload = {
                message,
                content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
                ...options
            };

            // Get existing file SHA if updating
            if (!payload.sha) {
                try {
                    const existingFile = await this.request(`/repos/${owner}/${repo}/contents/${path}`);
                    payload.sha = existingFile.sha;
                } catch (error) {
                    // File doesn't exist, creating new file
                    if (error.status !== 404) {
                        throw error;
                    }
                }
            }

            return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
                method: 'PUT',
                body: payload
            });
        });
    }

    /**
     * Enable GitHub Pages for repository
     */
    async enablePages(owner, repo, source = { branch: 'main', path: '/' }) {
        const retryManager = RetryManager.forGitHubOperation('deployment');
        
        return retryManager.execute(async () => {
            return this.request(`/repos/${owner}/${repo}/pages`, {
                method: 'POST',
                body: { source }
            });
        });
    }

    /**
     * Get GitHub Pages information
     */
    async getPages(owner, repo) {
        const retryManager = RetryManager.forGitHubOperation('deployment');
        
        return retryManager.execute(async () => {
            return this.request(`/repos/${owner}/${repo}/pages`);
        });
    }

    /**
     * List user repositories
     */
    async getUserRepositories(options = {}) {
        const retryManager = RetryManager.forGitHubOperation('repository_read');
        
        return retryManager.execute(async () => {
            const params = new URLSearchParams({
                sort: options.sort || 'updated',
                direction: options.direction || 'desc',
                per_page: options.perPage || 30,
                page: options.page || 1
            });

            return this.request(`/user/repos?${params}`);
        });
    }

    /**
     * Delete repository
     */
    async deleteRepository(owner, repo) {
        const retryManager = RetryManager.forGitHubOperation('repository_deletion');
        
        return retryManager.execute(async () => {
            return this.request(`/repos/${owner}/${repo}`, {
                method: 'DELETE'
            });
        });
    }

    /**
     * Get rate limit status
     */
    async getRateLimitStatus() {
        try {
            const response = await this.request('/rate_limit');
            this.rateLimitInfo = {
                remaining: response.rate.remaining,
                reset: response.rate.reset,
                limit: response.rate.limit
            };
            return response;
        } catch (error) {
            // Don't retry rate limit checks to avoid recursion
            throw await GitHubErrorHandler.handleError(error, { operation: 'rate_limit_check' });
        }
    }

    /**
     * Check if authenticated and token is valid
     */
    async validateAuthentication() {
        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Batch operation with progress tracking
     */
    async batchOperation(operations, progressCallback) {
        const results = [];
        const total = operations.length;
        let completed = 0;

        for (const [index, operation] of operations.entries()) {
            try {
                if (progressCallback) {
                    progressCallback({
                        current: index + 1,
                        total,
                        percentage: Math.round(((index + 1) / total) * 100),
                        operation: operation.name || `Operation ${index + 1}`
                    });
                }

                const result = await operation.execute();
                results.push({ success: true, result, index });
                completed++;

            } catch (error) {
                results.push({ 
                    success: false, 
                    error: await GitHubErrorHandler.handleError(error, {
                        operation: operation.name || `Batch operation ${index + 1}`,
                        batchIndex: index,
                        batchTotal: total
                    }), 
                    index 
                });
            }

            // Small delay between operations to be respectful to API
            if (index < operations.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return {
            results,
            completed,
            failed: total - completed,
            total
        };
    }

    /**
     * Health check for GitHub API connectivity
     */
    async healthCheck() {
        const checks = {
            connectivity: false,
            authentication: false,
            rateLimit: false
        };

        try {
            // Test basic connectivity
            await this.request('/');
            checks.connectivity = true;

            // Test authentication if token is set
            if (this.token) {
                await this.getCurrentUser();
                checks.authentication = true;
            }

            // Check rate limit
            await this.getRateLimitStatus();
            checks.rateLimit = this.rateLimitInfo.remaining > 0;

        } catch (error) {
            // Individual check failures are expected
        }

        return checks;
    }
}

// Make available globally
window.GitHubAPI = GitHubAPI;