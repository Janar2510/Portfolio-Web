'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TemplateChooser } from './TemplateChooser';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CreateSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSiteDialog({ open, onOpenChange }: CreateSiteDialogProps) {
  const t = useTranslations('portfolio');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [siteName, setSiteName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; subdomain?: string }>({});

  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);

  const createSiteMutation = useMutation({
    mutationFn: async (data: { name: string; subdomain: string; templateId?: string }) => {
      const site = await portfolioService.createSite({
        name: data.name,
        subdomain: data.subdomain,
        templateId: data.templateId || undefined,
      });
      return site;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages'] });
      onOpenChange(false);
      router.refresh();
    },
    onError: (error: Error) => {
      if (error.message.includes('subdomain')) {
        setErrors({ subdomain: t('subdomainTaken') });
      } else if (error.message.includes('already has')) {
        setErrors({ name: t('alreadyHasSite') });
      } else {
        setErrors({ name: error.message });
      }
    },
  });

  const handleSubdomainChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(sanitized);
    if (errors.subdomain) {
      setErrors({ ...errors, subdomain: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: { name?: string; subdomain?: string } = {};
    if (!siteName.trim()) {
      newErrors.name = t('siteNameRequired');
    }
    if (!subdomain.trim()) {
      newErrors.subdomain = t('subdomainRequired');
    } else if (subdomain.length < 3) {
      newErrors.subdomain = t('subdomainMinLength');
    } else if (!/^[a-z0-9-]+$/.test(subdomain)) {
      newErrors.subdomain = t('subdomainInvalid');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await createSiteMutation.mutateAsync({
      name: siteName.trim(),
      subdomain: subdomain.trim(),
      templateId: selectedTemplateId || undefined,
    });
  };

  const handleClose = () => {
    if (!createSiteMutation.isPending) {
      setSiteName('');
      setSubdomain('');
      setSelectedTemplateId(null);
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('createSite')}</DialogTitle>
            <DialogDescription>
              Create your portfolio site. Choose a name and subdomain, and optionally select a template to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Site Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">{t('siteName')} *</Label>
                <Input
                  id="site-name"
                  value={siteName}
                  onChange={(e) => {
                    setSiteName(e.target.value);
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined });
                    }
                  }}
                  placeholder="My Portfolio"
                  disabled={createSiteMutation.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-error-main">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdomain">{t('subdomain')} *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    placeholder={t('subdomainPlaceholder')}
                    disabled={createSiteMutation.isPending}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    .yourdomain.com
                  </span>
                </div>
                {errors.subdomain && (
                  <p className="text-sm text-error-main">{errors.subdomain}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('subdomainHint')}
                </p>
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-3">
              <div>
                <Label>{t('templates')} (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('templateOptional')}
                </p>
              </div>
              <TemplateChooser
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={setSelectedTemplateId}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createSiteMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSiteMutation.isPending}>
              {createSiteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Site
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
