/**
 * Main Application Script
 * Initializes the AI Site Generator with comprehensive GitHub error handling
 */

class AISiteGenerator {
    constructor() {
        this.auth = new GitHubAuth();
        this.isInitialized = false;
        this.currentProject = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading state
            Progress.show({
                title: 'Initializing AI Site Generator',
                message: 'Setting up the application...',
                percentage: 0
            });

            // Initialize authentication
            Progress.update({ percentage: 25, message: 'Initializing authentication...' });
            await this.auth.init();

            // Set up event handlers
            Progress.update({ percentage: 50, message: 'Setting up event handlers...' });
            this.setupEventHandlers();

            // Check GitHub connectivity
            Progress.update({ percentage: 75, message: 'Testing GitHub connectivity...' });
            await this.checkGitHubConnectivity();

            Progress.update({ percentage: 100, message: 'Application ready!' });

            this.isInitialized = true;

            setTimeout(() => {
                Progress.hide();
                this.showWelcomeMessage();
            }, 1500);

        } catch (error) {
            Progress.hide();
            
            const handledError = await GitHubErrorHandler.handleError(error, {
                operation: 'application_initialization'
            });
            
            ErrorModal.showError(handledError);
        }
    }

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Chat input handler
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        const sendMessage = async () => {
            const message = chatInput.value.trim();
            if (!message || !this.auth.isAuthenticated()) return;

            try {
                await this.processUserMessage(message);
                chatInput.value = '';
            } catch (error) {
                const handledError = await GitHubErrorHandler.handleError(error, {
                    operation: 'chat_message_processing'
                });
                
                ErrorModal.showError(handledError);
            }
        };

        sendBtn.onclick = sendMessage;
        chatInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        };

        // Network status monitoring
        window.addEventListener('online', () => {
            Toast.success('Connection Restored', 'Back online - you can continue working');
        });

        window.addEventListener('offline', () => {
            Toast.warning('Connection Lost', 'Working offline - some features may be limited');
        });

        // Visibility change handler for token validation
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.auth.isAuthenticated()) {
                this.validateAuthenticationInBackground();
            }
        });

        // Periodic health checks
        setInterval(() => {
            if (this.auth.isAuthenticated()) {
                this.performHealthCheck();
            }
        }, 300000); // Every 5 minutes
    }

    /**
     * Check GitHub connectivity and API status
     */
    async checkGitHubConnectivity() {
        try {
            const healthCheck = await this.auth.getAPI().healthCheck();
            
            if (!healthCheck.connectivity) {
                throw new Error('GitHub API is not accessible');
            }

            return healthCheck;
        } catch (error) {
            // Don't throw here, just log the issue
            console.warn('GitHub connectivity check failed:', error);
            return { connectivity: false, authentication: false, rateLimit: false };
        }
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        if (this.auth.isAuthenticated()) {
            const user = this.auth.getCurrentUser();
            this.addChatMessage('system', `Welcome back, ${user.login}! I'm ready to help you create amazing websites. What would you like to build today?`);
        } else {
            this.addChatMessage('system', 'Welcome to AI Site Generator! Please connect your GitHub account to get started with creating your website.');
        }
    }

    /**
     * Process user chat message
     */
    async processUserMessage(message) {
        // Add user message to chat
        this.addChatMessage('user', message);

        // Show typing indicator
        const typingId = this.addChatMessage('system', 'Thinking...', true);

        try {
            // Simulate AI processing (replace with actual AI integration)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Remove typing indicator
            this.removeChatMessage(typingId);

            // Generate response based on message
            const response = await this.generateAIResponse(message);
            this.addChatMessage('system', response);

            // Check if message indicates a specific action
            await this.handleUserIntent(message);

        } catch (error) {
            this.removeChatMessage(typingId);
            
            const handledError = await GitHubErrorHandler.handleError(error, {
                operation: 'ai_response_generation',
                userMessage: message
            });
            
            this.addChatMessage('system', `I'm sorry, I encountered an error while processing your request: ${handledError.message}`);
        }
    }

    /**
     * Generate AI response (placeholder for actual AI integration)
     */
    async generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('create') && lowerMessage.includes('repository')) {
            return "I can help you create a new repository! What would you like to name it, and what type of website are you planning to build?";
        }

        if (lowerMessage.includes('deploy') || lowerMessage.includes('publish')) {
            return "Great! I can help you deploy your website using GitHub Pages. First, let me make sure your repository is set up correctly.";
        }

        if (lowerMessage.includes('error') || lowerMessage.includes('problem')) {
            return "I'm here to help troubleshoot any issues. Can you tell me more about what specific error or problem you're experiencing?";
        }

        return "I understand you want to create a website. Let me help you get started! Would you like to create a new repository, or do you have an existing one you'd like to work with?";
    }

    /**
     * Handle user intent based on message
     */
    async handleUserIntent(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('test') && (lowerMessage.includes('connection') || lowerMessage.includes('github'))) {
            await this.auth.testAuthentication();
        }

        if (lowerMessage.includes('create') && lowerMessage.includes('repository')) {
            // Could trigger repository creation flow
            console.log('User wants to create repository');
        }
    }

    /**
     * Add message to chat
     */
    addChatMessage(sender, message, isTyping = false) {
        const chatMessages = document.getElementById('chat-messages');
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const messageElement = document.createElement('div');
        messageElement.id = messageId;
        messageElement.className = `chat-message ${sender}`;
        
        if (isTyping) {
            messageElement.classList.add('typing');
        }

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message;

        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();

        messageElement.appendChild(content);
        messageElement.appendChild(timestamp);

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return messageId;
    }

    /**
     * Remove message from chat
     */
    removeChatMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }

    /**
     * Validate authentication in background
     */
    async validateAuthenticationInBackground() {
        try {
            const isValid = await this.auth.getAPI().validateAuthentication();
            if (!isValid && this.auth.isAuthenticated()) {
                // Token is no longer valid
                await this.auth.signOut();
                Toast.warning('Session Expired', 'Please sign in again to continue');
            }
        } catch (error) {
            // Silent failure for background validation
            console.warn('Background auth validation failed:', error);
        }
    }

    /**
     * Perform periodic health check
     */
    async performHealthCheck() {
        try {
            const healthCheck = await this.auth.getAPI().healthCheck();
            
            // Update UI based on health status
            const statusIndicator = document.querySelector('.status-indicator');
            if (statusIndicator) {
                if (healthCheck.connectivity && healthCheck.authentication) {
                    statusIndicator.className = 'status-indicator online';
                } else if (healthCheck.connectivity) {
                    statusIndicator.className = 'status-indicator loading';
                } else {
                    statusIndicator.className = 'status-indicator offline';
                }
            }

        } catch (error) {
            // Silent failure for health checks
            console.warn('Health check failed:', error);
        }
    }

    /**
     * Create a new website project
     */
    async createProject(projectName, options = {}) {
        try {
            return await Progress.trackGitHubOperation(
                'Creating Website Project',
                async (updateProgress) => {
                    updateProgress({
                        percentage: 10,
                        message: 'Creating GitHub repository...',
                        detail: `Repository: ${projectName}`
                    });

                    // Create repository
                    const repo = await this.auth.getAPI().createRepository(projectName, {
                        description: options.description || 'AI-generated website',
                        private: false,
                        auto_init: true
                    });

                    updateProgress({
                        percentage: 30,
                        message: 'Repository created successfully',
                        detail: `URL: ${repo.html_url}`
                    });

                    updateProgress({
                        percentage: 50,
                        message: 'Creating website files...',
                        detail: 'Generating HTML, CSS, and JavaScript'
                    });

                    // Create basic website files
                    await this.createBasicWebsiteFiles(repo.owner.login, repo.name, options);

                    updateProgress({
                        percentage: 80,
                        message: 'Enabling GitHub Pages...',
                        detail: 'Setting up deployment'
                    });

                    // Enable GitHub Pages
                    await this.auth.getAPI().enablePages(repo.owner.login, repo.name);

                    updateProgress({
                        percentage: 100,
                        message: 'Project created successfully!',
                        detail: `Your website will be available at: https://${repo.owner.login}.github.io/${repo.name}`
                    });

                    return repo;
                }
            );
        } catch (error) {
            throw await GitHubErrorHandler.handleError(error, {
                operation: 'project_creation',
                projectName
            });
        }
    }

    /**
     * Create basic website files
     */
    async createBasicWebsiteFiles(owner, repo, options) {
        const api = this.auth.getAPI();
        const operations = [];

        // Create index.html
        operations.push({
            name: 'Creating index.html',
            execute: () => api.createOrUpdateFile(
                owner, repo, 'index.html',
                this.generateIndexHTML(options),
                'Add basic HTML structure'
            )
        });

        // Create style.css
        operations.push({
            name: 'Creating style.css',
            execute: () => api.createOrUpdateFile(
                owner, repo, 'style.css',
                this.generateCSS(options),
                'Add styling'
            )
        });

        // Execute all operations
        const results = await api.batchOperation(operations);
        
        if (results.failed > 0) {
            throw new Error(`Failed to create ${results.failed} files`);
        }

        return results;
    }

    /**
     * Generate basic HTML content
     */
    generateIndexHTML(options) {
        const title = options.title || 'My AI-Generated Website';
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>${title}</h1>
    </header>
    <main>
        <section>
            <h2>Welcome!</h2>
            <p>This website was created using AI Site Generator.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 Created with AI Site Generator</p>
    </footer>
</body>
</html>`;
    }

    /**
     * Generate basic CSS content
     */
    generateCSS(options) {
        return `/* AI-Generated CSS */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
}

header {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

section {
    padding: 2rem 0;
}

footer {
    text-align: center;
    padding: 2rem 0;
    color: #666;
}`;
    }
}

// Add CSS for chat messages
const chatStyle = document.createElement('style');
chatStyle.textContent = `
    .chat-message {
        margin: 1rem 0;
        padding: 1rem;
        border-radius: 8px;
        position: relative;
    }
    
    .chat-message.user {
        background-color: #007bff;
        color: white;
        margin-left: 2rem;
        text-align: right;
    }
    
    .chat-message.system {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        margin-right: 2rem;
    }
    
    .chat-message.typing {
        opacity: 0.7;
    }
    
    .message-content {
        margin-bottom: 0.5rem;
    }
    
    .message-timestamp {
        font-size: 0.8rem;
        opacity: 0.7;
    }
    
    .chat-message.user .message-timestamp {
        text-align: right;
    }
`;
document.head.appendChild(chatStyle);

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new AISiteGenerator();
    await app.init();
    
    // Make app available globally for debugging
    window.app = app;
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', async (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    const handledError = await GitHubErrorHandler.handleError(event.reason, {
        operation: 'unhandled_promise_rejection'
    });
    
    // Show toast for unhandled errors
    Toast.error('Unexpected Error', handledError.message);
    
    // Prevent default browser error handling
    event.preventDefault();
});