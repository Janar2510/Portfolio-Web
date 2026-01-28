'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface AnalyticsScriptProps {
  siteId: string;
  pageId?: string;
  trackingEndpoint?: string;
}

/**
 * Analytics Tracking Script Component
 *
 * Embeds the analytics tracker in public portfolio pages
 */
export function AnalyticsScript({
  siteId,
  pageId,
  trackingEndpoint = '/api/analytics/track',
}: AnalyticsScriptProps) {
  useEffect(() => {
    // Initialize tracker when component mounts
    if (typeof window !== 'undefined' && window.PortfolioAnalytics) {
      const fullEndpoint = trackingEndpoint.startsWith('http')
        ? trackingEndpoint
        : `${window.location.origin}${trackingEndpoint}`;

      window.PortfolioAnalytics.init({
        siteId,
        pageId,
        trackingEndpoint: fullEndpoint,
      });
    }
  }, [siteId, pageId, trackingEndpoint]);

  return (
    <Script
      id="portfolio-analytics"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  // Analytics Tracker Implementation
  const config = {
    siteId: '${siteId}',
    pageId: '${pageId || ''}',
    trackingEndpoint: '${trackingEndpoint.startsWith('http') ? trackingEndpoint : window.location.origin + trackingEndpoint}'
  };

  let visitorId = localStorage.getItem('analytics_visitor_' + config.siteId);
  if (!visitorId) {
    visitorId = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('analytics_visitor_' + config.siteId, visitorId);
  }

  let sessionId = sessionStorage.getItem('analytics_session_' + config.siteId);
  if (!sessionId) {
    sessionId = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('analytics_session_' + config.siteId, sessionId);
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Opera') > -1) return 'Opera';
    return 'Unknown';
  }

  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined
    };
  }

  function track(eventType, metadata) {
    const utmParams = getUTMParams();
    const event = {
      site_id: config.siteId,
      page_id: config.pageId || undefined,
      event_type: eventType,
      visitor_id: visitorId,
      session_id: sessionId,
      referrer: document.referrer || undefined,
      ...utmParams,
      device_type: getDeviceType(),
      browser: getBrowser(),
      metadata: metadata || {}
    };

    // Send event
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        config.trackingEndpoint,
        JSON.stringify({ events: [event] })
      );
    } else {
      fetch(config.trackingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [event] })
      }).catch(console.error);
    }
  }

  // Track initial pageview
  track('pageview');

  // Track form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.dataset.trackForm !== 'false') {
      const formId = form.id || form.name || 'unknown';
      track('form_submit', { form_id: formId });
    }
  });

  // Track clicks on tracked elements
  document.addEventListener('click', function(e) {
    if (e.target.dataset.trackClick === 'true') {
      const elementId = e.target.id || e.target.dataset.trackId || 'unknown';
      track('click', {
        element: elementId,
        text: e.target.textContent?.substring(0, 100),
        href: e.target.href
      });
    }
  });

  // Expose global API
  window.PortfolioAnalytics = {
    init: function(cfg) {
      Object.assign(config, cfg);
      return { track: track };
    },
    track: track
  };
})();
        `,
      }}
    />
  );
}
