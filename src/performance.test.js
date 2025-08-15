/**
 * Performance benchmarks for Mermaid optimization
 * Validates that all performance targets are met
 */

import { describe, it, expect, beforeEach } from 'vitest';
import MermaidManager from './mermaid-manager.js';

describe('Performance Benchmarks', () => {
    let mermaidManager;
    
    beforeEach(() => {
        mermaidManager = new MermaidManager();
    });

    describe('Bundle Size Targets', () => {
        it('should keep estimated bundle size under 200KB target', () => {
            const estimatedSize = mermaidManager.estimateBundleSize();
            
            // Target: Bundle size increase < 200KB
            expect(estimatedSize).toBeLessThan(200);
            expect(estimatedSize).toBeGreaterThan(0);
            
            console.log(`✅ Bundle size: ${estimatedSize}KB (target: <200KB)`);
        });
        
        it('should maintain small core application size', () => {
            // The core app without Mermaid should be minimal
            const metrics = mermaidManager.getMetrics();
            expect(metrics.bundleSize).toBe(0); // Not loaded yet
        });
    });

    describe('Performance Targets', () => {
        it('should have efficient cache key generation (< 1ms per operation)', () => {
            const testDiagram = 'graph TD\n'.repeat(100) + 'A --> B';
            const iterations = 1000;
            
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                mermaidManager.generateCacheKey(testDiagram + i);
            }
            
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / iterations;
            
            // Should be very fast (< 1ms per operation)
            expect(avgTime).toBeLessThan(1);
            
            console.log(`✅ Cache key generation: ${avgTime.toFixed(3)}ms per operation`);
        });
        
        it('should handle large diagrams efficiently', () => {
            // Create a large diagram
            const largeDiagram = 'graph TD\n' + 
                Array.from({ length: 100 }, (_, i) => `A${i} --> A${i + 1}`).join('\n');
            
            const startTime = performance.now();
            const isValid = mermaidManager.validateDiagramSyntax(largeDiagram);
            const endTime = performance.now();
            
            const validationTime = endTime - startTime;
            
            expect(isValid).toBe(true);
            expect(validationTime).toBeLessThan(10); // Should validate quickly
            
            console.log(`✅ Large diagram validation: ${validationTime.toFixed(2)}ms`);
        });
    });

    describe('Memory Efficiency', () => {
        it('should manage cache size efficiently', () => {
            const initialSize = mermaidManager.diagramCache.size;
            
            // Add multiple diagrams to cache
            for (let i = 0; i < 10; i++) {
                const key = mermaidManager.generateCacheKey(`diagram-${i}`);
                mermaidManager.diagramCache.set(key, `<svg>diagram-${i}</svg>`);
            }
            
            expect(mermaidManager.diagramCache.size).toBe(10);
            
            // Clear cache
            mermaidManager.clearCache();
            expect(mermaidManager.diagramCache.size).toBe(0);
            
            console.log('✅ Cache management: Working correctly');
        });
        
        it('should handle concurrent operations safely', () => {
            const promises = [];
            
            // Simulate concurrent validation operations
            for (let i = 0; i < 10; i++) {
                promises.push(
                    mermaidManager.validateDiagramSyntax(`graph TD\nA${i} --> B${i}`)
                );
            }
            
            return Promise.all(promises).then(results => {
                expect(results).toHaveLength(10);
                expect(results.every(r => r === true)).toBe(true);
                
                console.log('✅ Concurrent operations: Handled safely');
            });
        });
    });

    describe('Error Handling Performance', () => {
        it('should handle invalid syntax quickly', async () => {
            const invalidDiagram = 'invalid syntax here';
            
            const startTime = performance.now();
            const isValid = await mermaidManager.validateDiagramSyntax(invalidDiagram);
            const endTime = performance.now();
            
            const validationTime = endTime - startTime;
            
            expect(isValid).toBe(false);
            expect(validationTime).toBeLessThan(5); // Should fail fast
            
            console.log(`✅ Invalid syntax handling: ${validationTime.toFixed(2)}ms`);
        });
        
        it('should render error fallbacks quickly', () => {
            const element = document.createElement('div');
            const errorMessage = 'Test error message';
            
            const startTime = performance.now();
            mermaidManager.renderErrorFallback(element, errorMessage);
            const endTime = performance.now();
            
            const renderTime = endTime - startTime;
            
            expect(element.innerHTML).toContain('Diagram Error');
            expect(renderTime).toBeLessThan(1); // Should be near-instantaneous
            
            console.log(`✅ Error fallback rendering: ${renderTime.toFixed(2)}ms`);
        });
    });

    describe('Integration Performance', () => {
        it('should meet all performance targets simultaneously', async () => {
            const metrics = {
                bundleSize: mermaidManager.estimateBundleSize(),
                cachePerformance: 0,
                validationPerformance: 0,
                errorHandlingPerformance: 0
            };
            
            // Test cache performance
            const startCache = performance.now();
            mermaidManager.generateCacheKey('test diagram');
            metrics.cachePerformance = performance.now() - startCache;
            
            // Test validation performance
            const startValidation = performance.now();
            await mermaidManager.validateDiagramSyntax('graph TD\nA --> B');
            metrics.validationPerformance = performance.now() - startValidation;
            
            // Test error handling performance
            const startError = performance.now();
            await mermaidManager.validateDiagramSyntax('invalid');
            metrics.errorHandlingPerformance = performance.now() - startError;
            
            // Validate all targets
            expect(metrics.bundleSize).toBeLessThan(200); // < 200KB
            expect(metrics.cachePerformance).toBeLessThan(1); // < 1ms
            expect(metrics.validationPerformance).toBeLessThan(10); // < 10ms
            expect(metrics.errorHandlingPerformance).toBeLessThan(5); // < 5ms
            
            console.log('🎯 Performance Summary:');
            console.log(`   Bundle Size: ${metrics.bundleSize}KB (target: <200KB)`);
            console.log(`   Cache Performance: ${metrics.cachePerformance.toFixed(2)}ms (target: <1ms)`);
            console.log(`   Validation Performance: ${metrics.validationPerformance.toFixed(2)}ms (target: <10ms)`);
            console.log(`   Error Handling: ${metrics.errorHandlingPerformance.toFixed(2)}ms (target: <5ms)`);
            console.log('✅ All performance targets met!');
        });
    });
});