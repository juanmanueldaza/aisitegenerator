/**
 * Main application entry point
 * Integrates optimized Mermaid rendering with live preview
 */

import MermaidManager from './mermaid-manager.js';

class AISiteGenerator {
    constructor() {
        this.mermaidManager = new MermaidManager();
        this.debounceTimer = null;
        this.editor = null;
        this.previewContent = null;
        
        this.init();
    }
    
    async init() {
        // Get DOM elements
        this.editor = document.getElementById('editor');
        this.previewContent = document.getElementById('preview-content');
        
        if (!this.editor || !this.previewContent) {
            console.error('Required DOM elements not found');
            return;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.updatePreview();
        
        console.log('AI Site Generator initialized with optimized Mermaid support');
    }
    
    setupEventListeners() {
        // Debounced input handling for performance
        this.editor.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.updatePreview();
            }, 300); // 300ms debounce for optimal UX
        });
        
        // Keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.updatePreview();
            }
        });
        
        // Handle window resize for responsive diagrams
        window.addEventListener('resize', this.debounce(() => {
            this.refreshVisibleDiagrams();
        }, 250));
    }
    
    async updatePreview() {
        const content = this.editor.value;
        
        if (!content.trim()) {
            this.previewContent.innerHTML = '<div class="loading">Start typing to see preview...</div>';
            return;
        }
        
        try {
            const processedContent = await this.processContent(content);
            this.previewContent.innerHTML = processedContent;
            
            // Render any Mermaid diagrams
            await this.renderMermaidDiagrams();
            
        } catch (error) {
            console.error('Preview update failed:', error);
            this.previewContent.innerHTML = `
                <div class="error">
                    <strong>Preview Error:</strong> ${error.message}
                </div>
            `;
        }
    }
    
    async processContent(content) {
        // Process markdown-style content with Mermaid blocks
        let processed = content;
        
        // Convert basic markdown
        processed = this.convertBasicMarkdown(processed);
        
        // Process Mermaid code blocks
        processed = await this.processMermaidBlocks(processed);
        
        return processed;
    }
    
    convertBasicMarkdown(content) {
        // Basic markdown conversion
        let html = content
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        return `<p>${html}</p>`;
    }
    
    async processMermaidBlocks(content) {
        // Find Mermaid code blocks with flexible regex
        const mermaidRegex = /```mermaid\s*([\s\S]*?)\s*```/g;
        const matches = [...content.matchAll(mermaidRegex)];
        
        if (matches.length === 0) {
            return content;
        }
        
        let processed = content;
        
        for (const match of matches) {
            const fullMatch = match[0];
            const diagramCode = match[1].trim();
            const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Create placeholder div with data attribute for lazy loading
            const placeholder = `
                <div class="mermaid-container">
                    <div id="${diagramId}" 
                         class="mermaid-diagram" 
                         data-mermaid-code="${this.escapeHtml(diagramCode)}">
                        <div class="loading">Loading diagram...</div>
                    </div>
                </div>
            `;
            
            processed = processed.replace(fullMatch, placeholder);
        }
        
        return processed;
    }
    
    async renderMermaidDiagrams() {
        const diagramElements = this.previewContent.querySelectorAll('.mermaid-diagram');
        
        for (const element of diagramElements) {
            const diagramCode = element.dataset.mermaidCode;
            
            if (diagramCode) {
                // Check if element is in viewport for immediate rendering
                if (this.isInViewport(element)) {
                    await this.mermaidManager.renderDiagram(element, diagramCode, element.id);
                } else {
                    // Use lazy loading for off-screen diagrams
                    this.mermaidManager.observeElement(element);
                }
            }
        }
    }
    
    refreshVisibleDiagrams() {
        const diagramElements = this.previewContent.querySelectorAll('.mermaid-diagram');
        
        diagramElements.forEach(element => {
            if (this.isInViewport(element) && element.innerHTML.includes('Loading diagram...')) {
                const diagramCode = element.dataset.mermaidCode;
                if (diagramCode) {
                    this.mermaidManager.renderDiagram(element, diagramCode, element.id);
                }
            }
        });
    }
    
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Public API for performance monitoring
    getPerformanceMetrics() {
        return this.mermaidManager.getMetrics();
    }
    
    clearDiagramCache() {
        this.mermaidManager.clearCache();
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AISiteGenerator();
});

// Export for testing and external usage
export default AISiteGenerator;