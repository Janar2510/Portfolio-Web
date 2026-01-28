'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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

export function CreateSiteDialog({
  open,
  onOpenChange,
}: CreateSiteDialogProps) {
  const t = useTranslations('portfolio');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const queryClient = useQueryClient();
  const [siteName, setSiteName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [errors, setErrors] = useState<{ name?: string; subdomain?: string }>(
    {}
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth check error:', error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!session?.user);
        }
      } catch (err) {
        console.error('Failed to check auth:', err);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const createSiteMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      subdomain: string;
      templateId?: string;
    }) => {
      // Use API route instead of direct service call for better error handling
      const response = await fetch('/api/portfolio/site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create site');
      }

      return result.data;
    },
    onSuccess: async site => {
      console.log('Site created successfully:', site);
      queryClient.invalidateQueries({ queryKey: ['portfolio-site'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-pages'] });
      onOpenChange(false);
      // Reset form
      setSiteName('');
      setSubdomain('');
      setSelectedTemplateId(null);
      setErrors({});
      // Force a hard refresh to ensure server component re-renders
      window.location.href = `/${locale}/portfolio`;
    },
    onError: (error: Error) => {
      console.error('Error creating site:', error);
      const errorMessage = error.message || 'Failed to create site';

      if (
        errorMessage.includes('subdomain') ||
        errorMessage.includes('taken')
      ) {
        setErrors({ subdomain: errorMessage });
      } else if (
        errorMessage.includes('already has') ||
        errorMessage.includes('exists')
      ) {
        setErrors({
          name: 'You already have a site. Please refresh the page.',
        });
      } else if (
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid')
      ) {
        setErrors({ subdomain: 'Invalid subdomain format' });
      } else {
        setErrors({ name: errorMessage });
      }

      // Keep dialog open on error so user can see the error
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

    // Verify authentication before submitting
    if (!isAuthenticated) {
      setErrors({
        name: 'You must be logged in to create a site. Please refresh the page and try again.',
      });
      return;
    }
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
              Create your portfolio site. Choose a name and subdomain, and
              optionally select a template to get started.
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
                  onChange={e => {
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
                    onChange={e => handleSubdomainChange(e.target.value)}
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

          {(errors.name || errors.subdomain) && (
            <div className="rounded-lg border border-error-main bg-error-light p-4">
              <p className="text-sm font-medium text-error-main">
                {errors.name || errors.subdomain}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createSiteMutation.isPending || isCheckingAuth}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createSiteMutation.isPending ||
                isCheckingAuth ||
                !isAuthenticated
              }
            >
              {isCheckingAuth ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : createSiteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Site'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
