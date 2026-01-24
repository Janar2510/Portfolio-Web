/**
 * Page Detail API
 * GET, PATCH, DELETE /api/portfolio/pages/:id
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const portfolioService = new PortfolioService(supabase);

    const page = await portfolioService.getPageById(params.id);

    if (!page) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Page not found',
          },
        },
        { status: 404 }
      );
    }

    // Get blocks for the page
    const blocks = await portfolioService.getBlocks(page.id);

    return NextResponse.json({
      data: {
        ...page,
        blocks,
      },
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch page',
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await request.json();

    const updated = await portfolioService.updatePage(params.id, body);

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update page',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await portfolioService.deletePage(params.id);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete page',
        },
      },
      { status: 500 }
    );
  }
}
