// Monitoring and Analytics Utilities
import { toast } from 'react-toastify';

// Error tracking interface
interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  additionalData?: Record<string, unknown>;
}

// Analytics event interface
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  timestamp: number;
  properties?: Record<string, unknown>;
}

// Performance metric interface
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  userId?: string;
}

// Monitoring configuration
interface MonitoringConfig {
  enabled: boolean;
  errorTracking: {
    enabled: boolean;
    endpoint?: string;
    sampleRate?: number;
  };
  analytics: {
    enabled: boolean;
    provider: 'google' | 'mixpanel' | 'custom';
    trackingId?: string;
    endpoint?: string;
  };
  performance: {
    enabled: boolean;
    endpoint?: string;
    sampleRate?: number;
  };
}

// Default configuration
const defaultConfig: MonitoringConfig = {
  enabled: import.meta.env.PROD,
  errorTracking: {
    enabled: import.meta.env.PROD,
    sampleRate: 1.0, // 100% in production
  },
  analytics: {
    enabled: import.meta.env.PROD,
    provider: 'google',
  },
  performance: {
    enabled: import.meta.env.PROD,
    sampleRate: 0.1, // 10% in production
  },
};

class MonitoringService {
  private config: MonitoringConfig;
  private userId?: string;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  // sessionId eliminado porque no se usa
    this.initialize();
  }

  private initialize(): void {
    if (!this.config.enabled) return;

    // Initialize error tracking
    if (this.config.errorTracking.enabled) {
      this.setupErrorTracking();
    }

    // Initialize analytics
    if (this.config.analytics.enabled) {
      this.setupAnalytics();
    }

    // Initialize performance monitoring
    if (this.config.performance.enabled) {
      this.setupPerformanceMonitoring();
    }
  }

  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
      });
    });
  }

  private setupAnalytics(): void {
    // Google Analytics setup
    if (this.config.analytics.provider === 'google' && this.config.analytics.trackingId) {
      this.loadGoogleAnalytics();
    }

    // Mixpanel setup
    if (this.config.analytics.provider === 'mixpanel' && this.config.analytics.trackingId) {
      this.loadMixpanel();
    }
  }

  private setupPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.observePerformanceMetrics();
    }
  }

  private loadGoogleAnalytics(): void {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.analytics.trackingId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', this.config.analytics.trackingId);
  }

  private loadMixpanel(): void {
    // Load Mixpanel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2.2.0.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      if (window.mixpanel) {
        if (this.config.analytics.trackingId) {
          window.mixpanel.init(this.config.analytics.trackingId);
        }
      }
    };
  }

  private observePerformanceMetrics(): void {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformance({
          name: 'LCP',
          value: lastEntry.startTime,
          unit: 'ms',
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            this.trackPerformance({
              name: 'FID',
              value: fidEntry.processingStart - fidEntry.startTime,
              unit: 'ms',
            });
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.trackPerformance({
              name: 'CLS',
              value: clsValue,
              unit: '',
            });
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Public methods
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public trackError(errorInfo: Omit<ErrorInfo, 'timestamp' | 'url' | 'userAgent'>): void {
    if (!this.config.errorTracking.enabled) return;

    const fullErrorInfo: ErrorInfo = {
      ...errorInfo,
      userId: this.userId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Send to error tracking service
    this.sendToEndpoint('/api/errors', fullErrorInfo);

    // Show user-friendly error message in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', fullErrorInfo);
      toast.error(`Error: ${errorInfo.message}`);
    }
  }

  public trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    if (!this.config.analytics.enabled) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      userId: this.userId,
      timestamp: Date.now(),
    };

    // Send to analytics service
    if (this.config.analytics.provider === 'google') {
      this.trackGoogleAnalytics(fullEvent);
    } else if (this.config.analytics.provider === 'mixpanel') {
      this.trackMixpanel(fullEvent);
    } else {
      this.sendToEndpoint('/api/analytics', fullEvent);
    }
  }

  public trackPerformance(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.config.performance.enabled) return;

    const fullMetric: PerformanceMetric = {
      ...metric,
      userId: this.userId,
      timestamp: Date.now(),
    };

    // Send to performance monitoring service
    this.sendToEndpoint('/api/performance', fullMetric);
  }

  public trackPageView(page: string, title?: string): void {
    this.trackEvent({
      event: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: page,
      properties: {
        page,
        title: title || document.title,
        referrer: document.referrer,
      },
    });
  }

  public trackUserAction(action: string, category: string, label?: string, value?: number): void {
    this.trackEvent({
      event: 'user_action',
      category,
      action,
      label,
      value,
    });
  }

  private trackGoogleAnalytics(event: AnalyticsEvent): void {
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties,
      });
    }
  }

  private trackMixpanel(event: AnalyticsEvent): void {
    if (window.mixpanel) {
      window.mixpanel.track(event.event, {
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        ...event.properties,
      });
    }
  }

  private async sendToEndpoint(endpoint: string, data: unknown): Promise<void> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn(`Failed to send data to ${endpoint}:`, response.statusText);
      }
    } catch (error) {
      console.warn(`Error sending data to ${endpoint}:`, error);
    }
  }
}

// Create global monitoring instance
export const monitoring = new MonitoringService();

// React Error Boundary hook
export const useErrorBoundary = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    monitoring.trackError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
    });
  };

  return { handleError };
};

// Performance tracking hook
export const usePerformanceTracking = (componentName: string) => {
  const trackRender = () => {
    monitoring.trackPerformance({
      name: 'component_render',
      value: performance.now(),
      unit: 'ms',
    });
  };

  const trackUserInteraction = (action: string, _details?: Record<string, unknown>) => {
    monitoring.trackUserAction(action, 'user_interaction', componentName, undefined);
  };

  return { trackRender, trackUserInteraction };
};

// Analytics hook
export const useAnalytics = () => {
  const trackPageView = (page: string, title?: string) => {
    monitoring.trackPageView(page, title);
  };

  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    monitoring.trackUserAction(action, category, label, value);
  };

  return { trackPageView, trackEvent };
};

// Global type declarations
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    mixpanel: {
      init: (token: string) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}
