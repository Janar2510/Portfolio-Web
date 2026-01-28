'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Users,
  Mail,
  Clock,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MetricCard } from '@/components/analytics/MetricCard';
import { SimpleChart } from '@/components/analytics/SimpleChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import type { AnalyticsDaily } from '@/domain/analytics/analytics';
import type { PortfolioSite } from '@/domain/builder/portfolio';

export default function PortfolioAnalyticsPage() {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [days, setDays] = useState<number>(30);

  // Fetch user's portfolio sites
  const { data: sites = [] } = useQuery({
    queryKey: ['portfolio-sites'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PortfolioSite[];
    },
  });

  // Set default site
  useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId]);

  // Fetch daily analytics
  const { data: dailyAnalytics = [] } = useQuery({
    queryKey: ['analytics-daily', selectedSiteId, days],
    queryFn: async () => {
      if (!selectedSiteId) return [];
      const supabase = createClient();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_daily')
        .select('*')
        .eq('site_id', selectedSiteId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []) as AnalyticsDaily[];
    },
    enabled: !!selectedSiteId,
  });

  // Fetch site summary
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary', selectedSiteId, days],
    queryFn: async () => {
      if (!selectedSiteId) return null;
      const supabase = createClient();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: daily, error } = await supabase
        .from('analytics_daily')
        .select('*')
        .eq('site_id', selectedSiteId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      if (!daily || daily.length === 0) {
        return {
          totalPageviews: 0,
          totalUniqueVisitors: 0,
          totalFormSubmissions: 0,
          avgSessionDuration: null,
          bounceRate: null,
        };
      }

      const totalPageviews = daily.reduce((sum, d) => sum + d.pageviews, 0);
      const totalUniqueVisitors = daily.reduce(
        (sum, d) => sum + d.unique_visitors,
        0
      );
      const totalFormSubmissions = daily.reduce(
        (sum, d) => sum + d.form_submissions,
        0
      );

      const durations = daily
        .map(d => d.avg_session_duration)
        .filter((d): d is number => d !== null);
      const avgSessionDuration =
        durations.length > 0
          ? durations.reduce((sum, d) => sum + d, 0) / durations.length
          : null;

      const bounceRates = daily
        .map(d => d.bounce_rate)
        .filter((r): r is number => r !== null);
      const bounceRate =
        bounceRates.length > 0
          ? bounceRates.reduce((sum, r) => sum + r, 0) / bounceRates.length
          : null;

      return {
        totalPageviews,
        totalUniqueVisitors,
        totalFormSubmissions,
        avgSessionDuration,
        bounceRate,
      };
    },
    enabled: !!selectedSiteId,
  });

  // Fetch top pages
  const { data: topPages = [] } = useQuery({
    queryKey: ['analytics-top-pages', selectedSiteId, days],
    queryFn: async () => {
      if (!selectedSiteId) return [];
      const supabase = createClient();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events } = await supabase
        .from('analytics_events')
        .select('page_id, metadata')
        .eq('site_id', selectedSiteId)
        .eq('event_type', 'pageview')
        .gte('created_at', startDate.toISOString());

      if (!events) return [];

      // Count pageviews by page_id
      const pageCounts: Record<string, number> = {};
      events.forEach(event => {
        if (event.page_id) {
          pageCounts[event.page_id] = (pageCounts[event.page_id] || 0) + 1;
        }
      });

      // Get page details
      const pageIds = Object.keys(pageCounts);
      const { data: pages } = await supabase
        .from('portfolio_pages')
        .select('id, title, slug')
        .in('id', pageIds);

      return (pages || [])
        .map(page => ({
          page_id: page.id,
          title: page.title,
          slug: page.slug,
          views: pageCounts[page.id] || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    },
    enabled: !!selectedSiteId,
  });

  // Fetch device breakdown
  const { data: deviceBreakdown = {} } = useQuery({
    queryKey: ['analytics-devices', selectedSiteId, days],
    queryFn: async () => {
      if (!selectedSiteId) return {};
      const supabase = createClient();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events } = await supabase
        .from('analytics_events')
        .select('device_type')
        .eq('site_id', selectedSiteId)
        .eq('event_type', 'pageview')
        .gte('created_at', startDate.toISOString());

      if (!events) return {};

      const devices: Record<string, number> = {};
      events.forEach(event => {
        if (event.device_type) {
          devices[event.device_type] = (devices[event.device_type] || 0) + 1;
        }
      });

      return devices;
    },
    enabled: !!selectedSiteId,
  });

  // Fetch referrer breakdown
  const { data: referrerBreakdown = {} } = useQuery({
    queryKey: ['analytics-referrers', selectedSiteId, days],
    queryFn: async () => {
      if (!selectedSiteId) return {};
      const supabase = createClient();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events } = await supabase
        .from('analytics_events')
        .select('referrer')
        .eq('site_id', selectedSiteId)
        .eq('event_type', 'pageview')
        .gte('created_at', startDate.toISOString())
        .not('referrer', 'is', null);

      if (!events) return {};

      const referrers: Record<string, number> = {};
      events.forEach(event => {
        if (event.referrer) {
          try {
            const domain = new URL(event.referrer).hostname;
            referrers[domain] = (referrers[domain] || 0) + 1;
          } catch {
            referrers[event.referrer] = (referrers[event.referrer] || 0) + 1;
          }
        }
      });

      return referrers;
    },
    enabled: !!selectedSiteId,
  });

  // Prepare chart data
  const pageviewChartData = dailyAnalytics.map(daily => ({
    date: daily.date,
    value: daily.pageviews,
    label: format(new Date(daily.date), 'MMM d'),
  }));

  const visitorChartData = dailyAnalytics.map(daily => ({
    date: daily.date,
    value: daily.unique_visitors,
    label: format(new Date(daily.date), 'MMM d'),
  }));

  const selectedSite = sites.find(s => s.id === selectedSiteId);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(142_60%_6%)] to-[hsl(var(--background))] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm p-4 animate-slide-down">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Portfolio Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and analyze your portfolio site performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedSiteId || ''}
            onValueChange={setSelectedSiteId}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map(site => (
                <SelectItem key={site.id} value={site.id}>
                  {site.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={days.toString()}
            onValueChange={v => setDays(parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedSiteId ? (
          <div className="flex h-full items-center justify-center animate-fade-in">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                No site selected
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Select a portfolio site to view analytics
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Pageviews"
                value={summary?.totalPageviews || 0}
                icon={Eye}
                description={`Over the last ${days} days`}
              />
              <MetricCard
                title="Unique Visitors"
                value={summary?.totalUniqueVisitors || 0}
                icon={Users}
                description={`Over the last ${days} days`}
              />
              <MetricCard
                title="Form Submissions"
                value={summary?.totalFormSubmissions || 0}
                icon={Mail}
                description={`Over the last ${days} days`}
              />
              <MetricCard
                title="Avg Session Duration"
                value={
                  summary?.avgSessionDuration
                    ? `${Math.round(summary.avgSessionDuration / 60)}m ${summary.avgSessionDuration % 60}s`
                    : 'N/A'
                }
                icon={Clock}
                description="Average time on site"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SimpleChart
                title="Pageviews Over Time"
                data={pageviewChartData}
              />
              <SimpleChart
                title="Unique Visitors Over Time"
                data={visitorChartData}
              />
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  {topPages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No page data available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {topPages.map(page => (
                        <div
                          key={page.page_id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{page.title}</div>
                            <div className="text-xs text-muted-foreground">
                              /{page.slug}
                            </div>
                          </div>
                          <Badge variant="outline">{page.views} views</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(deviceBreakdown).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No device data available
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(deviceBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .map(([device, count]) => {
                          const total = Object.values(deviceBreakdown).reduce(
                            (a, b) => a + b,
                            0
                          );
                          const percentage = ((count / total) * 100).toFixed(1);
                          const Icon =
                            device === 'desktop'
                              ? Monitor
                              : device === 'mobile'
                                ? Smartphone
                                : Tablet;

                          return (
                            <div key={device} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium capitalize">
                                    {device}
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {count} ({percentage}%)
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Referrers */}
            {Object.keys(referrerBreakdown).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Referrers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(referrerBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([referrer, count]) => (
                        <div
                          key={referrer}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {referrer}
                            </span>
                          </div>
                          <Badge variant="outline">{count} visits</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
