'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const t = useTranslations('landing.nav');

  useMotionValueEvent(scrollY, 'change', (latest: number) => {
    setIsScrolled(latest > 50);
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-white/5 shadow-2xl py-3'
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-2xl group"
        >
          <div className="size-10 rounded-xl bg-gradient-accent flex items-center justify-center text-dark shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-500 group-hover:scale-110">
            <span className="text-xl">S</span>
          </div>
          <span className="text-white tracking-tight">Supale</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors tracking-wide uppercase"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            <Link href="/sign-in">{t('logIn')}</Link>
          </Button>
          <GradientButton
            asChild
            size="default"
            className="shadow-xl shadow-primary/10 px-8"
          >
            <Link href="/sign-up">{t('startFreeTrial')}</Link>
          </GradientButton>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
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
            <GradientButton
              variant="variant"
              asChild
              className="w-full justify-center"
            >
              <Link href="/sign-in">{t('logIn')}</Link>
            </GradientButton>
            <GradientButton asChild className="w-full justify-center">
              <Link href="/sign-up">{t('startFreeTrial')}</Link>
            </GradientButton>
          </div>
        </div>
      )}
    </header>
  );
}
