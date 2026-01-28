# Analytics Tracking Infrastructure

## Overview

The analytics tracking infrastructure provides comprehensive event tracking for public portfolio sites, with automatic aggregation into daily analytics summaries.

## Components

### 1. Analytics Event Tracker

**Location**: `lib/analytics/tracker.ts`

Client-side tracking script for public portfolio sites.

**Features:**
- Visitor ID generation and persistence (localStorage)
- Session ID generation and persistence (sessionStorage)
- Automatic pageview tracking
- Click event tracking (on elements with `data-track-click="true"`)
- Form submission tracking (auto-tracked, can be disabled with `data-track-form="false"`)
- Device type detection (desktop, tablet, mobile)
- Browser detection
- UTM parameter extraction
- Referrer tracking
- Event queuing and batching
- Reliable delivery using `sendBeacon` API

**Usage:**

```typescript
import { initAnalytics } from '@/lib/analytics/tracker';

const tracker = initAnalytics({
  siteId: 'site-uuid',
  pageId: 'page-uuid',
  trackingEndpoint: '/api/analytics/track',
});

// Track custom events
tracker.track('click', { element: 'button-id' });
tracker.trackFormSubmit('contact-form');
```

**Global API (for script tag usage):**

```javascript
// Initialize
window.PortfolioAnalytics.init({
  siteId: 'site-uuid',
  pageId: 'page-uuid',
  trackingEndpoint: '/api/analytics/track'
});

// Track events
window.PortfolioAnalytics.track('pageview');
window.PortfolioAnalytics.track('click', { element: 'button' });
```

### 2. AnalyticsScript Component

**Location**: `components/portfolio/public/AnalyticsScript.tsx`

React component that embeds the tracking script in public portfolio pages.

**Features:**
- Automatic initialization
- Inline script for fast loading
- No external dependencies
- Works with Next.js Script component

**Props:**
- `siteId`: Portfolio site ID
- `pageId`: Optional page ID
- `trackingEndpoint`: Optional custom tracking endpoint (default: `/api/analytics/track`)

**Usage:**

```tsx
<AnalyticsScript siteId={site.id} pageId={page?.id} />
```

### 3. Public Tracking Endpoint

**Location**: `app/api/analytics/track/route.ts`

**Route**: `/api/analytics/track`

Public API endpoint that accepts tracking events.

**Features:**
- CORS enabled for cross-origin requests
- Batch event processing
- Event validation
- Error handling
- No authentication required (public endpoint)

**Request Format:**

```json
{
  "events": [
    {
      "site_id": "uuid",
      "page_id": "uuid",
      "event_type": "pageview",
      "visitor_id": "visitor-id",
      "session_id": "session-id",
      "referrer": "https://example.com",
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "summer-sale",
      "country": "US",
      "device_type": "desktop",
      "browser": "Chrome",
      "metadata": {}
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "events_tracked": 1
}
```

### 4. Daily Aggregation Edge Function

**Location**: `supabase/functions/analytics-aggregate/index.ts`

Edge function that aggregates daily analytics from events.

**Features:**
- Aggregates events into daily summaries
- Calculates metrics:
  - Pageviews
  - Unique visitors
  - Form submissions
  - Average session duration
  - Bounce rate
  - Top pages
  - Top referrers
  - Device breakdown
  - Country breakdown
- Upserts into `analytics_daily` table
- Processes all sites or specific site
- Handles date ranges

**Request Format:**

```json
{
  "site_id": "optional-uuid",
  "date": "2024-01-15"
}
```

**Response:**

```json
{
  "message": "Analytics aggregation completed",
  "date": "2024-01-15",
  "results": [
    {
      "site_id": "uuid",
      "date": "2024-01-15",
      "pageviews": 1250,
      "unique_visitors": 450,
      "form_submissions": 12,
      "avg_session_duration": 180,
      "bounce_rate": 35.5,
      "top_pages": {...},
      "top_referrers": {...},
      "devices": {...},
      "countries": {...}
    }
  ]
}
```

## Metrics Calculation

### Pageviews
Count of all `pageview` events for the day.

### Unique Visitors
Count of distinct `visitor_id` values.

### Form Submissions
Count of all `form_submit` events.

### Average Session Duration
Average time between first and last event in each session (in seconds).

### Bounce Rate
Percentage of sessions with only one pageview.

### Top Pages
Page IDs and their view counts.

### Top Referrers
Referrer domains and their visit counts.

### Devices
Breakdown by device type (desktop, tablet, mobile).

### Countries
Breakdown by country code.

## Usage

### Automatic Tracking

The tracking script automatically tracks:
- Pageviews on page load
- Form submissions (unless disabled with `data-track-form="false"`)
- Clicks on elements with `data-track-click="true"`

### Manual Tracking

```javascript
// Track custom event
window.PortfolioAnalytics.track('click', {
  element: 'cta-button',
  section: 'hero'
});

// Track form submission
window.PortfolioAnalytics.track('form_submit', {
  form_id: 'contact-form',
  form_name: 'Contact Form'
});
```

### HTML Data Attributes

```html
<!-- Track click on button -->
<button data-track-click="true" data-track-id="cta-button">
  Click Me
</button>

<!-- Disable form tracking -->
<form data-track-form="false">
  <!-- Form content -->
</form>
```

## Scheduled Aggregation

Set up a cron job to run daily aggregation:

```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'analytics-aggregate',
  '0 1 * * *',  -- 1 AM UTC daily
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/analytics-aggregate',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

Or aggregate for a specific date:

```sql
SELECT net.http_post(
  url := 'https://your-project.supabase.co/functions/v1/analytics-aggregate',
  headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb,
  body := '{"date": "2024-01-15"}'::jsonb
);
```

## Privacy & Compliance

### Visitor Tracking

- Uses localStorage for persistent visitor ID
- Uses sessionStorage for session ID
- No personally identifiable information (PII) collected
- IP addresses not stored (country determined server-side if needed)

### GDPR Compliance

- Visitor IDs are anonymous
- No cookies used (uses localStorage/sessionStorage)
- Users can clear tracking by clearing browser storage
- Consider adding opt-out mechanism for GDPR compliance

### Data Retention

- Raw events stored indefinitely (can be archived)
- Daily aggregations stored permanently
- Consider implementing data retention policies

## Performance

### Optimization

- Events are batched and sent asynchronously
- Uses `sendBeacon` API for reliable delivery on page unload
- Minimal impact on page load time
- Tracking script is lightweight (< 5KB)

### Rate Limiting

Consider implementing rate limiting on the tracking endpoint:
- Per IP address
- Per visitor ID
- Per site

## Security

### Endpoint Security

- Public endpoint (no authentication required)
- Event validation (site_id, event_type)
- CORS enabled for cross-origin requests
- Rate limiting recommended

### Data Validation

- Validates event structure
- Validates event_type values
- Validates site_id exists
- Sanitizes metadata

## File Structure

```
src/
├── lib/analytics/
│   └── tracker.ts                    # Client-side tracker
├── components/portfolio/public/
│   └── AnalyticsScript.tsx          # React component
├── app/
│   ├── api/analytics/track/
│   │   └── route.ts                 # Public tracking endpoint
│   └── sites/[subdomain]/
│       └── PublicPortfolioPage.tsx  # Uses AnalyticsScript
supabase/functions/
└── analytics-aggregate/
    └── index.ts                      # Daily aggregation function
```

## Future Enhancements

- [ ] Real-time analytics dashboard
- [ ] Custom event types
- [ ] Goal tracking
- [ ] Funnel analysis
- [ ] Cohort analysis
- [ ] A/B test integration
- [ ] Email notifications for milestones
- [ ] Export analytics data
- [ ] API for querying analytics
- [ ] Heatmap tracking
- [ ] Scroll depth tracking
- [ ] Video play tracking
- [ ] E-commerce tracking
- [ ] Conversion tracking
- [ ] Attribution modeling
