import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subdomain, path, tag } = body;

    // Verify revalidation token (add to env)
    const token = request.headers.get('x-revalidate-token');
    if (token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (tag) {
      // Revalidate by tag
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag });
    }

    if (subdomain) {
      // Revalidate specific subdomain
      if (path) {
        revalidatePath(`/sites/${subdomain}/${path}`);
      } else {
        revalidatePath(`/sites/${subdomain}`);
        revalidatePath(`/sites/${subdomain}`, 'page');
      }
      return NextResponse.json({ revalidated: true, subdomain, path });
    }

    // Revalidate all portfolio sites
    revalidatePath('/sites', 'layout');
    return NextResponse.json({ revalidated: true, all: true });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
}
