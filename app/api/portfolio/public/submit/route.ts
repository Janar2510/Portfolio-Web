/**
 * Public Form Submission API
 * POST /api/portfolio/public/submit
 * Public endpoint for form submissions (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const submitFormSchema = z.object({
  site_id: z.string().uuid(),
  form_type: z.enum(['contact', 'newsletter', 'custom']).default('contact'),
  form_id: z.string().optional(),
  data: z.record(z.unknown()),
  page_url: z.string().optional(),
});

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const validated = submitFormSchema.parse(body);

    // Verify site is published
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, status')
      .eq('id', validated.site_id)
      .single();

    if (siteError || !site || site.status !== 'published') {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found or not published',
          },
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      null;

    // Insert submission
    const { data, error } = await supabase
      .from('portfolio_form_submissions')
      .insert({
        site_id: validated.site_id,
        form_type: validated.form_type,
        form_id: validated.form_id,
        data: validated.data,
        page_url: validated.page_url,
        referrer: referrer,
        user_agent: userAgent,
        ip_address: ipAddress ? ipAddress.split(',')[0].trim() : null,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        data: {
          id: data.id,
          success: true,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.error('Error submitting form:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit form',
        },
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
