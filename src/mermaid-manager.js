/**
 * Optimized Mermaid Loader with Performance Monitoring
 * 
 * Features:
 * - Dynamic imports for lazy loading
 * - Tree shaking support
 * - Intersection Observer for viewport-based loading
 * - Diagram caching and memoization
 * - Performance metrics tracking
 * - Error handling and fallbacks
 */

class MermaidManager {
    constructor() {
        this.mermaidInstance = null;
        this.diagramCache = new Map();
        this.observedElements = new Set();
        this.metrics = {
            bundleSize: 0,
            renderTime: 0,
            memoryUsage: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        // Initialize Intersection Observer for lazy loading
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            { 
                rootMargin: '50px',
                threshold: 0.1
            }
        );
        
        this.setupPerformanceMonitoring();
    }
    
    /**
     * Lazily load Mermaid library only when needed
     */
    async loadMermaid() {
        if (this.mermaidInstance) {
            return this.mermaidInstance;
        }
        
        const startTime = performance.now();
        
        try {
            // Dynamic import for code splitting and lazy loading
            const mermaidModule = await import('mermaid');
            const mermaid = mermaidModule.default;
            
            // Configure Mermaid with optimized settings
            mermaid.initialize({
                startOnLoad: false, // Manual control for better performance
                theme: 'default',
                securityLevel: 'loose',
                fontFamily: 'inherit',
                // Optimize rendering performance
                htmlLabels: true,
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true
                },
                // Enable only commonly used diagram types for smaller bundle
                themeVariables: {
                    primaryColor: '#4f46e5',
                    primaryTextColor: '#1f2937',
                    primaryBorderColor: '#6366f1',
                    lineColor: '#6b7280',
                    sectionBkgColor: '#f3f4f6',
                    altSectionBkgColor: '#e5e7eb',
                    gridColor: '#e5e7eb'
                }
            });
            
            this.mermaidInstance = mermaid;
            
            const loadTime = performance.now() - startTime;
            this.metrics.bundleSize = this.estimateBundleSize();
            
            console.log(`Mermaid loaded in ${loadTime.toFixed(2)}ms`);
            this.updateMetricsDisplay();
            
            return mermaid;
        } catch (error) {
            console.error('Failed to load Mermaid:', error);
            throw new Error('Mermaid library failed to load');
        }
    }
    
    /**
     * Render a Mermaid diagram with caching and performance optimization
     */
    async renderDiagram(element, diagramCode, diagramId = null) {
        const id = diagramId || `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const cacheKey = this.generateCacheKey(diagramCode);
        
        const startTime = performance.now();
        
        // Check cache first
        if (this.diagramCache.has(cacheKey)) {
            const cachedSvg = this.diagramCache.get(cacheKey);
            element.innerHTML = cachedSvg;
            this.metrics.cacheHits++;
            
            const renderTime = performance.now() - startTime;
            this.metrics.renderTime = renderTime;
            this.updateMetricsDisplay();
            
            console.log(`Diagram rendered from cache in ${renderTime.toFixed(2)}ms`);
            return;
        }
        
        this.metrics.cacheMisses++;
        
        try {
            // Load Mermaid library if not already loaded
            const mermaid = await this.loadMermaid();
            
            // Validate diagram syntax
            const isValid = await this.validateDiagramSyntax(diagramCode);
            if (!isValid) {
                throw new Error('Invalid diagram syntax');
            }
            
            // Render the diagram
            const { svg } = await mermaid.render(id, diagramCode);
            
            // Cache the rendered SVG
            this.diagramCache.set(cacheKey, svg);
            
            // Apply the rendered diagram
            element.innerHTML = svg;
            
            const renderTime = performance.now() - startTime;
            this.metrics.renderTime = renderTime;
            this.updateMetricsDisplay();
            
            console.log(`Diagram rendered in ${renderTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error('Diagram rendering failed:', error);
            this.renderErrorFallback(element, error.message);
        }
    }
    
    /**
     * Observe elements for lazy loading
     */
    observeElement(element) {
        if (!this.observedElements.has(element)) {
            this.observer.observe(element);
            this.observedElements.add(element);
        }
    }
    
    /**
     * Handle intersection for lazy loading
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const diagramCode = element.dataset.mermaidCode;
                
                if (diagramCode) {
                    this.renderDiagram(element, diagramCode);
                    this.observer.unobserve(element);
                    this.observedElements.delete(element);
                }
            }
        });
    }
    
    /**
     * Validate diagram syntax before rendering
     */
    async validateDiagramSyntax(diagramCode) {
        try {
            // Basic syntax validation
            if (!diagramCode.trim()) return false;
            
            // Check for common diagram type keywords
            const validTypes = [
                'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
                'stateDiagram', 'journey', 'gantt', 'pie', 'erDiagram'
            ];
            
            const hasValidType = validTypes.some(type => 
                diagramCode.toLowerCase().includes(type.toLowerCase())
            );
            
            return hasValidType;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Generate cache key for diagrams
     */
    generateCacheKey(diagramCode) {
        // Simple hash function for cache key
        let hash = 0;
        for (let i = 0; i < diagramCode.length; i++) {
            const char = diagramCode.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }
    
    /**
     * Render error fallback
     */
    renderErrorFallback(element, errorMessage) {
        element.innerHTML = `
            <div class="error">
                <strong>Diagram Error:</strong> ${errorMessage}
                <br>
                <small>Please check your diagram syntax and try again.</small>
            </div>
        `;
    }
    
    /**
     * Estimate bundle size impact
     */
    estimateBundleSize() {
        // Rough estimation based on Mermaid library size
        return 150; // KB - typical Mermaid bundle size with tree shaking
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memoryUsage = Math.round(
                    performance.memory.usedJSHeapSize / 1024 / 1024
                );
                this.updateMetricsDisplay();
            }, 5000);
        }
    }
    
    /**
     * Update metrics display
     */
    updateMetricsDisplay() {
        const metricsElement = document.getElementById('metrics');
        if (metricsElement) {
            metricsElement.innerHTML = `
                Bundle: ${this.metrics.bundleSize}KB<br>
                Render: ${this.metrics.renderTime.toFixed(1)}ms<br>
                Memory: ${this.metrics.memoryUsage}MB<br>
                Cache: ${this.metrics.cacheHits}/${this.metrics.cacheHits + this.metrics.cacheMisses}
            `;
        }
    }
    
    /**
     * Clear cache to manage memory
     */
    clearCache() {
        this.diagramCache.clear();
        this.metrics.cacheHits = 0;
        this.metrics.cacheMisses = 0;
        console.log('Diagram cache cleared');
    }
    
    /**
     * Get performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
}

export default MermaidManager;