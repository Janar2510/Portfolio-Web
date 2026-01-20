import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t('welcome')}</h1>
        <p className="text-lg mb-8 text-muted-foreground">
          Portfolio, Project Management, and CRM Platform
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
