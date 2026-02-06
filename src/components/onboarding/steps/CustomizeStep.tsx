'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/domain/builder/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Globe, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'framer-motion';

interface CustomizeStepProps {
  selectedTemplateId: string | null;
  onContinue: () => void;
  onSkip?: () => void;
  hideInternalButton?: boolean;
}

export function CustomizeStep({
  selectedTemplateId,
  onContinue,
  onSkip,
  hideInternalButton,
}: CustomizeStepProps) {
  const t = useTranslations('onboarding.customize');
  const [siteName, setSiteName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(
    null
  );

  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  // Check if site already exists
  const { data: existingSite } = useQuery({
    queryKey: ['portfolio-site'],
    queryFn: async () => {
      return await portfolioService.getSite();
    },
  });

  // Pre-fill if site exists
  useEffect(() => {
    if (existingSite) {
      setSiteName(existingSite.slug);
      setSubdomain(existingSite.slug);
      // Logo/BrandVoice not part of site model yet, so no pre-fill
    }
  }, [existingSite]);

  const handleSubdomainChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(sanitized);
    setSubdomainAvailable(null);

    if (sanitized.length >= 3) {
      // Check availability
      // TODO: Implement subdomain availability check
      setSubdomainAvailable(true);
    }
  };

  const handleContinue = async () => {
    // If site doesn't exist, create it
    if (!existingSite && siteName && subdomain) {
      try {
        await portfolioService.createSite({
          name: siteName,
          subdomain: subdomain,
          templateId: selectedTemplateId || undefined,
          logoUrl: logoUrl,
          brandVoice: brandVoice,
        });
      } catch (error) {
        console.error('Error creating site:', error);
      }
    }
    onContinue();
  };

  return (
    <div className="space-y-12 py-4 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold font-display tracking-tight text-white"
        >
          {t('title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/60"
        >
          {t('subtitle')}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-10"
      >
        <div className="grid grid-cols-1 gap-8 p-8 bg-white/5 border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
          {/* Site Name */}
          <div className="space-y-3">
            <Label htmlFor="siteName" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1">
              {t('siteName')}
            </Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              placeholder={t('siteNamePlaceholder')}
              className="h-14 bg-background/50 border-white/5 rounded-2xl text-white placeholder:text-white/20 px-6 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium text-lg"
            />
          </div>

          {/* Subdomain */}
          <div className="space-y-3">
            <Label htmlFor="subdomain" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1">
              {t('subdomain')}
            </Label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </div>
              <Input
                id="subdomain"
                value={subdomain}
                onChange={e => handleSubdomainChange(e.target.value)}
                placeholder="myportfolio"
                className="h-14 bg-background/50 border-white/5 rounded-2xl text-white placeholder:text-white/20 pl-14 pr-32 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium text-lg"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-white/20">
                {t('subdomainSuffix')}
              </div>
            </div>
            {subdomainAvailable !== null && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm ml-2"
              >
                {subdomainAvailable ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">
                      {t('subdomainAvailable')}
                    </span>
                  </>
                ) : (
                  <span className="text-red-400 font-medium">{t('subdomainTaken')}</span>
                )}
              </motion.div>
            )}
          </div>

          {/* Logo URL */}
          <div className="space-y-3">
            <Label htmlFor="logoUrl" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1">
              Logo (Optional)
            </Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="h-14 bg-background/50 border-white/5 rounded-2xl text-white placeholder:text-white/20 px-6 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          {/* Brand Voice */}
          <div className="space-y-3">
            <Label htmlFor="brandVoice" className="text-sm font-bold uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Brand Voice
            </Label>
            <textarea
              id="brandVoice"
              className="flex min-h-[120px] w-full rounded-2xl border border-white/5 bg-background/50 px-6 py-4 text-white ring-offset-background placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 active:border-primary/50 transition-all disabled:cursor-not-allowed disabled:opacity-50 text-base"
              value={brandVoice}
              onChange={e => setBrandVoice(e.target.value)}
              placeholder="e.g. Professional & Minimalist"
            />
            <p className="text-xs text-white/30 ml-1">
              Describe how your site should sound to visitors.
            </p>
          </div>
        </div>

        {/* Action Button */}
        {!hideInternalButton && (
          <div className="flex justify-center pt-4">
            <GradientButton
              size="lg"
              onClick={handleContinue}
              disabled={!siteName || !subdomain || subdomainAvailable === false}
              className="min-w-[240px] h-16 rounded-2xl text-lg shadow-2xl shadow-primary/40 group text-white"
            >
              Continue
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </GradientButton>
          </div>
        )}
      </motion.div>
    </div>
  );
}
