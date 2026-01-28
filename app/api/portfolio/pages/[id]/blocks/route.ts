/**
 * Page Blocks API
 * GET, POST /api/portfolio/pages/:id/blocks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/domain/builder/portfolio';
import { z } from 'zod';

const createBlockSchema = z.object({
  block_type: z.string().min(1),
  content: z.record(z.unknown()).default({}),
  settings: z.record(z.unknown()).optional(),
  sort_order: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const portfolioService = new PortfolioService(supabase);

    const blocks = await portfolioService.getBlocks(params.id);

    return NextResponse.json({
      data: blocks,
      meta: {
        total: blocks.length,
      },
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch blocks',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const validated = createBlockSchema.parse(body);

    const block = await portfolioService.createBlock(params.id, validated);

    return NextResponse.json({ data: block }, { status: 201 });
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
        { status: 400 }
      );
    }

    console.error('Error creating block:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create block',
        },
      },
      { status: 500 }
    );
  }
}
