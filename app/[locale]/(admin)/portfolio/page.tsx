import { createClientWithUser } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTranslations } from 'next-intl/server';
import { PlusCircle, ExternalLink, Edit } from 'lucide-react';

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'portfolio' });

  const { supabase, user } = await createClientWithUser();

  if (!user) {
    redirect(`/${locale}/sign-in?next=/${locale}/portfolio`);
  }

  const { data: sites, error } = await supabase
    .from('sites')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sites:', error);
    return <div>Error loading sites.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Sites</h1>
        <Link href={`/${locale}/portfolio/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Site
          </Button>
        </Link>
      </div>

      {!sites || sites.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No sites yet</h2>
          <p className="text-muted-foreground mb-6">Create your first portfolio site to get started.</p>
          <Link href={`/${locale}/portfolio/new`}>
            <Button variant="secondary">Create Site</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate pr-4">{site.slug}</CardTitle>
                  <Badge variant={site.status === 'published' ? 'default' : 'secondary'}>
                    {site.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Template: {site.template_id}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(site.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/${locale}/portfolio/${site.id}/editor`} className="w-full">
                  <Button variant="default" className="w-full">
                    <Edit className="mr-2 h-4 w-4" /> Editor
                  </Button>
                </Link>
                {site.status === 'published' && (
                  <Link href={`/render/${site.slug}`} target="_blank">
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
