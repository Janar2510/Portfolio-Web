import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const portfolioService = new PortfolioService(supabase, user);
    const site = await portfolioService.getSite();

    if (!site) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Site not found' } },
        { status: 404 }
      );
    }

    await portfolioService.unpublishSite(site.id);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error unpublishing site:', error);
    return NextResponse.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'Failed to unpublish site' },
      },
      { status: 500 }
    );
  }
}
