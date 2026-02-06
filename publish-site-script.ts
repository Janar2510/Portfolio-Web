import { createAdminClient } from './src/lib/supabase/server';
import { SupabaseSitesRepository } from './src/domain/sites/adapters/supabase-repo';
import { SitesService } from './src/domain/sites/sites-service';

async function publishSite(siteId: string) {
    const admin = createAdminClient();
    // Repository expects a user in the constructor for listing, 
    // but for publish we just need it to use the admin client internally.
    const repo = new SupabaseSitesRepository(admin, { id: '0b89db75-8be8-45da-a19a-d0302915637d' } as any);
    const svc = new SitesService(repo);

    console.log(`Publishing site: ${siteId}`);
    try {
        const published = await svc.publishSite({ siteId });
        console.log('Site published successfully!');
        console.log('Status:', published.status);
        console.log('Public URL: /s/' + published.slug);
    } catch (error) {
        console.error('Publish error:', error);
    }
}

publishSite('b9d2ba53-21d4-4e02-b69e-2aad4f1f19c1');
