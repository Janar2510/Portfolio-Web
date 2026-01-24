/**
 * Publish Site API
 * POST /api/portfolio/site/publish
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
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

    const portfolioService = new PortfolioService(supabase);
    const site = await portfolioService.getSite();

    if (!site) {
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

    const updated = await portfolioService.updateSite(site.id, {
      is_published: true,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error publishing site:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to publish site',
        },
      },
      { status: 500 }
    );
  }
}
