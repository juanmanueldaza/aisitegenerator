// GitHub Pages Automation Module
class GitHubPages {
    constructor() {
        this.repository = null;
        this.deploymentStatus = 'ready';
        this.pollInterval = null;
        this.config = {
            source: 'main',
            build_type: 'workflow',
            https_enforced: true,
            custom_domain: ''
        };
    }

    // Initialize GitHub Pages functionality
    init() {
        this.attachEventListeners();
        this.loadConfiguration();
    }

    // Attach event listeners
    attachEventListeners() {
        document.getElementById('deployBtn').addEventListener('click', () => this.deployToPages());
        
        // Configuration change listeners
        document.getElementById('sourceBranch').addEventListener('change', (e) => {
            this.config.source = e.target.value;
        });
        
        document.getElementById('buildSource').addEventListener('change', (e) => {
            this.config.build_type = e.target.value === 'workflow' ? 'workflow' : 'legacy';
        });
        
        document.getElementById('httpsEnforced').addEventListener('change', (e) => {
            this.config.https_enforced = e.target.checked;
        });
        
        document.getElementById('customDomain').addEventListener('input', (e) => {
            this.config.custom_domain = e.target.value.trim();
        });

        // Listen for file upload completion
        window.addEventListener('filesUploaded', (e) => {
            this.repository = e.detail.repository;
            this.autoEnablePages();
        });
    }

    // Load configuration from localStorage
    loadConfiguration() {
        const savedConfig = localStorage.getItem('pages_config');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
            this.updateConfigUI();
        }
    }

    // Save configuration to localStorage
    saveConfiguration() {
        localStorage.setItem('pages_config', JSON.stringify(this.config));
    }

    // Update configuration UI
    updateConfigUI() {
        document.getElementById('sourceBranch').value = this.config.source;
        document.getElementById('buildSource').value = this.config.build_type === 'workflow' ? 'workflow' : 'legacy';
        document.getElementById('httpsEnforced').checked = this.config.https_enforced;
        document.getElementById('customDomain').value = this.config.custom_domain;
    }

    // Automatically enable GitHub Pages after file upload
    async autoEnablePages() {
        if (!this.repository) {
            this.showError('No repository information available.');
            return;
        }

        try {
            this.updateStatus('deploying', 'Automatically enabling GitHub Pages...');
            
            // Check if Pages is already enabled
            const pagesInfo = await this.getPagesInfo();
            
            if (pagesInfo) {
                this.updateStatus('success', 'GitHub Pages already enabled');
                this.showDeploymentInfo(pagesInfo);
                this.startDeploymentMonitoring();
            } else {
                // Enable Pages
                await this.enablePages();
            }
            
        } catch (error) {
            console.error('Auto-enable Pages failed:', error);
            this.handleDeploymentError(error);
        }
    }

    // Deploy to GitHub Pages
    async deployToPages() {
        if (!window.githubAuth.isAuthenticated()) {
            alert('Please authenticate with GitHub first.');
            return;
        }

        if (!this.repository) {
            alert('Please upload files first.');
            return;
        }

        try {
            this.saveConfiguration();
            this.updateStatus('deploying', 'Deploying to GitHub Pages...');
            
            // Enable or update Pages configuration
            const pagesInfo = await this.enablePages();
            this.showDeploymentInfo(pagesInfo);
            
            // Start monitoring deployment
            this.startDeploymentMonitoring();
            
        } catch (error) {
            console.error('Deployment failed:', error);
            this.handleDeploymentError(error);
        }
    }

    // Enable GitHub Pages for the repository
    async enablePages() {
        const { owner, name } = this.repository;
        
        const pagesConfig = {
            source: {
                branch: this.config.source,
                path: '/'
            },
            build_type: this.config.build_type
        };

        // Try to create or update Pages configuration
        try {
            const response = await window.githubAuth.apiRequest(`/repos/${owner.login}/${name}/pages`, {
                method: 'POST',
                body: JSON.stringify(pagesConfig)
            });
            
            // Configure custom domain if specified
            if (this.config.custom_domain) {
                await this.setCustomDomain();
            }
            
            // Configure HTTPS enforcement
            if (this.config.https_enforced && response.html_url) {
                await this.enforceHttps();
            }
            
            return response;
            
        } catch (error) {
            if (error.message.includes('409')) {
                // Pages already exists, try to update
                return await this.updatePagesConfig();
            }
            throw error;
        }
    }

    // Update existing Pages configuration
    async updatePagesConfig() {
        const { owner, name } = this.repository;
        
        const pagesConfig = {
            source: {
                branch: this.config.source,
                path: '/'
            },
            build_type: this.config.build_type,
            https_enforced: this.config.https_enforced
        };

        const response = await window.githubAuth.apiRequest(`/repos/${owner.login}/${name}/pages`, {
            method: 'PUT',
            body: JSON.stringify(pagesConfig)
        });

        return response;
    }

    // Get current Pages information
    async getPagesInfo() {
        try {
            const { owner, name } = this.repository;
            const response = await window.githubAuth.apiRequest(`/repos/${owner.login}/${name}/pages`);
            return response;
        } catch (error) {
            if (error.message.includes('404')) {
                return null; // Pages not enabled
            }
            throw error;
        }
    }

    // Set custom domain
    async setCustomDomain() {
        if (!this.config.custom_domain) return;
        
        const { owner, name } = this.repository;
        
        await window.githubAuth.apiRequest(`/repos/${owner.login}/${name}/pages`, {
            method: 'PUT',
            body: JSON.stringify({
                cname: this.config.custom_domain
            })
        });
    }

    // Enforce HTTPS
    async enforceHttps() {
        const { owner, name } = this.repository;
        
        await window.githubAuth.apiRequest(`/repos/${owner.login}/${name}/pages`, {
            method: 'PUT',
            body: JSON.stringify({
                https_enforced: true
            })
        });
    }

    // Start monitoring deployment status
    startDeploymentMonitoring() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }

        this.pollInterval = setInterval(async () => {
            try {
                await this.checkDeploymentStatus();
            } catch (error) {
                console.error('Status check failed:', error);
            }
        }, 10000); // Check every 10 seconds

        // Stop monitoring after 10 minutes
        setTimeout(() => {
            if (this.pollInterval) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
        }, 600000);
    }

    // Check deployment status
    async checkDeploymentStatus() {
        try {
            const { owner, name } = this.repository;
            
            // Get latest deployment
            const deployments = await window.githubAuth.apiRequest(`/repos/${owner.login}/${name}/deployments?environment=github-pages&per_page=1`);
            
            if (deployments.length > 0) {
                const deployment = deployments[0];
                const statuses = await window.githubAuth.apiRequest(`/repos/${owner.login}/${name}/deployments/${deployment.id}/statuses`);
                
                if (statuses.length > 0) {
                    const latestStatus = statuses[0];
                    
                    if (latestStatus.state === 'success') {
                        this.updateStatus('success', 'Deployment completed successfully!');
                        this.stopMonitoring();
                        
                        // Update deployment info
                        const pagesInfo = await this.getPagesInfo();
                        this.showDeploymentInfo(pagesInfo);
                        
                    } else if (latestStatus.state === 'failure' || latestStatus.state === 'error') {
                        this.updateStatus('error', 'Deployment failed');
                        this.handleDeploymentError(new Error(latestStatus.description || 'Deployment failed'));
                        this.stopMonitoring();
                    }
                }
            }
        } catch (error) {
            console.error('Status check error:', error);
        }
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    // Update deployment status
    updateStatus(status, message) {
        this.deploymentStatus = status;
        
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        statusIndicator.className = `status-indicator ${status}`;
        statusText.textContent = message;
    }

    // Show deployment information
    showDeploymentInfo(pagesInfo) {
        const deploymentInfo = document.getElementById('deploymentInfo');
        const siteUrl = document.getElementById('siteUrl');
        const deploymentStatusText = document.getElementById('deploymentStatusText');
        const lastUpdated = document.getElementById('lastUpdated');
        
        deploymentInfo.classList.remove('hidden');
        
        if (pagesInfo.html_url) {
            siteUrl.href = pagesInfo.html_url;
            siteUrl.textContent = pagesInfo.html_url;
        }
        
        deploymentStatusText.textContent = pagesInfo.status || 'Live';
        lastUpdated.textContent = new Date().toLocaleString();
        
        // Hide error message if shown
        document.getElementById('errorMessage').classList.add('hidden');
    }

    // Handle deployment errors
    handleDeploymentError(error) {
        this.updateStatus('error', 'Deployment failed');
        
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        const troubleshootingTips = document.getElementById('troubleshootingTips');
        
        errorMessage.classList.remove('hidden');
        errorText.textContent = error.message;
        
        // Generate troubleshooting tips based on error
        const tips = this.generateTroubleshootingTips(error);
        troubleshootingTips.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
        
        // Hide deployment info
        document.getElementById('deploymentInfo').classList.add('hidden');
    }

    // Generate troubleshooting tips
    generateTroubleshootingTips(error) {
        const tips = [];
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
            tips.push('Ensure the repository exists and you have the necessary permissions');
            tips.push('Check if GitHub Pages is available for your account type');
        }
        
        if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
            tips.push('Verify your GitHub token has the required permissions (repo scope)');
            tips.push('Check if GitHub Pages is enabled for private repositories (requires paid plan)');
        }
        
        if (errorMessage.includes('422') || errorMessage.includes('validation')) {
            tips.push('Check your repository settings and ensure the source branch exists');
            tips.push('Verify the custom domain format is correct (if used)');
        }
        
        if (errorMessage.includes('rate limit')) {
            tips.push('GitHub API rate limit exceeded - please wait and try again later');
            tips.push('Consider authenticating to increase your rate limit');
        }
        
        // Default tips
        if (tips.length === 0) {
            tips.push('Check your internet connection and try again');
            tips.push('Ensure your repository has at least one file (like index.html)');
            tips.push('Verify GitHub Pages is available for your repository type');
            tips.push('Check GitHub Status page for any ongoing issues');
        }
        
        return tips;
    }

    // Get current repository
    getCurrentRepository() {
        return this.repository;
    }

    // Get deployment status
    getDeploymentStatus() {
        return this.deploymentStatus;
    }
}

// Initialize GitHub Pages when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.githubPages = new GitHubPages();
    window.githubPages.init();
});