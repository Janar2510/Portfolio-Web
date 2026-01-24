/**
 * Templates API
 * GET /api/portfolio/templates - List all templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const portfolioService = new PortfolioService(supabase);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';

    let templates;
    if (featured) {
      const { data, error } = await supabase
        .from('portfolio_templates')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      templates = data || [];
    } else {
      templates = await portfolioService.getTemplates(category || undefined);
    }

    return NextResponse.json({
      data: templates,
      meta: {
        total: templates.length,
      },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch templates',
        },
      },
      { status: 500 }
    );
  }
}
