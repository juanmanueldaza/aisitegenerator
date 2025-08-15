/**
 * MermaidIntegration - Handles Mermaid diagram rendering with error handling
 * Provides lazy loading, caching, and comprehensive error management
 */
class MermaidIntegration {
    constructor() {
        this.isLoaded = false;
        this.isLoading = false;
        this.diagramCache = new Map();
        this.diagramCounter = 0;
        this.loadPromise = null;
    }

    /**
     * Initialize Mermaid library with lazy loading
     */
    async initialize() {
        if (this.isLoaded) return true;
        if (this.isLoading) return this.loadPromise;

        this.isLoading = true;
        this.loadPromise = this.loadMermaid();
        
        try {
            await this.loadPromise;
            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('Failed to load Mermaid:', error);
            this.isLoading = false;
            return false;
        }
    }

    /**
     * Load Mermaid library from CDN
     */
    async loadMermaid() {
        return new Promise((resolve, reject) => {
            // Check if Mermaid is already loaded
            if (window.mermaid) {
                this.configureMermaid();
                resolve();
                return;
            }

            // Create script element to load Mermaid
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
            script.async = true;
            
            script.onload = () => {
                try {
                    this.configureMermaid();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load Mermaid library from CDN'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Configure Mermaid with custom settings
     */
    configureMermaid() {
        if (!window.mermaid) {
            throw new Error('Mermaid library not available');
        }

        // Configure Mermaid with security and theme settings
        window.mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'strict',
            htmlLabels: false,
            flowchart: {
                useMaxWidth: true,
                htmlLabels: false,
                curve: 'cardinal'
            },
            sequence: {
                useMaxWidth: true,
                wrap: true
            },
            gantt: {
                useMaxWidth: true
            },
            er: {
                useMaxWidth: true
            },
            journey: {
                useMaxWidth: true
            }
        });
    }

    /**
     * Render a Mermaid diagram from code
     */
    async renderDiagram(diagramCode) {
        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(diagramCode);
            if (this.diagramCache.has(cacheKey)) {
                return this.diagramCache.get(cacheKey);
            }

            // Ensure Mermaid is loaded
            const loaded = await this.initialize();
            if (!loaded) {
                return this.createErrorElement('Failed to load Mermaid library');
            }

            // Validate diagram syntax
            const validationResult = this.validateDiagramSyntax(diagramCode);
            if (!validationResult.isValid) {
                return this.createErrorElement(validationResult.error, diagramCode);
            }

            // Generate unique ID for this diagram
            const diagramId = `mermaid-diagram-${++this.diagramCounter}`;

            try {
                // Render the diagram
                const { svg } = await window.mermaid.render(diagramId, diagramCode);
                
                // Create container with the rendered SVG
                const container = this.createDiagramContainer(svg, diagramId);
                
                // Cache the result
                this.diagramCache.set(cacheKey, container);
                
                return container;
                
            } catch (renderError) {
                console.error('Mermaid render error:', renderError);
                return this.createErrorElement(this.formatRenderError(renderError), diagramCode);
            }

        } catch (error) {
            console.error('Unexpected error in renderDiagram:', error);
            return this.createErrorElement('Unexpected error rendering diagram', diagramCode);
        }
    }

    /**
     * Validate Mermaid diagram syntax
     */
    validateDiagramSyntax(diagramCode) {
        if (!diagramCode || diagramCode.trim().length === 0) {
            return {
                isValid: false,
                error: 'Diagram code is empty'
            };
        }

        // Basic syntax validation for common diagram types
        const trimmedCode = diagramCode.trim();
        const firstLine = trimmedCode.split('\n')[0].trim();

        const validStartPatterns = [
            /^graph\s+(TD|TB|BT|RL|LR)/i,
            /^flowchart\s+(TD|TB|BT|RL|LR)/i,
            /^sequenceDiagram/i,
            /^classDiagram/i,
            /^stateDiagram/i,
            /^erDiagram/i,
            /^journey/i,
            /^gantt/i,
            /^pie/i,
            /^gitGraph/i
        ];

        const isValidStart = validStartPatterns.some(pattern => pattern.test(firstLine));
        
        if (!isValidStart) {
            return {
                isValid: false,
                error: `Invalid diagram type. First line should start with a valid Mermaid diagram type (graph, flowchart, sequenceDiagram, etc.)`
            };
        }

        return { isValid: true };
    }

    /**
     * Create a container for the rendered diagram
     */
    createDiagramContainer(svgContent, diagramId) {
        return `
            <div class="mermaid-container" id="${diagramId}-container">
                <div class="mermaid-diagram">
                    ${svgContent}
                </div>
            </div>
        `;
    }

    /**
     * Create an error element for failed diagram rendering
     */
    createErrorElement(errorMessage, diagramCode = null) {
        const codeBlock = diagramCode ? 
            `<pre><code>${this.escapeHtml(diagramCode)}</code></pre>` : '';
        
        return `
            <div class="mermaid-error">
                <h4>Diagram Rendering Error</h4>
                <p>${this.escapeHtml(errorMessage)}</p>
                ${codeBlock}
                <p><small>Check the <a href="https://mermaid.js.org/syntax/" target="_blank" rel="noopener">Mermaid documentation</a> for syntax help.</small></p>
            </div>
        `;
    }

    /**
     * Format render errors for user-friendly display
     */
    formatRenderError(error) {
        if (error.message) {
            // Common Mermaid error patterns
            if (error.message.includes('Parse error')) {
                return 'Syntax error in diagram code. Please check the diagram syntax.';
            }
            if (error.message.includes('Lexical error')) {
                return 'Invalid characters or tokens in diagram code.';
            }
            if (error.message.includes('Expecting')) {
                return 'Incomplete diagram syntax. ' + error.message;
            }
            return error.message;
        }
        return 'Unknown error occurred while rendering diagram';
    }

    /**
     * Generate cache key for diagram code
     */
    generateCacheKey(diagramCode) {
        // Simple hash function for caching
        let hash = 0;
        for (let i = 0; i < diagramCode.length; i++) {
            const char = diagramCode.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `diagram_${Math.abs(hash)}`;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear diagram cache (useful for memory management)
     */
    clearCache() {
        this.diagramCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.diagramCache.size,
            keys: Array.from(this.diagramCache.keys())
        };
    }

    /**
     * Check if Mermaid is available and loaded
     */
    isAvailable() {
        return this.isLoaded && window.mermaid;
    }
}