import React from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance metrics interface
interface PerformanceMetrics {
  cls: number;
  fid: number;
  fcp: number;
  lcp: number;
  ttfb: number;
  customMetrics: Record<string, number>;
}

// Performance observer for custom metrics
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cls: 0,
    fid: 0,
    fcp: 0,
    lcp: 0,
    ttfb: 0,
    customMetrics: {}
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeWebVitals();
    this.initializeCustomMetrics();
  }

  private initializeWebVitals() {
    // Core Web Vitals
    getCLS((metric) => {
      this.metrics.cls = metric.value;
      this.logMetric('CLS', metric);
    });

    getFID((metric) => {
      this.metrics.fid = metric.value;
      this.logMetric('FID', metric);
    });

    getFCP((metric) => {
      this.metrics.fcp = metric.value;
      this.logMetric('FCP', metric);
    });

    getLCP((metric) => {
      this.metrics.lcp = metric.value;
      this.logMetric('LCP', metric);
    });

    getTTFB((metric) => {
      this.metrics.ttfb = metric.value;
      this.logMetric('TTFB', metric);
    });
  }

  private initializeCustomMetrics() {
    // Custom performance metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.handleCustomMetric(entry);
      }
    });

    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    this.observers.push(observer);
  }

  private handleCustomMetric(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'measure':
        this.metrics.customMetrics[entry.name] = entry.startTime;
        this.logMetric('Custom', { name: entry.name, value: entry.startTime });
        break;
      
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.metrics.customMetrics['domContentLoaded'] = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
        this.metrics.customMetrics['loadComplete'] = navEntry.loadEventEnd - navEntry.loadEventStart;
        break;
      
      case 'resource':
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.initiatorType === 'img') {
          this.metrics.customMetrics[`image_${resourceEntry.name}`] = resourceEntry.duration;
        }
        break;
    }
  }

  private logMetric(type: string, metric: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${type}:`, metric);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(type, metric);
    }
  }

  private sendToAnalytics(type: string, metric: any) {
    // Send to your analytics service (Google Analytics, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', {
        event_category: 'Web Vitals',
        event_label: type,
        value: Math.round(metric.value || metric),
        non_interaction: true,
      });
    }
  }

  // Public methods
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public measure(name: string, fn: () => void) {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    performance.measure(name, undefined, undefined, {
      startTime: start,
      duration: end - start
    });
  }

  public async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      
      performance.measure(name, undefined, undefined, {
        startTime: start,
        duration: end - start
      });
      
      return result;
    } catch (error) {
      const end = performance.now();
      performance.measure(`${name}_error`, undefined, undefined, {
        startTime: start,
        duration: end - start
      });
      throw error;
    }
  }

  public mark(name: string) {
    performance.mark(name);
  }

  public measureBetween(startMark: string, endMark: string, name?: string) {
    const measureName = name || `${startMark}_to_${endMark}`;
    performance.measure(measureName, startMark, endMark);
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
};

// Utility functions
export const measurePageLoad = () => {
  const monitor = getPerformanceMonitor();
  
  // Mark page load start
  monitor.mark('page-load-start');
  
  // Measure when page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      monitor.mark('dom-content-loaded');
    });
  } else {
    monitor.mark('dom-content-loaded');
  }
  
  window.addEventListener('load', () => {
    monitor.mark('page-load-complete');
    monitor.measureBetween('page-load-start', 'page-load-complete', 'total-page-load');
  });
};

export const measureImageLoad = (imageUrl: string) => {
  const monitor = getPerformanceMonitor();
  const startMark = `image-load-start-${imageUrl}`;
  const endMark = `image-load-end-${imageUrl}`;
  
  monitor.mark(startMark);
  
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      monitor.mark(endMark);
      monitor.measureBetween(startMark, endMark, `image-load-${imageUrl}`);
      resolve();
    };
    img.onerror = () => {
      monitor.mark(endMark);
      monitor.measureBetween(startMark, endMark, `image-load-error-${imageUrl}`);
      resolve();
    };
    img.src = imageUrl;
  });
};

export const measureApiCall = async <T>(name: string, apiCall: () => Promise<T>): Promise<T> => {
  const monitor = getPerformanceMonitor();
  return monitor.measureAsync(`api-${name}`, apiCall);
};

// React hook for measuring component performance
export const usePerformanceMeasure = (componentName: string) => {
  const monitor = getPerformanceMonitor();
  
  React.useEffect(() => {
    monitor.mark(`${componentName}-mount-start`);
    
    return () => {
      monitor.mark(`${componentName}-unmount`);
      monitor.measureBetween(`${componentName}-mount-start`, `${componentName}-unmount`, `${componentName}-lifetime`);
    };
  }, [componentName]);
  
  return {
    measure: (name: string, fn: () => void) => {
      monitor.measure(`${componentName}-${name}`, fn);
    },
    measureAsync: <T>(name: string, fn: () => Promise<T>) => {
      return monitor.measureAsync(`${componentName}-${name}`, fn);
    }
  };
};

// Export the monitor instance
export default getPerformanceMonitor();
