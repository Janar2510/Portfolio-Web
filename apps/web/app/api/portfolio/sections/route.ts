/**
 * Sections API
 * GET /api/portfolio/sections
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('portfolio_sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      meta: {
        total: data?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch sections',
        },
      },
      { status: 500 }
    );
  }
}
