'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const t = useTranslations('landing.nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const toggleLanguage = () => {
    const nextLocale = locale === 'et' ? 'en' : 'et';
    router.replace(pathname, { locale: nextLocale });
  };

  useMotionValueEvent(scrollY, 'change', (latest: number) => {
    setIsScrolled(latest > 20);
  });

  const navLinks = [
    { href: '#features', label: t('features') },
    { href: '#pricing', label: t('pricing') },
    { href: '#examples', label: t('examples') },
    { href: '#faq', label: t('faq') },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50 py-3 shadow-md'
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-2xl group"
        >
          <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-105">
            <span className="text-xl font-display">S</span>
          </div>
          <span className={cn(
            "tracking-tight font-display transition-colors",
            isScrolled ? "text-foreground" : "text-white"
          )}>
            Supale
          </span>
        </Link>

        {/* Desktop Nav & CTA - Grouped to the right */}
        <div className="hidden md:flex items-center gap-8 ml-auto">
          <nav className="flex items-center gap-6">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  isScrolled ? "text-muted-foreground" : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                isScrolled
                  ? "text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  : "text-white/80 border-white/20 hover:bg-white/10 hover:text-white"
              )}
            >
              <Globe size={14} />
              <span className="uppercase">{locale}</span>
            </button>
            {!loading && user ? (
              <GradientButton
                asChild
                className="shadow-lg hover:shadow-primary/40"
              >
                <Link href="/dashboard">{t('dashboard')}</Link>
              </GradientButton>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={cn(
                    "hover:bg-white/10 transition-all duration-300",
                    isScrolled
                      ? "text-foreground font-medium hover:shadow-[0_0_15px_rgba(var(--foreground-rgb),0.2)]"
                      : "text-white font-semibold hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                  )}
                >
                  <Link href="/sign-in">{t('logIn')}</Link>
                </Button>
                <GradientButton
                  asChild
                  className="shadow-lg hover:shadow-[0_0_30px_-5px_hsl(var(--primary))] hover:scale-105 transition-all duration-300 text-white font-bold tracking-wide"
                >
                  <Link href="/sign-up">{t('startFreeTrial')}</Link>
                </GradientButton>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={cn(
            "md:hidden p-2 transition-colors",
            isScrolled ? "text-foreground" : "text-white"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-lg font-medium text-foreground py-2 border-b border-border/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border bg-muted/50 text-foreground font-bold"
            >
              <Globe size={18} />
              <span>{locale === 'et' ? 'English' : 'Eesti'}</span>
            </button>
            {!loading && user ? (
              <GradientButton asChild className="w-full justify-center">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  {t('dashboard')}
                </Link>
              </GradientButton>
            ) : (
              <>
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-center"
                >
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>{t('logIn')}</Link>
                </Button>
                <GradientButton asChild className="w-full justify-center">
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>{t('startFreeTrial')}</Link>
                </GradientButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
