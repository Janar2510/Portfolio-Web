'use client';

import { useRef, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

export function HeroContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('landing.hero');
  const { user, loading } = useAuth();

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(headlineRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
      })
        .from(
          subheadRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.6'
        )
        .from(
          ctaRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.4'
        )
        .from(
          statsRef.current?.children || [],
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
          },
          '-=0.2'
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="container mx-auto px-4 md:px-6 pt-32 pb-32 relative z-10"
    >
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="tracking-wide uppercase">{t('badge')}</span>
        </div>

        <h1
          ref={headlineRef}
          className="text-6xl md:text-[100px] font-bold font-display tracking-tight text-white mb-8 leading-[1.0] drop-shadow-sm"
        >
          {t('title')} <br />
          <span
            className="text-primary drop-shadow-[0_0_15px_rgba(104,169,165,0.4)]"
          >
            {t('titleHighlight')}
          </span>
        </h1>

        <p
          ref={subheadRef}
          className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl leading-relaxed font-light"
        >
          {t('subtitle')}
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 mb-20">
          <GradientButton
            asChild
            className="shadow-2xl shadow-primary/20 hover:shadow-primary/40 text-lg py-7 px-10 rounded-2xl"
          >
            <Link href={!loading && user ? "/dashboard" : "/sign-up"}>
              {!loading && user ? t('goToDashboard') : t('cta')}
              <ArrowRight className="ml-2 size-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </GradientButton>
          <Button
            variant="outline"
            size="lg"
            className="px-12 py-8 text-lg rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white transition-all bg-transparent"
            asChild
          >
            <Link href="#examples">{t('ctaSecondary')}</Link>
          </Button>
        </div>

        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10"
        >
          <div className="group">
            <div className="text-4xl font-bold text-white mb-1 group-hover:text-primary transition-colors font-display">
              10k+
            </div>
            <div className="text-sm text-white/50 uppercase tracking-widest font-medium">
              {t('stats.freelancers')}
            </div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-white mb-1 group-hover:text-primary transition-colors font-display">
              €2.5M
            </div>
            <div className="text-sm text-white/50 uppercase tracking-widest font-medium">
              {t('stats.revenue')}
            </div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-white mb-1 group-hover:text-primary transition-colors font-display">
              98%
            </div>
            <div className="text-sm text-white/50 uppercase tracking-widest font-medium">
              {t('stats.satisfaction')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
