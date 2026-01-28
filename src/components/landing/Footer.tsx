'use client';

import { Link } from '@/i18n/routing';
import { Twitter, Instagram, Github, Linkedin } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('landing.footer');

  const footerLinks = {
    product: [
      { labelKey: 'features', href: '#features' },
      { labelKey: 'pricing', href: '#pricing' },
      { labelKey: 'templates', href: '#templates' },
      { labelKey: 'showcase', href: '#examples' },
    ],
    resources: [
      { labelKey: 'blog', href: '#' },
      { labelKey: 'helpCenter', href: '#' },
      { labelKey: 'apiDocs', href: '#' },
      { labelKey: 'status', href: '#' },
    ],
    company: [
      { labelKey: 'about', href: '#' },
      { labelKey: 'careers', href: '#' },
      { labelKey: 'contact', href: '#' },
      { labelKey: 'press', href: '#' },
    ],
    legal: [
      { labelKey: 'privacy', href: '#' },
      { labelKey: 'terms', href: '#' },
      { labelKey: 'cookies', href: '#' },
      { labelKey: 'gdpr', href: '#' },
    ],
  };

  return (
    <footer className="bg-background border-t border-white/5 pt-24 pb-12 text-white overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-20">
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center gap-3 font-bold text-2xl mb-8 group"
            >
              <div className="size-10 rounded-xl bg-gradient-accent flex items-center justify-center text-dark shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <span className="text-xl">S</span>
              </div>
              <span className="tracking-tight">Supale</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed font-light">
              {t('description')}
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
              >
                <Twitter size={22} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-secondary transition-all hover:scale-110"
              >
                <Instagram size={22} />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
              >
                <Github size={22} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-8 tracking-tight">
              {t('product')}
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map(link => (
                <li key={link.labelKey}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                  >
                    {t(`links.${link.labelKey}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">{t('resources')}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map(link => (
                <li key={link.labelKey}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-teal-400 transition-colors text-sm"
                  >
                    {t(`links.${link.labelKey}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">{t('company')}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.labelKey}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-teal-400 transition-colors text-sm"
                  >
                    {t(`links.${link.labelKey}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">{t('legal')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map(link => (
                <li key={link.labelKey}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-teal-400 transition-colors text-sm"
                  >
                    {t(`links.${link.labelKey}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-muted-foreground text-sm font-medium">
            {t('copyright', { year: currentYear })}
          </p>
          <div className="flex items-center gap-8">
            <span className="text-muted-foreground text-sm flex items-center gap-2.5 font-medium group">
              <span className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,229,188,0.5)]"></span>
              {t('systemsOperational')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
