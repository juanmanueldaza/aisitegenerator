/**
 * Main application file - AI Site Generator
 * Integrates Gemini API client with comprehensive error handling
 */

import { GeminiApiClient } from './gemini-api-client.js';
import { UIErrorManager } from './ui-error-manager.js';

class AISiteGenerator {
    constructor() {
        this.geminiClient = null;
        this.uiManager = new UIErrorManager();
        this.currentRequest = null;
        this.requestHistory = [];
        
        this.initializeUI();
        this.setupApiClient();
        this.setupEventHandlers();
    }

    initializeUI() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.previewFrame = document.getElementById('previewFrame');
        this.refreshPreview = document.getElementById('refreshPreview');
    }

    setupApiClient() {
        // Initialize with configuration (API key would be set by user)
        this.geminiClient = new GeminiApiClient({
            fallbackEnabled: true
        });

        // Set up event listeners for error handling
        this.geminiClient.on('error', (data) => {
            this.handleApiError(data.error, data.context);
        });

        this.geminiClient.on('retry', (data) => {
            this.uiManager.showRetryProgress(
                data.attempt, 
                3, // max attempts
                data.delay, 
                data.error
            );
        });

        this.geminiClient.on('rateLimit', (data) => {
            this.uiManager.showRateLimitWarning(data.waitTime);
        });

        this.geminiClient.on('quotaWarning', (data) => {
            this.uiManager.showQuotaWarning(data);
        });

        this.geminiClient.on('fallback', (data) => {
            this.uiManager.showFallbackMode(data.type, data.context);
        });

        // Update status indicator
        this.updateApiStatus();
    }

    setupEventHandlers() {
        // Send message
        this.sendButton?.addEventListener('click', () => {
            this.sendMessage();
        });

        this.userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Preview refresh
        this.refreshPreview?.addEventListener('click', () => {
            this.refreshWebsitePreview();
        });

        // API key configuration (would be implemented based on actual UI)
        document.addEventListener('apiKeyConfigured', (e) => {
            this.geminiClient.setApiKey(e.detail.apiKey);
            this.updateApiStatus();
        });

        // Offline mode toggle
        document.addEventListener('offlineModeToggle', (e) => {
            if (e.detail.enabled) {
                this.geminiClient.enableOfflineMode();
            } else {
                this.geminiClient.disableOfflineMode();
            }
            this.updateApiStatus();
        });
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Clear input and add user message to chat
        this.userInput.value = '';
        this.addMessageToChat('user', message);

        // Generate request ID for tracking
        const requestId = this.generateRequestId();
        this.currentRequest = requestId;

        try {
            // Show loading state
            this.uiManager.showLoading('Generating response...');
            this.uiManager.updateApiStatus('loading');

            // Set up retry callback
            const retryCallback = () => {
                this.processMessage(message, requestId);
            };
            this.uiManager.setRetryCallback(requestId, retryCallback);

            // Process the message
            await this.processMessage(message, requestId);

        } catch (error) {
            console.error('Error processing message:', error);
        } finally {
            this.uiManager.hideLoading();
            this.uiManager.removeRetryCallback(requestId);
            this.currentRequest = null;
            this.updateApiStatus();
        }
    }

    async processMessage(message, _requestId) {
        let response;
        const messageType = this.classifyMessage(message);

        switch (messageType) {
            case 'website_structure':
                response = await this.geminiClient.generateWebsiteStructure(
                    message, 
                    { 
                        style: 'modern',
                        audience: 'general',
                        cache: true 
                    }
                );
                break;

            case 'page_content':
                response = await this.geminiClient.generatePageContent(
                    'general',
                    message,
                    { 
                        tone: 'professional',
                        length: 'medium',
                        cache: true 
                    }
                );
                break;

            case 'optimization':
                response = await this.geminiClient.optimizeContent(
                    this.getLastGeneratedContent(),
                    message,
                    { 
                        target: 'general audience',
                        cache: true 
                    }
                );
                break;

            default:
                response = await this.geminiClient.generateContent(
                    message,
                    { 
                        temperature: 0.7,
                        cache: true 
                    }
                );
            }

            // Add AI response to chat
            this.addMessageToChat('assistant', response.text);

            // Update preview if applicable
            if (messageType === 'website_structure' || messageType === 'page_content') {
                this.updateWebsitePreview(response.text);
            }

            // Store in history
            this.requestHistory.push({
                request: message,
                response: response.text,
                timestamp: Date.now(),
                type: messageType
            });
    }

    handleApiError(error, context) {
        // Create retry callback if the error is retryable
        let retryCallback = null;
        if (error.retryable && context.prompt) {
            retryCallback = () => {
                this.processMessage(context.prompt, this.currentRequest || this.generateRequestId());
            };
        }

        // Show error to user
        this.uiManager.showError(error, { 
            ...context, 
            retryCallback 
        });

        // Add error message to chat for user awareness
        const errorMessage = error.toUserMessage();
        this.addMessageToChat('system', `Error: ${errorMessage.message}`);

        // Update API status
        this.updateApiStatus();
    }

    classifyMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('website') && (lowerMessage.includes('structure') || lowerMessage.includes('layout'))) {
            return 'website_structure';
        }
        
        if (lowerMessage.includes('page') || lowerMessage.includes('content')) {
            return 'page_content';
        }
        
        if (lowerMessage.includes('improve') || lowerMessage.includes('optimize') || lowerMessage.includes('better')) {
            return 'optimization';
        }
        
        return 'general';
    }

    addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const messageContent = document.createElement('p');
        messageContent.textContent = content;
        messageDiv.appendChild(messageContent);

        // Add timestamp
        const timestamp = document.createElement('small');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        messageDiv.appendChild(timestamp);

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    updateWebsitePreview(content) {
        try {
            // Extract HTML structure from AI response (simplified)
            const htmlContent = this.extractHtmlFromResponse(content);
            this.previewFrame.srcdoc = htmlContent;
        } catch (error) {
            console.error('Error updating preview:', error);
        }
    }

    extractHtmlFromResponse(content) {
        // This is a simplified implementation
        // In a real application, you'd have more sophisticated parsing
        
        if (content.includes('<!DOCTYPE html>')) {
            return content;
        }
        
        // Generate basic HTML structure
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Generated Website</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    h1, h2, h3 { color: #333; }
                    .container { max-width: 800px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="container">
                    <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 20px; border-radius: 5px;">${content}</pre>
                </div>
            </body>
            </html>
        `;
    }

    refreshWebsitePreview() {
        if (this.requestHistory.length > 0) {
            const lastWebsiteContent = this.requestHistory
                .reverse()
                .find(item => item.type === 'website_structure' || item.type === 'page_content');
            
            if (lastWebsiteContent) {
                this.updateWebsitePreview(lastWebsiteContent.response);
            }
        }
    }

    getLastGeneratedContent() {
        if (this.requestHistory.length > 0) {
            return this.requestHistory[this.requestHistory.length - 1].response;
        }
        return '';
    }

    updateApiStatus() {
        if (!this.geminiClient) {
            this.uiManager.updateApiStatus('error', 'API client not initialized');
            return;
        }

        const status = this.geminiClient.getStatus();
        
        if (!status.apiKeyConfigured) {
            this.uiManager.updateApiStatus('error', 'API key not configured');
        } else if (status.offlineMode) {
            this.uiManager.updateApiStatus('offline', 'Offline mode enabled');
        } else if (status.circuitBreaker.state === 'OPEN') {
            this.uiManager.updateApiStatus('error', 'Service circuit breaker is open');
        } else if (status.rateLimiter.recentRequestsPerMinute >= 50) {
            this.uiManager.updateApiStatus('rateLimit', 'Approaching rate limit');
        } else {
            this.uiManager.updateApiStatus('ready');
        }
    }

    generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Public API methods
    setApiKey(apiKey) {
        this.geminiClient.setApiKey(apiKey);
        this.updateApiStatus();
    }

    enableOfflineMode() {
        this.geminiClient.enableOfflineMode();
        this.updateApiStatus();
    }

    disableOfflineMode() {
        this.geminiClient.disableOfflineMode();
        this.updateApiStatus();
    }

    getStatus() {
        return this.geminiClient ? this.geminiClient.getStatus() : null;
    }

    clearCache() {
        if (this.geminiClient) {
            this.geminiClient.clearCache();
        }
    }

    resetCircuitBreaker() {
        if (this.geminiClient) {
            this.geminiClient.resetCircuitBreaker();
            this.updateApiStatus();
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiSiteGenerator = new AISiteGenerator();
    
    // For development/testing purposes, expose some methods globally
    window.setApiKey = (key) => window.aiSiteGenerator.setApiKey(key);
    window.enableOfflineMode = () => window.aiSiteGenerator.enableOfflineMode();
    window.disableOfflineMode = () => window.aiSiteGenerator.disableOfflineMode();
    window.getStatus = () => window.aiSiteGenerator.getStatus();
    
    console.log('AI Site Generator initialized with comprehensive error handling');
});
