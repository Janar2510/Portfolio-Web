'use client';

import { useRef, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTranslations } from 'next-intl';

export function HeroContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('landing.hero');

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
      className="container mx-auto px-4 md:px-6 pt-24 pb-32 relative z-10"
    >
      <div className="max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-primary text-xs font-semibold mb-8 animate-fade-in glass-card">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="tracking-[0.2em] uppercase">{t('badge')}</span>
        </div>

        <h1
          ref={headlineRef}
          className="text-7xl md:text-[120px] font-bold font-display tracking-tighter text-white mb-8 leading-[0.9] drop-shadow-2xl"
        >
          {t('title')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary animate-gradient-flow">
            {t('titleHighlight')}
          </span>
        </h1>

        <p
          ref={subheadRef}
          className="text-xl md:text-2xl text-muted-foreground/80 mb-12 max-w-2xl leading-relaxed font-light"
        >
          {t('subtitle')}
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 mb-20">
          <GradientButton
            size="lg"
            className="shadow-[0_0_30px_rgba(0,229,188,0.3)] group px-12 py-8 text-lg rounded-2xl hover:scale-105 transition-all"
          >
            <Link href="/register">{t('cta')}</Link>
            <ArrowRight className="ml-2 size-6 group-hover:translate-x-1 transition-transform" />
          </GradientButton>
          <GradientButton
            variant="variant"
            size="lg"
            className="px-12 py-8 text-lg rounded-2xl hover:bg-white/5 transition-all"
            asChild
          >
            <Link href="#examples">{t('ctaSecondary')}</Link>
          </GradientButton>
        </div>

        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/5"
        >
          <div className="group">
            <div className="text-3xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
              10k+
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
              {t('stats.freelancers')}
            </div>
          </div>
          <div className="group">
            <div className="text-3xl font-bold text-white mb-1 group-hover:text-secondary transition-colors">
              €2.5M
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
              {t('stats.revenue')}
            </div>
          </div>
          <div className="group">
            <div className="text-3xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
              98%
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
              {t('stats.satisfaction')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
