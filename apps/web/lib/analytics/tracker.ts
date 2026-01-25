/**
 * Analytics Event Tracker
 *
 * Client-side tracking script for public portfolio sites
 */

interface TrackingConfig {
  siteId: string;
  pageId?: string;
  trackingEndpoint: string;
}

interface TrackingEvent {
  site_id: string;
  page_id?: string;
  event_type: 'pageview' | 'click' | 'form_submit';
  visitor_id?: string;
  session_id?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  country?: string;
  device_type?: string;
  browser?: string;
  metadata?: Record<string, unknown>;
}

class AnalyticsTracker {
  private config: TrackingConfig;
  private visitorId: string;
  private sessionId: string;
  private queue: TrackingEvent[] = [];
  private isFlushing = false;

  constructor(config: TrackingConfig) {
    this.config = config;
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
    this.initializeTracking();
  }

  /**
   * Get or create visitor ID (stored in localStorage)
   */
  private getOrCreateVisitorId(): string {
    const key = `analytics_visitor_${this.config.siteId}`;
    let visitorId = localStorage.getItem(key);

    if (!visitorId) {
      visitorId = this.generateId();
      localStorage.setItem(key, visitorId);
    }

    return visitorId;
  }

  /**
   * Get or create session ID (stored in sessionStorage)
   */
  private getOrCreateSessionId(): string {
    const key = `analytics_session_${this.config.siteId}`;
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        ua
      )
    ) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get browser name
   */
  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Opera') > -1) return 'Opera';
    return 'Unknown';
  }

  /**
   * Get country from IP (simplified - in production use a geolocation service)
   */
  private async getCountry(): Promise<string | undefined> {
    // In production, use a geolocation API or service
    // For now, return undefined (will be determined server-side if needed)
    return undefined;
  }

  /**
   * Extract UTM parameters from URL
   */
  private getUTMParams(): {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  } {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    };
  }

  /**
   * Track an event
   */
  async track(
    eventType: 'pageview' | 'click' | 'form_submit',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const utmParams = this.getUTMParams();
    const country = await this.getCountry();

    const event: TrackingEvent = {
      site_id: this.config.siteId,
      page_id: this.config.pageId,
      event_type: eventType,
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      referrer: document.referrer || undefined,
      ...utmParams,
      country,
      device_type: this.getDeviceType(),
      browser: this.getBrowser(),
      metadata: metadata || {},
    };

    this.queue.push(event);
    this.flush();
  }

  /**
   * Track pageview
   */
  trackPageview(metadata?: Record<string, unknown>): void {
    this.track('pageview', metadata);
  }

  /**
   * Track click event
   */
  trackClick(element: string, metadata?: Record<string, unknown>): void {
    this.track('click', {
      ...metadata,
      element,
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formId: string, metadata?: Record<string, unknown>): void {
    this.track('form_submit', {
      ...metadata,
      form_id: formId,
    });
  }

  /**
   * Flush queued events to server
   */
  private async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      const events = [...this.queue];
      this.queue = [];

      // Send events in batch
      const response = await fetch(this.config.trackingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        // Re-queue events if send failed
        this.queue.unshift(...events);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Re-queue events if send failed
      const events = [...this.queue];
      this.queue = events;
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Initialize tracking
   */
  private initializeTracking(): void {
    // Track initial pageview
    this.trackPageview();

    // Track page visibility changes (for session duration)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Track session end
        this.track('pageview', {
          session_end: true,
        });
      }
    });

    // Auto-track form submissions
    document.addEventListener('submit', e => {
      const form = e.target as HTMLFormElement;
      if (form.dataset.trackForm !== 'false') {
        const formId = form.id || form.name || 'unknown';
        this.trackFormSubmit(formId);
      }
    });

    // Auto-track clicks on tracked elements
    document.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.dataset.trackClick === 'true') {
        const elementId = target.id || target.dataset.trackId || 'unknown';
        this.trackClick(elementId, {
          text: target.textContent?.substring(0, 100),
          href: (target as HTMLAnchorElement).href,
        });
      }
    });

    // Flush queue before page unload
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliable delivery
      if (this.queue.length > 0 && navigator.sendBeacon) {
        const events = [...this.queue];
        navigator.sendBeacon(
          this.config.trackingEndpoint,
          JSON.stringify({ events })
        );
      }
    });
  }
}

/**
 * Initialize analytics tracker
 */
export function initAnalytics(config: TrackingConfig): AnalyticsTracker {
  return new AnalyticsTracker(config);
}

/**
 * Global tracker instance (for script tag usage)
 */
declare global {
  interface Window {
    PortfolioAnalytics?: {
      init: (config: TrackingConfig) => AnalyticsTracker;
      track: (
        eventType: 'pageview' | 'click' | 'form_submit',
        metadata?: Record<string, unknown>
      ) => void;
    };
  }
}

// Expose global API for script tag usage
if (typeof window !== 'undefined') {
  let trackerInstance: AnalyticsTracker | null = null;

  window.PortfolioAnalytics = {
    init: (config: TrackingConfig) => {
      trackerInstance = new AnalyticsTracker(config);
      return trackerInstance;
    },
    track: (
      eventType: 'pageview' | 'click' | 'form_submit',
      metadata?: Record<string, unknown>
    ) => {
      if (trackerInstance) {
        trackerInstance.track(eventType, metadata);
      }
    },
  };
}
