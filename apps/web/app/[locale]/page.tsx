import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t('welcome')}</h1>
        <p className="text-lg mb-8">
          Portfolio, Project Management, and CRM Platform
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
