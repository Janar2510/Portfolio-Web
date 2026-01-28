/**
 * Reorder Blocks API
 * PATCH /api/portfolio/pages/:id/blocks/reorder
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/domain/builder/portfolio';
import { z } from 'zod';

const reorderSchema = z.object({
  blockIds: z.array(z.string().uuid()),
});

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
    const validated = reorderSchema.parse(body);

    await portfolioService.reorderBlocks(validated.blockIds);

    return NextResponse.json({ data: { success: true } });
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

    console.error('Error reordering blocks:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reorder blocks',
        },
      },
      { status: 500 }
    );
  }
}
