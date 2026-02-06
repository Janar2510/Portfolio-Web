'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

gsap.registerPlugin(ScrollTrigger);

const examples = [
  {
    title: 'Sarah Jenkins',
    role: 'Product Designer',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    color:
      'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  },
  {
    title: 'Davide Russo',
    role: 'Creative Developer',
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
    color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  },
  {
    title: 'Elena Kova',
    role: 'Architect',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop',
    color:
      'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
  },
];

export function PortfolioShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('landing.showcase');

  useGSAP(
    () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      // Horizontal scroll animation
      gsap.to(scrollContainer, {
        x: () => -(scrollContainer.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          end: () => '+=' + scrollContainer.scrollWidth,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="examples"
      ref={containerRef}
      className="h-screen bg-[#0B0F19] text-white overflow-hidden flex flex-col"
    >
      <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-xl">
            <h2 className="text-5xl md:text-7xl font-bold font-display text-white mb-6 leading-tight">
              {t('title')}{' '}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(104,169,165,0.4)]">
                {t('titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              {t('subtitle')}
            </p>
          </div>
          <GradientButton
            asChild
            size="lg"
            className="shadow-2xl shadow-primary/10"
          >
            <Link href="/examples">
              {t('viewAll')} <ArrowRight className="ml-2 size-5" />
            </Link>
          </GradientButton>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <div
          ref={scrollContainerRef}
          className="flex gap-10 px-4 md:px-6 w-max"
        >
          {examples.map((example, index) => (
            <div
              key={index}
              className="relative h-[55vh] md:h-[65vh] aspect-[16/10] rounded-3xl overflow-hidden group border border-white/5 shrink-0 transition-all duration-500 hover:border-primary/30"
            >
              <Image
                src={example.image}
                alt={example.title}
                fill
                priority={true}
                sizes="(max-width: 768px) 85vw, 800px"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 p-10 w-full">
                <div className="flex items-center justify-between gap-4">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-bold mb-4 ${example.color} glass-card uppercase tracking-[0.2em]`}
                    >
                      {example.role}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-white group-hover:text-primary transition-colors duration-300">
                      {example.title}
                    </h3>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full size-14 border-white/20 bg-white/5 text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 scale-90 group-hover:scale-100 flex-shrink-0"
                  >
                    <ExternalLink size={24} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Call to action card */}
          <div className="h-[55vh] md:h-[65vh] aspect-[16/10] rounded-3xl bg-gradient-zen border border-white/5 flex flex-col items-center justify-center text-center p-12 shrink-0 group hover:border-primary/20 transition-all duration-500">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:bg-primary/30 transition-colors" />
              <h3 className="text-4xl md:text-5xl font-bold text-white relative z-10">
                {t('next.title')}
              </h3>
            </div>
            <p className="text-xl text-muted-foreground mb-10 max-w-xs font-light">
              {t('next.description')}
            </p>
            <GradientButton asChild size="lg" className="font-bold px-10">
              <Link href="/sign-up">{t('next.button')}</Link>
            </GradientButton>
          </div>
        </div>
      </div>
    </section>
  );
}
