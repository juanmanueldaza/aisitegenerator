# Performance Guidelines for AI Site Generator

## ⚡ **Performance Philosophy**

AI Site Generator prioritizes **perceived performance** and **actual performance** to ensure users have a fast, responsive experience while generating websites with AI.

### **Performance Targets**

```
📊 Core Metrics
├── Bundle Size: 18.86 kB CSS (4.71 kB gzipped) - DaisyUI optimized
├── Initial Load: < 3 seconds on slow 3G
├── Time to Interactive: < 5 seconds
├── Core Web Vitals: All green scores
└── Memory Usage: < 50MB typical session
```

## 🎯 **Performance Strategies**

### **1. Bundle Size Optimization**

**Tree Shaking**

```typescript
// ✅ Good: Import only what you need
import { debounce } from 'lodash/debounce';

// ❌ Avoid: Importing entire libraries
import _ from 'lodash';
```

**Code Splitting**

```typescript
// ✅ Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ Route-based splitting
const routes = [
  {
    path: '/editor',
    component: lazy(() => import('./pages/Editor')),
  },
];
```

**Dependency Audit**

```bash
# Regular bundle analysis
npm run build -- --analyze

# Check for duplicate dependencies
npm ls --depth=0

# Monitor bundle size
npm run size
```

### **2. Runtime Performance**

**React Performance Patterns**

```typescript
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// ✅ Memoize components to prevent re-renders
const MemoizedComponent = memo(({ data }) => (
  <div>{data.title}</div>
));

// ✅ Use callback memoization
const handleClick = useCallback(() => {
  onItemClick(item.id);
}, [item.id, onItemClick]);
```

**DOM Optimization**

```typescript
// ✅ Minimize DOM queries
const element = useRef(null);

// ✅ Batch DOM updates
const [items, setItems] = useState([]);
// Update all at once instead of one by one

// ✅ Use keys for list rendering
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

### **3. Loading Performance**

**Progressive Loading Strategy**

```typescript
// 1. Critical: Authentication UI
// 2. Important: Main interface
// 3. Secondary: Advanced features
// 4. Optional: Help documentation

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/editor"
          element={
            <Suspense fallback={<EditorSkeleton />}>
              <Editor />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  </Suspense>
);
```

**Resource Loading**

```typescript
// ✅ Preload critical resources
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

// ✅ Lazy load images
<img
  src={imageSrc}
  loading="lazy"
  alt="Generated site preview"
/>

// ✅ Cache API responses
const cachedResponse = await cacheFirst(apiCall);
```

### **4. Memory Management**

**Cleanup Patterns**

```typescript
// ✅ Clean up event listeners
useEffect(() => {
  const handleScroll = () => {
    /* ... */
  };
  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

// ✅ Cancel API requests on unmount
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal });

  return () => controller.abort();
}, []);

// ✅ Clear timeouts and intervals
useEffect(() => {
  const timer = setTimeout(action, 1000);
  return () => clearTimeout(timer);
}, []);
```

**State Management Efficiency**

```typescript
// ✅ Minimize state updates
const [formData, setFormData] = useState(initialData);

// Batch updates instead of multiple setState calls
const updateForm = useCallback((changes) => {
  setFormData((prev) => ({ ...prev, ...changes }));
}, []);

// ✅ Use refs for values that don't trigger re-renders
const scrollPosition = useRef(0);
```

## 📊 **Performance Monitoring**

### **Development Monitoring**

```typescript
// Performance measurement wrapper
const measurePerformance = (name: string, fn: Function) => {
  return (...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`${name}: ${end - start}ms`);
    }

    return result;
  };
};

// Usage
const optimizedFunction = measurePerformance('Heavy Calculation', heavyCalculation);
```

### **Production Monitoring**

```typescript
// Core Web Vitals tracking
const observeWebVitals = () => {
  // First Contentful Paint
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        console.log('FCP:', entry.startTime);
      }
    });
  }).observe({ entryTypes: ['paint'] });

  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });
};
```

### **Bundle Analysis Tools**

```bash
# Webpack Bundle Analyzer
npm run build -- --analyze

# Source Map Explorer
npm install -g source-map-explorer
source-map-explorer build/static/js/*.js

# Bundle size tracking
npm install -g bundlesize
bundlesize
```

## 🎯 **Performance Anti-Patterns to Avoid**

### **Common Mistakes**

```typescript
// ❌ Creating objects in render
const Component = () => {
  return (
    <Child style={{ margin: '10px' }} /> // New object every render
  );
};

// ✅ Move objects outside or memoize
const childStyle = { margin: '10px' };
const Component = () => <Child style={childStyle} />;

// ❌ Expensive operations in render
const Component = ({ items }) => {
  const processedItems = heavyProcessing(items); // Runs every render
  return <div>{processedItems}</div>;
};

// ✅ Use useMemo for expensive operations
const Component = ({ items }) => {
  const processedItems = useMemo(() => heavyProcessing(items), [items]);
  return <div>{processedItems}</div>;
};
```

### **Memory Leaks**

```typescript
// ❌ Forgetting cleanup
useEffect(() => {
  const subscription = api.subscribe(handler);
  // No cleanup - memory leak!
}, []);

// ✅ Always clean up
useEffect(() => {
  const subscription = api.subscribe(handler);
  return () => subscription.unsubscribe();
}, []);
```

## 🚀 **Performance Testing Strategy**

### **Automated Performance Testing**

```javascript
// E2E performance test
test('page loads within performance budget', async ({ page }) => {
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    };
  });

  expect(metrics.loadTime).toBeLessThan(3000);
  expect(metrics.domContentLoaded).toBeLessThan(2000);
});
```

### **Performance Regression Prevention**

```json
// package.json
{
  "scripts": {
    "perf-test": "lighthouse-ci autorun",
    "bundle-check": "bundlesize",
    "perf-audit": "npm run perf-test && npm run bundle-check"
  }
}
```

## 📈 **Continuous Performance Improvement**

### **Performance Review Checklist**

- [ ] Bundle size impact assessed for all changes
- [ ] Core Web Vitals scores maintained
- [ ] Memory usage profiled for complex features
- [ ] Performance tests passing
- [ ] No performance regressions introduced

### **Performance Culture**

1. **Measure First**: Always measure before optimizing
2. **User-Centric**: Focus on user-perceived performance
3. **Incremental**: Small, consistent improvements over big rewrites
4. **Sustainable**: Performance optimizations should be maintainable

Remember: **Fast software makes happy users, and happy users make successful products.**
