/**
 * Tests for Mermaid optimization features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import MermaidManager from './mermaid-manager.js';

describe('MermaidManager', () => {
    let mermaidManager;
    
    beforeEach(() => {
        mermaidManager = new MermaidManager();
    });
    
    describe('Initialization', () => {
        it('should initialize with default metrics', () => {
            const metrics = mermaidManager.getMetrics();
            expect(metrics.bundleSize).toBe(0);
            expect(metrics.renderTime).toBe(0);
            expect(metrics.cacheHits).toBe(0);
            expect(metrics.cacheMisses).toBe(0);
        });
        
        it('should create intersection observer for lazy loading', () => {
            expect(global.IntersectionObserver).toHaveBeenCalled();
        });
    });
    
    describe('Cache Management', () => {
        it('should generate consistent cache keys', () => {
            const diagramCode = 'graph TD\nA --> B';
            const key1 = mermaidManager.generateCacheKey(diagramCode);
            const key2 = mermaidManager.generateCacheKey(diagramCode);
            expect(key1).toBe(key2);
        });
        
        it('should generate different cache keys for different diagrams', () => {
            const diagram1 = 'graph TD\nA --> B';
            const diagram2 = 'graph TD\nC --> D';
            const key1 = mermaidManager.generateCacheKey(diagram1);
            const key2 = mermaidManager.generateCacheKey(diagram2);
            expect(key1).not.toBe(key2);
        });
        
        it('should clear cache when requested', () => {
            // Add something to cache first
            const cacheKey = mermaidManager.generateCacheKey('test');
            mermaidManager.diagramCache.set(cacheKey, '<svg>test</svg>');
            
            expect(mermaidManager.diagramCache.size).toBe(1);
            
            mermaidManager.clearCache();
            expect(mermaidManager.diagramCache.size).toBe(0);
        });
    });
    
    describe('Diagram Validation', () => {
        it('should validate valid diagram syntax', async () => {
            const validDiagram = 'graph TD\nA[Start] --> B[End]';
            const isValid = await mermaidManager.validateDiagramSyntax(validDiagram);
            expect(isValid).toBe(true);
        });
        
        it('should reject empty diagrams', async () => {
            const emptyDiagram = '';
            const isValid = await mermaidManager.validateDiagramSyntax(emptyDiagram);
            expect(isValid).toBe(false);
        });
        
        it('should reject invalid diagram types', async () => {
            const invalidDiagram = 'invalid diagram type\nA --> B';
            const isValid = await mermaidManager.validateDiagramSyntax(invalidDiagram);
            expect(isValid).toBe(false);
        });
        
        it('should validate different diagram types', async () => {
            const diagramTypes = [
                'graph TD\nA --> B',
                'sequenceDiagram\nA->>B: Hello',
                'classDiagram\nclass Animal',
                'stateDiagram\n[*] --> State1',
                'journey\ntitle User Journey',
                'gantt\ntitle Project Timeline',
                'pie title Survey Results',
                'erDiagram\nCUSTOMER ||--o{ ORDER : places'
            ];
            
            for (const diagram of diagramTypes) {
                const isValid = await mermaidManager.validateDiagramSyntax(diagram);
                expect(isValid).toBe(true);
            }
        });
    });
    
    describe('Performance Metrics', () => {
        it('should track bundle size estimation', () => {
            const bundleSize = mermaidManager.estimateBundleSize();
            expect(bundleSize).toBeGreaterThan(0);
            expect(bundleSize).toBeLessThan(200); // Should be under target
        });
        
        it('should update metrics display', () => {
            // Create metrics element
            const metricsElement = document.createElement('div');
            metricsElement.id = 'metrics';
            document.body.appendChild(metricsElement);
            
            mermaidManager.updateMetricsDisplay();
            
            expect(metricsElement.innerHTML).toContain('Bundle:');
            expect(metricsElement.innerHTML).toContain('Render:');
            expect(metricsElement.innerHTML).toContain('Memory:');
        });
    });
    
    describe('Error Handling', () => {
        it('should render error fallback for invalid diagrams', () => {
            const element = document.createElement('div');
            const errorMessage = 'Test error';
            
            mermaidManager.renderErrorFallback(element, errorMessage);
            
            expect(element.innerHTML).toContain('Diagram Error');
            expect(element.innerHTML).toContain(errorMessage);
            expect(element.innerHTML).toContain('error');
        });
    });
    
    describe('Lazy Loading', () => {
        it('should observe elements for lazy loading', () => {
            const element = document.createElement('div');
            
            mermaidManager.observeElement(element);
            
            expect(mermaidManager.observedElements.has(element)).toBe(true);
        });
        
        it('should not observe the same element twice', () => {
            const element = document.createElement('div');
            const observeSpy = vi.spyOn(mermaidManager.observer, 'observe');
            
            mermaidManager.observeElement(element);
            mermaidManager.observeElement(element); // Second call
            
            expect(observeSpy).toHaveBeenCalledTimes(1);
        });
    });
});

describe('Performance Targets', () => {
    let mermaidManager;
    
    beforeEach(() => {
        mermaidManager = new MermaidManager();
    });
    
    it('should meet bundle size target (<200KB)', () => {
        const bundleSize = mermaidManager.estimateBundleSize();
        expect(bundleSize).toBeLessThan(200);
    });
    
    it('should have efficient cache key generation', () => {
        const diagramCode = 'graph TD\nA --> B --> C --> D --> E';
        const startTime = performance.now();
        
        // Generate cache key multiple times
        for (let i = 0; i < 1000; i++) {
            mermaidManager.generateCacheKey(diagramCode);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        // Should be very fast (under 10ms for 1000 operations)
        expect(totalTime).toBeLessThan(10);
    });
});