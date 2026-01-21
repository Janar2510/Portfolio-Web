# Analytics Dashboards Documentation

## Overview

The analytics dashboards provide comprehensive insights into portfolio site performance and CRM metrics. Two main dashboards are available:

1. **Portfolio Analytics Dashboard** - Track portfolio site performance
2. **CRM Analytics Dashboard** - Monitor CRM metrics and pipeline health

## Portfolio Analytics Dashboard

**Route:** `/analytics/portfolio`

### Features

- **Site Selection**: Choose which portfolio site to analyze
- **Time Period Filtering**: View data for last 7, 30, 90, or 365 days
- **Summary Metrics**:
  - Total Pageviews
  - Unique Visitors
  - Form Submissions
  - Average Session Duration

### Visualizations

- **Pageviews Over Time**: Line chart showing daily pageview trends
- **Unique Visitors Over Time**: Line chart showing visitor growth
- **Top Pages**: List of most viewed pages with view counts
- **Device Breakdown**: Distribution of desktop, mobile, and tablet visitors
- **Top Referrers**: List of top traffic sources

### Data Sources

- `analytics_daily` table for aggregated daily metrics
- `analytics_events` table for detailed event data
- `portfolio_pages` table for page information

## CRM Analytics Dashboard

**Route:** `/analytics/crm`

### Features

- **Summary Metrics**:
  - Total Contacts
  - Total Companies
  - Active Deals
  - Pipeline Value

### Visualizations

- **Activities Over Time**: Chart showing activity volume over the last 30 days
- **Deal Value Created**: Chart showing deal value creation trends
- **Deals by Stage**: Breakdown of deals across pipeline stages with values
- **Activity Breakdown**: Distribution of activity types (email, call, meeting, task, note)
- **Top Companies by Contacts**: List of companies with the most associated contacts

### Data Sources

- `contacts` table for contact metrics
- `companies` table for company metrics
- `deals` table for deal metrics
- `crm_activities` table for activity data
- `pipeline_stages` table for stage information

## Components

### MetricCard

Displays a single metric with optional icon, change indicator, and description.

**Props:**
- `title`: Metric title
- `value`: Metric value (string or number)
- `change?`: Optional change indicator with percentage and direction
- `icon?`: Optional Lucide icon
- `description?`: Optional description text
- `className?`: Optional CSS classes

### SimpleChart

Displays a simple bar chart for time-series data.

**Props:**
- `title`: Chart title
- `data`: Array of data points with `date`, `value`, and optional `label`
- `valueKey?`: Key to use for values (default: 'value')
- `className?`: Optional CSS classes

## Usage

### Accessing Dashboards

Both dashboards are accessible from the admin area:

```typescript
// Portfolio Analytics
<Link href="/analytics/portfolio">Portfolio Analytics</Link>

// CRM Analytics
<Link href="/analytics/crm">CRM Analytics</Link>
```

### Data Fetching

Dashboards use React Query for data fetching and caching:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['analytics-key', ...dependencies],
  queryFn: async () => {
    // Fetch data
  },
});
```

## Performance Considerations

- Data is fetched client-side using Supabase client
- React Query provides automatic caching and refetching
- Charts use simple CSS-based visualizations (no heavy charting libraries)
- Aggregated data from `analytics_daily` table improves query performance

## Future Enhancements

- Export data to CSV/PDF
- Custom date range selection
- Comparison with previous periods
- Real-time updates via Supabase subscriptions
- Advanced filtering and segmentation
- Integration with external analytics tools
