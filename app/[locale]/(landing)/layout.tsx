import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.home' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'et' ? 'et_EE' : 'en_US',
      siteName: 'Supale',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    keywords:
      locale === 'et'
        ? [
          'portfoolio',
          'veebileht',
          'veebiportfoolio',
          'disain',
          'vabakutseline',
          'Supale',
        ]
        : [
          'portfolio',
          'website',
          'web portfolio',
          'design',
          'freelancer',
          'Supale',
        ],
  };
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main className="flex-1 selection:bg-teal-100 selection:text-teal-900">
        {children}
      </main>
      <Footer />
    </div>
  );
}
