import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AggregationResult {
  site_id: string;
  date: string;
  pageviews: number;
  unique_visitors: number;
  form_submissions: number;
  avg_session_duration: number | null;
  bounce_rate: number | null;
  top_pages: Record<string, number>;
  top_referrers: Record<string, number>;
  devices: Record<string, number>;
  countries: Record<string, number>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { site_id, date } = await req.json().catch(() => ({}));

    // Determine date to aggregate (default: yesterday)
    const targetDate = date
      ? new Date(date)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday

    const dateStr = targetDate.toISOString().split('T')[0];
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all sites or specific site
    let siteIds: string[] = [];
    if (site_id) {
      siteIds = [site_id];
    } else {
      // Get all published sites
      const { data: sites } = await supabase
        .from('portfolio_sites')
        .select('id')
        .eq('is_published', true);

      if (sites) {
        siteIds = sites.map((s) => s.id);
      }
    }

    if (siteIds.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No sites to aggregate' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const results = [];

    for (const siteId of siteIds) {
      try {
        const aggregation = await aggregateSite(
          siteId,
          dateStr,
          startOfDay,
          endOfDay,
          supabase
        );

        // Upsert into analytics_daily
        const { error: upsertError } = await supabase
          .from('analytics_daily')
          .upsert(
            {
              site_id: siteId,
              date: dateStr,
              pageviews: aggregation.pageviews,
              unique_visitors: aggregation.unique_visitors,
              form_submissions: aggregation.form_submissions,
              avg_session_duration: aggregation.avg_session_duration,
              bounce_rate: aggregation.bounce_rate,
              top_pages: aggregation.top_pages,
              top_referrers: aggregation.top_referrers,
              devices: aggregation.devices,
              countries: aggregation.countries,
            },
            {
              onConflict: 'site_id,date',
            }
          );

        if (upsertError) {
          console.error(`Error upserting daily analytics for site ${siteId}:`, upsertError);
        }

        results.push({
          site_id: siteId,
          date: dateStr,
          ...aggregation,
        });
      } catch (error) {
        console.error(`Error aggregating site ${siteId}:`, error);
        results.push({
          site_id: siteId,
          date: dateStr,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Analytics aggregation completed',
        date: dateStr,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analytics-aggregate:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function aggregateSite(
  siteId: string,
  dateStr: string,
  startOfDay: Date,
  endOfDay: Date,
  supabase: any
): Promise<AggregationResult> {
  // Fetch all events for this site on this date
  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('site_id', siteId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString());

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  if (!events || events.length === 0) {
    return {
      site_id: siteId,
      date: dateStr,
      pageviews: 0,
      unique_visitors: 0,
      form_submissions: 0,
      avg_session_duration: null,
      bounce_rate: null,
      top_pages: {},
      top_referrers: {},
      devices: {},
      countries: {},
    };
  }

  // Calculate metrics
  const pageviews = events.filter((e) => e.event_type === 'pageview').length;
  const uniqueVisitors = new Set(events.map((e) => e.visitor_id).filter(Boolean)).size;
  const formSubmissions = events.filter((e) => e.event_type === 'form_submit').length;

  // Calculate session durations
  const sessions: Record<string, number[]> = {};
  events.forEach((event) => {
    if (event.session_id && event.visitor_id) {
      if (!sessions[event.session_id]) {
        sessions[event.session_id] = [];
      }
      sessions[event.session_id].push(new Date(event.created_at).getTime());
    }
  });

  const sessionDurations: number[] = [];
  Object.values(sessions).forEach((timestamps) => {
    if (timestamps.length > 1) {
      const duration = (Math.max(...timestamps) - Math.min(...timestamps)) / 1000; // seconds
      sessionDurations.push(duration);
    }
  });

  const avgSessionDuration =
    sessionDurations.length > 0
      ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
      : null;

  // Calculate bounce rate (sessions with only one pageview)
  const singlePageviewSessions = Object.values(sessions).filter(
    (timestamps) => timestamps.length === 1
  ).length;
  const bounceRate =
    Object.keys(sessions).length > 0
      ? Number(((singlePageviewSessions / Object.keys(sessions).length) * 100).toFixed(2))
      : null;

  // Top pages
  const pageViews = events.filter((e) => e.event_type === 'pageview' && e.page_id);
  const topPages: Record<string, number> = {};
  pageViews.forEach((event) => {
    const pageId = event.page_id as string;
    topPages[pageId] = (topPages[pageId] || 0) + 1;
  });

  // Top referrers
  const topReferrers: Record<string, number> = {};
  events
    .filter((e) => e.referrer)
    .forEach((event) => {
      const referrer = event.referrer as string;
      // Extract domain from referrer
      try {
        const domain = new URL(referrer).hostname;
        topReferrers[domain] = (topReferrers[domain] || 0) + 1;
      } catch {
        topReferrers[referrer] = (topReferrers[referrer] || 0) + 1;
      }
    });

  // Devices
  const devices: Record<string, number> = {};
  events
    .filter((e) => e.device_type)
    .forEach((event) => {
      const device = event.device_type as string;
      devices[device] = (devices[device] || 0) + 1;
    });

  // Countries
  const countries: Record<string, number> = {};
  events
    .filter((e) => e.country)
    .forEach((event) => {
      const country = event.country as string;
      countries[country] = (countries[country] || 0) + 1;
    });

  return {
    site_id: siteId,
    date: dateStr,
    pageviews,
    unique_visitors: uniqueVisitors,
    form_submissions: formSubmissions,
    avg_session_duration: avgSessionDuration,
    bounce_rate: bounceRate,
    top_pages: topPages,
    top_referrers: topReferrers,
    devices,
    countries,
  };
}
