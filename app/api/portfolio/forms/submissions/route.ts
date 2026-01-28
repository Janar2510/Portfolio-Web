import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/domain/builder/portfolio';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('site_id');

    if (!siteId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'site_id is required' } },
        { status: 400 }
      );
    }

    const portfolioService = new PortfolioService(supabase, user);
    const submissions = await portfolioService.getFormSubmissions(siteId);

    return NextResponse.json({ data: submissions });
  } catch (error) {
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
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { id, is_read, status } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Submission ID is required',
          },
        },
        { status: 400 }
      );
    }

    const portfolioService = new PortfolioService(supabase, user);
    const updated = await portfolioService.updateFormSubmission(id, {
      is_read,
      status,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating form submission:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update form submission',
        },
      },
      { status: 500 }
    );
  }
}
