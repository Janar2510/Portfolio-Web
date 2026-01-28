/**
 * Styles API
 * GET, PATCH /api/portfolio/styles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/domain/builder/portfolio';
import type { PortfolioSiteStyles } from '@/lib/portfolio/types';

export async function GET(request: NextRequest) {
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
    const site = await portfolioService.getSite();

    if (!site) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found',
          },
        },
        { status: 404 }
      );
    }

    const styles = await portfolioService.getStyles(site.id);

    if (!styles) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Styles not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: styles });
  } catch (error) {
    console.error('Error fetching styles:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch styles',
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
    const site = await portfolioService.getSite();

    if (!site) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found',
          },
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates = body as Partial<PortfolioSiteStyles>;
    const existingStyles = await portfolioService.getStyles(site.id);

    const mergedStyles = {
      color_palette: {
        ...(existingStyles?.color_palette || {}),
        ...(updates.colors || {}),
      },
      typography: {
        ...(existingStyles?.typography || {}),
        ...(updates.typography || {}),
      },
      spacing_scale: updates.spacing?.scale ?? existingStyles?.spacing_scale,
      custom_css: updates.custom_css ?? existingStyles?.custom_css,
    };

    const updated = await portfolioService.upsertStyles(site.id, {
      color_palette: mergedStyles.color_palette as any,
      typography: mergedStyles.typography as any,
      spacing_scale: mergedStyles.spacing_scale,
      custom_css: mergedStyles.custom_css || undefined,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating styles:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update styles',
        },
      },
      { status: 500 }
    );
  }
}
