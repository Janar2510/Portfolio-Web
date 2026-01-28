/**
 * Public Analytics Tracking Endpoint
 *
 * Accepts tracking events from public portfolio sites
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate events
    for (const event of events) {
      if (!event.site_id || !event.event_type) {
        return NextResponse.json(
          { error: 'Invalid event format' },
          { status: 400, headers: corsHeaders }
        );
      }

      // Validate event_type
      if (!['pageview', 'click', 'form_submit'].includes(event.event_type)) {
        return NextResponse.json(
          { error: 'Invalid event_type' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Get Supabase client (using anon key for public access)
    const supabase = await createClient();

    // Insert events in batch
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(
        events.map(event => ({
          site_id: event.site_id,
          page_id: event.page_id || null,
          event_type: event.event_type,
          visitor_id: event.visitor_id || null,
          session_id: event.session_id || null,
          referrer: event.referrer || null,
          utm_source: event.utm_source || null,
          utm_medium: event.utm_medium || null,
          utm_campaign: event.utm_campaign || null,
          country: event.country || null,
          device_type: event.device_type || null,
          browser: event.browser || null,
          metadata: event.metadata || {},
        }))
      )
      .select();

    if (error) {
      console.error('Error inserting analytics events:', error);
      return NextResponse.json(
        { error: 'Failed to track events' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, events_tracked: data?.length || 0 },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
