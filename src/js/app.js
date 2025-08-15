/**
 * Main Application - AI Site Generator
 * Handles real-time markdown preview with Mermaid diagram support
 */
class AISiteGenerator {
    constructor() {
        this.markdownRenderer = new MarkdownRenderer();
        this.mermaidIntegration = new MermaidIntegration();
        this.debounceTimeout = null;
        this.isInitialized = false;
        
        // Performance monitoring
        this.renderStats = {
            totalRenders: 0,
            totalTime: 0,
            averageTime: 0
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // Set up component relationships
            this.markdownRenderer.setMermaidIntegration(this.mermaidIntegration);
            
            // Get DOM elements
            this.setupDOMElements();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial content
            this.loadInitialContent();
            
            // Initialize Mermaid in background
            this.initializeMermaidInBackground();
            
            this.isInitialized = true;
            console.log('AI Site Generator initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Set up DOM element references
     */
    setupDOMElements() {
        this.markdownInput = document.getElementById('markdown-input');
        this.previewOutput = document.getElementById('preview-output');
        
        if (!this.markdownInput || !this.previewOutput) {
            throw new Error('Required DOM elements not found');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Real-time preview with debouncing
        this.markdownInput.addEventListener('input', (e) => {
            this.debouncedPreview(e.target.value);
        });

        // Handle paste events
        this.markdownInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                this.debouncedPreview(this.markdownInput.value);
            }, 10);
        });

        // Keyboard shortcuts
        this.markdownInput.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize handler for responsive diagrams
        window.addEventListener('resize', () => {
            this.debounceTimeout && clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.refreshDiagrams();
            }, 300);
        });
    }

    /**
     * Load initial content with examples
     */
    loadInitialContent() {
        const initialContent = `# Welcome to AI Site Generator

This tool supports **markdown** with *Mermaid diagram* integration!

## Example Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Check setup]
    D --> B
    C --> E[Create amazing sites]
\`\`\`

## Example Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant App
    participant AI
    
    User->>App: Enter markdown
    App->>AI: Process content
    AI->>App: Generate suggestions
    App->>User: Show live preview
\`\`\`

## Supported Features

- **Real-time preview** as you type
- **Mermaid diagrams** with error handling
- **Responsive design** for all screen sizes
- **GitHub Pages** deployment ready

### Try it out!
Edit this content to see the live preview in action. Add your own Mermaid diagrams using the \`\`\`mermaid code blocks.`;

        this.markdownInput.value = initialContent;
        this.updatePreview(initialContent);
    }

    /**
     * Initialize Mermaid in background for better performance
     */
    async initializeMermaidInBackground() {
        try {
            await this.mermaidIntegration.initialize();
            console.log('Mermaid integration ready');
        } catch (error) {
            console.warn('Mermaid initialization failed:', error);
        }
    }

    /**
     * Debounced preview update to avoid excessive rendering
     */
    debouncedPreview(content) {
        clearTimeout(this.debounceTimeout);
        
        // Show updating state
        this.previewOutput.classList.add('updating');
        
        this.debounceTimeout = setTimeout(() => {
            this.updatePreview(content);
        }, 300); // 300ms debounce
    }

    /**
     * Update the preview with new content
     */
    async updatePreview(content) {
        const startTime = performance.now();
        
        try {
            // Render markdown with Mermaid diagrams
            const htmlContent = await this.markdownRenderer.render(content);
            
            // Update preview
            this.previewOutput.innerHTML = htmlContent;
            
            // Remove updating state
            this.previewOutput.classList.remove('updating');
            
            // Track performance
            const renderTime = performance.now() - startTime;
            this.updateRenderStats(renderTime);
            
            // Trigger any post-render processing
            this.postRenderProcessing();
            
        } catch (error) {
            console.error('Preview update failed:', error);
            this.showError('Failed to update preview');
            this.previewOutput.classList.remove('updating');
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Enter for manual refresh
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.updatePreview(this.markdownInput.value);
        }
        
        // Ctrl/Cmd + / for help (future feature)
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            this.showHelp();
        }
    }

    /**
     * Post-render processing for enhanced functionality
     */
    postRenderProcessing() {
        // Add click handlers for external links
        const links = this.previewOutput.querySelectorAll('a[href^="http"]');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        // Add copy buttons to code blocks (future enhancement)
        this.addCopyButtonsToCodeBlocks();
    }

    /**
     * Add copy buttons to code blocks
     */
    addCopyButtonsToCodeBlocks() {
        const codeBlocks = this.previewOutput.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock, index) => {
            if (codeBlock.closest('.mermaid-error')) return; // Skip error blocks
            
            const pre = codeBlock.parentElement;
            if (pre.querySelector('.copy-button')) return; // Already has button
            
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = 'Copy';
            copyButton.onclick = () => this.copyCodeToClipboard(codeBlock, copyButton);
            
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
        });
    }

    /**
     * Copy code block content to clipboard
     */
    async copyCodeToClipboard(codeBlock, button) {
        try {
            await navigator.clipboard.writeText(codeBlock.textContent);
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            button.textContent = 'Failed';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        }
    }

    /**
     * Refresh all diagrams (useful after window resize)
     */
    async refreshDiagrams() {
        if (!this.mermaidIntegration.isAvailable()) return;
        
        // Clear cache and re-render
        this.mermaidIntegration.clearCache();
        await this.updatePreview(this.markdownInput.value);
    }

    /**
     * Show error message to user
     */
    showError(message) {
        this.previewOutput.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <p><small>Please check the console for more details.</small></p>
            </div>
        `;
    }

    /**
     * Show help information (future feature)
     */
    showHelp() {
        // This could open a modal or sidebar with help content
        console.log('Help feature - to be implemented');
    }

    /**
     * Update render performance statistics
     */
    updateRenderStats(renderTime) {
        this.renderStats.totalRenders++;
        this.renderStats.totalTime += renderTime;
        this.renderStats.averageTime = this.renderStats.totalTime / this.renderStats.totalRenders;
        
        // Log performance occasionally
        if (this.renderStats.totalRenders % 10 === 0) {
            console.log(`Render performance: ${this.renderStats.averageTime.toFixed(2)}ms average over ${this.renderStats.totalRenders} renders`);
        }
    }

    /**
     * Get application statistics
     */
    getStats() {
        return {
            renders: this.renderStats,
            mermaidCache: this.mermaidIntegration.getCacheStats(),
            isInitialized: this.isInitialized,
            mermaidAvailable: this.mermaidIntegration.isAvailable()
        };
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new AISiteGenerator();
    await window.app.init();
});