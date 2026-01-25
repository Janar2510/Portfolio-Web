/**
 * Form Submissions API
 * GET /api/portfolio/forms/submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const querySchema = z.object({
  site_id: z.string().uuid(),
  status: z.enum(['new', 'read', 'archived']).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      site_id: searchParams.get('site_id'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    };

    const validated = querySchema.parse(params);

    // Verify user owns the site
    const { data: site, error: siteError } = await supabase
      .from('portfolio_sites')
      .select('id, user_id')
      .eq('id', validated.site_id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found',
          },
        },
        { status: 404 }
      );
    }

    if (site.user_id !== user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('portfolio_form_submissions')
      .select('*')
      .eq('site_id', validated.site_id)
      .order('created_at', { ascending: false })
      .range(validated.offset, validated.offset + validated.limit - 1);

    // Filter by status if provided
    if (validated.status) {
      query = query.eq('status', validated.status);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Error fetching form submissions:', error);
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch form submissions',
          },
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('portfolio_form_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', validated.site_id);

    if (validated.status) {
      countQuery = countQuery.eq('status', validated.status);
    }

    const { count } = await countQuery;

    return NextResponse.json(
      {
        data: submissions || [],
        meta: {
          total: count || 0,
          limit: validated.limit,
          offset: validated.offset,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors,
          },
        },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.error('Error in form submissions API:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process request',
        },
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
