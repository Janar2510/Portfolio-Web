/**
 * Site API
 * GET, POST, PATCH, DELETE /api/portfolio/site
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createClientWithUser } from '@/lib/supabase/server';
import { SiteService } from '@/domain/builder/services';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { generateSiteFromTemplate } from '@/domain/builder/generator';

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
  subdomain: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  templateId: z.string().optional(),
});

const updateSiteSchema = z.object({
  subdomain: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  status: z.enum(['draft', 'published']).optional(),
  draft_config: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user to pass to SiteService
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const siteService = new SiteService();
    const site = await siteService.getSiteByUserId(user.id);

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
      console.error(
        'Authentication failed in /api/portfolio/site: No user recovered'
      );
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message:
              'Authentication required. Please make sure you are logged in.',
          },
        },
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const body = await request.json();

    const validated = createSiteSchema.parse(body);

    // Use the same supabase client for the service, passing the already-retrieved user
    const siteService = new SiteService();

    // Check if site already exists
    const existingSite = await siteService.getSiteByUserId(user.id);
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

    const draft_config = generateSiteFromTemplate(validated.templateId || 'artisanal-vision');

    const site = await siteService.createSite({
      slug: validated.subdomain,
      template_id: validated.templateId || 'artisanal-vision',
      owner_user_id: user.id,
      draft_config: draft_config as any,
    });

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
          message:
            error instanceof Error ? error.message : 'Failed to create site',
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

    const siteService = new SiteService();
    const site = await siteService.getSiteByUserId(user.id);

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

    // Map fields if necessary
    const updates: any = {};
    if (validated.subdomain) updates.slug = validated.subdomain;
    if (validated.status) updates.status = validated.status;
    if (validated.draft_config) updates.draft_config = validated.draft_config;

    const updated = await siteService.updateSite(site.id, updates);

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

    const siteService = new SiteService();
    const site = await siteService.getSiteByUserId(user.id);

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

    await siteService.deleteSite(site.id);

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
