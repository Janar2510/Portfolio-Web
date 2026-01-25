/**
 * Apply Template API
 * POST /api/portfolio/templates/:id/apply - Apply template to user's site
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get user's site
    const site = await portfolioService.getSite();
    if (!site) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found. Please create a site first.',
          },
        },
        { status: 404 }
      );
    }

    // Apply template
    await portfolioService.applyTemplate(site.id, params.id);

    // Update site with template reference
    await portfolioService.updateSite(site.id, {
      template_id: params.id,
      template_applied_at: new Date().toISOString(),
    });

    return NextResponse.json({
      data: { success: true, site_id: site.id },
    });
  } catch (error) {
    console.error('Error applying template:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to apply template',
        },
      },
      { status: 500 }
    );
  }
}
