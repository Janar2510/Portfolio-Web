'use client';

import { Link } from '@/i18n/routing';
import { GradientButton } from '@/components/ui/gradient-button';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

export function CTASection() {
  const t = useTranslations('landing.cta');
  const { user, loading } = useAuth();

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
          {t('title')}
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          {t('subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <GradientButton
            asChild
            size="lg"
            className="text-lg px-12 py-8 rounded-2xl shadow-glow-soft"
          >
            <Link href={!loading && user ? "/dashboard" : "/sign-up"}>
              {!loading && user ? (t('dashboardButton') || t('button')) : t('button')} <ArrowRight className="ml-2 size-6" />
            </Link>
          </GradientButton>
          <p className="text-sm text-muted-foreground/60 mt-4 sm:mt-0 lg:absolute lg:bottom-[-40px] lg:left-1/2 lg:-translate-x-1/2">
            {t('note')}
          </p>
        </div>
      </div>
    </section>
  );
}
