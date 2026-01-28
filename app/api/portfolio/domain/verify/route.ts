import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/domain/builder/portfolio';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { site_id } = await request.json();

    if (!site_id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'site_id is required' } },
        { status: 400 }
      );
    }

    const portfolioService = new PortfolioService(supabase, user);
    const site = await portfolioService.getSiteById(site_id);

    if (!site || site.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Site not found' } },
        { status: 404 }
      );
    }

    // Custom domain support not in Step 4 minimal schema
    return NextResponse.json(
      {
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Custom domain verification is coming soon.',
        },
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in domain verification API:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to verify domain' } },
      { status: 500 }
    );
  }
}
