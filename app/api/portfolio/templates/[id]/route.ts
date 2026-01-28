/**
 * Template Detail API
 * GET /api/portfolio/templates/:id - Get template detail
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/domain/builder/portfolio';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const portfolioService = new PortfolioService(supabase);

    const template = await portfolioService.getTemplateById(params.id);

    if (!template) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch template',
        },
      },
      { status: 500 }
    );
  }
}
