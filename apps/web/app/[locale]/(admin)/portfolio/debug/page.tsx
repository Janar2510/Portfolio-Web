/**
 * Portfolio Debug Page
 * Simple page to test if portfolio route is accessible
 */

import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/lib/services/portfolio';

export default async function PortfolioDebugPage() {
  const supabase = await createClient();
  const portfolioService = new PortfolioService(supabase);

  let site = null;
  let pages = [];
  let error = null;

  try {
    site = await portfolioService.getSite();
    if (site) {
      pages = await portfolioService.getPages(site.id);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Portfolio Debug</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Site Status</h2>
          <pre className="text-xs overflow-auto">
            {site ? JSON.stringify(site, null, 2) : 'No site found'}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Pages</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(pages, null, 2)}
          </pre>
        </div>

        {error && (
          <div className="p-4 border border-red-500 rounded bg-red-50">
            <h2 className="font-semibold mb-2 text-red-700">Error</h2>
            <pre className="text-xs overflow-auto text-red-700">{error}</pre>
          </div>
        )}

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Actions</h2>
          <div className="space-y-2">
            <a
              href="/portfolio"
              className="block p-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Go to Portfolio Page
            </a>
            {site && (
              <a
                href={`/portfolio/editor/${pages[0]?.id || 'new'}`}
                className="block p-2 bg-secondary text-white rounded hover:bg-secondary/90"
              >
                Go to Editor
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
