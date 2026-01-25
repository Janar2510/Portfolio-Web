'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';

interface CustomizeStepProps {
  selectedTemplateId: string | null;
  onContinue: () => void;
  onSkip?: () => void;
}

export function CustomizeStep({
  selectedTemplateId,
  onContinue,
  onSkip,
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
  useState(() => {
    if (existingSite) {
      setSiteName(existingSite.name);
      setSubdomain(existingSite.subdomain);
      // Logo/BrandVoice not part of site model yet, so no pre-fill
    }
  });

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
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Site Name */}
        <div className="space-y-2">
          <Label htmlFor="siteName">{t('siteName')}</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            placeholder={t('siteNamePlaceholder')}
          />
        </div>

        {/* Subdomain */}
        <div className="space-y-2">
          <Label htmlFor="subdomain">{t('subdomain')}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="subdomain"
              value={subdomain}
              onChange={e => handleSubdomainChange(e.target.value)}
              placeholder="myportfolio"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t('subdomainSuffix')}
            </span>
          </div>
          {subdomainAvailable !== null && (
            <div className="flex items-center gap-2 text-sm">
              {subdomainAvailable ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success-main" />
                  <span className="text-success-main">
                    {t('subdomainAvailable')}
                  </span>
                </>
              ) : (
                <span className="text-error-main">{t('subdomainTaken')}</span>
              )}
            </div>
          )}
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <Input
            id="logoUrl"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Brand Voice */}
        <div className="space-y-2">
          <Label htmlFor="brandVoice">Brand Voice</Label>
          <div className="relative">
            <textarea
              id="brandVoice"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={brandVoice}
              onChange={e => setBrandVoice(e.target.value)}
              placeholder="E.g. Professional, Friendly, Minimalist, Bold..."
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Describe how you want your site to sound.
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!siteName || !subdomain || subdomainAvailable === false}
            className="min-w-[200px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
