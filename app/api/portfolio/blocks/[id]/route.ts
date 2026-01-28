/**
 * Block Detail API
 * PATCH, DELETE /api/portfolio/blocks/:id
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/domain/builder/portfolio';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
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

    const updated = await portfolioService.updateBlock(params.id, body);

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update block',
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
    const supabase = await createClient();
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

    await portfolioService.deleteBlock(params.id);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete block',
        },
      },
      { status: 500 }
    );
  }
}
