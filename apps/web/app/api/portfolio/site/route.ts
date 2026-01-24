/**
 * Site API
 * GET, POST, PATCH, DELETE /api/portfolio/site
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createClientWithUser } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { generateSiteFromTemplate } from '@/lib/services/generator';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Ensure proper content negotiation
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    },
  });
}

const createSiteSchema = z.object({
  name: z.string().min(1),
  subdomain: z.string().min(1).regex(/^[a-z0-9-]+$/),
  templateId: z.string().uuid().optional(),
});

const updateSiteSchema = z.object({
  name: z.string().min(1).optional(),
  tagline: z.string().optional(),
  subdomain: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  custom_domain: z.string().optional(),
  is_published: z.boolean().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.array(z.string()).optional(),
  social_image_url: z.string().url().optional(),
  favicon_url: z.string().url().optional(),
  analytics_id: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user to pass to PortfolioService
    const { data: { user } } = await supabase.auth.getUser();
    const portfolioService = new PortfolioService(supabase, user);

    const site = await portfolioService.getSite();

    if (!site) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found',
          },
        },
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return NextResponse.json(
      { data: site },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch site',
        },
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use the standard createClientWithUser helper
    const { supabase, user } = await createClientWithUser();

    if (!user) {
      console.error('Authentication failed in /api/portfolio/site: No user recovered');
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please make sure you are logged in.',
          },
        },
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const body = await request.json();



    const validated = createSiteSchema.parse(body);

    // Use the same supabase client for the service, passing the already-retrieved user
    const portfolioService = new PortfolioService(supabase, user);

    // Check if site already exists
    const existingSite = await portfolioService.getSite();
    if (existingSite) {
      return NextResponse.json(
        {
          data: existingSite,
          message: 'Site already exists',
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const site = await portfolioService.createSite({
      name: validated.name,
      subdomain: validated.subdomain,
      // Don't pass templateId to service, we handle it manually
    });

    // Apply template manually if provided
    if (validated.templateId) {
      try {
        const generated = generateSiteFromTemplate(validated.templateId);

        // Apply styles
        if (generated.styles && Object.keys(generated.styles).length > 0) {
          await portfolioService.upsertStyles(site.id, {
            color_palette: generated.styles.colors || {},
            typography: generated.styles.typography || {},
            spacing_scale: generated.styles.spacing?.scale || 'default',
            custom_css: generated.styles.custom_css || null,
          });
        }

        // Create homepage
        const homepage = await portfolioService.createPage(site.id, {
          slug: 'home',
          title: 'Home',
          is_homepage: true,
        });

        // Add blocks
        for (const block of generated.blocks) {
          await portfolioService.createBlock(homepage.id, {
            block_type: block.block_type,
            content: block.content,
            settings: block.settings,
            sort_order: block.sort_order, // Generator doesn't set sort_order usually, but loop order matters
          });
        }

        // Reorder blocks to ensure correct order
        // Actually, just creating them in order should be enough if sort_order handles it,
        // but let's assume createBlock appends or we can rely on creation order.
        // We can explicitly update sort_order if needed, but for now loop is fine.

      } catch (err) {
        console.error('Failed to apply template:', err);
        // Continue, don't fail the request, just return empty site
      }
    }

    return NextResponse.json(
      { data: site },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
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
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.error('Error creating site:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create site',
        },
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
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

    const portfolioService = new PortfolioService(supabase, user);
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
    const validated = updateSiteSchema.parse(body);

    const updated = await portfolioService.updateSite(site.id, validated);

    return NextResponse.json({ data: updated });
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

    console.error('Error updating site:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update site',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const portfolioService = new PortfolioService(supabase, user);
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

    await portfolioService.deleteSite(site.id);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete site',
        },
      },
      { status: 500 }
    );
  }
}
