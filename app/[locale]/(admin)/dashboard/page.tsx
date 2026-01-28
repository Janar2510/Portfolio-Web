import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="heading-page mb-2">{t('nav.dashboard')}</h1>
        <p className="body-default text-muted-foreground">
          Welcome back! Here's an overview of your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portfolio Card */}
        <Link href="/portfolio" className="block">
          <div className="gradient-border p-6 bg-card rounded-lg shadow-lg border border-border hover-lift animate-slide-up animate-delay-100 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-primary-400 bg-primary-500/10 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary-400 transition-colors">
              {t('nav.portfolio')}
            </h2>
            <p className="text-muted-foreground mb-4">
              Manage your portfolio sites
            </p>
            <div className="flex items-center text-sm text-primary-400 font-medium">
              <span>View Portfolio</span>
              <svg
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
