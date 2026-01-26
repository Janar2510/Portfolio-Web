import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';
import { verifyDomainDNS } from '@/lib/utils/domain';

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

    if (!site || site.user_id !== user.id) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Site not found' } },
        { status: 404 }
      );
    }

    if (!site.custom_domain) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No custom domain configured',
          },
        },
        { status: 400 }
      );
    }

    // Perform DNS verification
    const result = await verifyDomainDNS(site.custom_domain);

    if (result.verified) {
      // Update site status in database
      await portfolioService.updateSite(site.id, {
        custom_domain_verified: true,
      });
    }

    return NextResponse.json({
      data: {
        verified: result.verified,
        type: result.type,
        error: result.error,
      },
    });
  } catch (error) {
    console.error('Error in domain verification API:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to verify domain' } },
      { status: 500 }
    );
  }
}
