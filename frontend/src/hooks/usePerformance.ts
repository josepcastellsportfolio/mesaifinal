import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

interface UsePerformanceOptions {
  onMetrics?: (metrics: PerformanceMetrics) => void;
  enabled?: boolean;
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const { onMetrics, enabled = true } = options;
  const metricsRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const measureFCP = useCallback(() => {
    if (!enabled) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metricsRef.current.fcp = fcpEntry.startTime;
        onMetrics?.(metricsRef.current);
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  }, [enabled, onMetrics]);

  const measureLCP = useCallback(() => {
    if (!enabled) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1];
      if (lcpEntry) {
        metricsRef.current.lcp = lcpEntry.startTime;
        onMetrics?.(metricsRef.current);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }, [enabled, onMetrics]);

  const measureFID = useCallback(() => {
    if (!enabled) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          metricsRef.current.fid = fidEntry.processingStart - fidEntry.startTime;
          onMetrics?.(metricsRef.current);
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }, [enabled, onMetrics]);

  const measureCLS = useCallback(() => {
    if (!enabled) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          metricsRef.current.cls = clsValue;
          onMetrics?.(metricsRef.current);
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }, [enabled, onMetrics]);

  const measureTTFB = useCallback(() => {
    if (!enabled) return;

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metricsRef.current.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      onMetrics?.(metricsRef.current);
    }
  }, [enabled, onMetrics]);

  useEffect(() => {
    if (!enabled) return;

    // Measure TTFB immediately
    measureTTFB();

    // Measure other metrics
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();

    // Cleanup function
    return () => {
      // PerformanceObserver cleanup is automatic
    };
  }, [enabled, measureFCP, measureLCP, measureFID, measureCLS, measureTTFB]);

  const getMetrics = useCallback(() => metricsRef.current, []);

  const logMetrics = useCallback(() => {
    const metrics = metricsRef.current;
    console.group('Performance Metrics');
    console.log('First Contentful Paint (FCP):', metrics.fcp, 'ms');
    console.log('Largest Contentful Paint (LCP):', metrics.lcp, 'ms');
    console.log('First Input Delay (FID):', metrics.fid, 'ms');
    console.log('Cumulative Layout Shift (CLS):', metrics.cls);
    console.log('Time to First Byte (TTFB):', metrics.ttfb, 'ms');
    console.groupEnd();
  }, []);

  return {
    metrics: metricsRef.current,
    getMetrics,
    logMetrics,
  };
}

// Hook for tracking component mount/unmount times
export const useComponentLifecycle = (componentName: string) => {
  const mountTime = useRef<number>(performance.now());

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[Lifecycle] ${componentName} mounted`);
    }

    return () => {
      const unmountTime = performance.now();
      const lifetime = unmountTime - mountTime.current;
      
      if (import.meta.env.DEV) {
        console.log(`[Lifecycle] ${componentName} unmounted after ${lifetime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

// Hook for tracking expensive operations
export const usePerformanceTracker = (operationName: string) => {
  const startTime = useRef<number>(0);

  const startTracking = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endTracking = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }, [operationName]);

  return { startTracking, endTracking };
};
