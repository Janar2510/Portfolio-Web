/**
 * Domain Settings Component
 * Configure custom domain for portfolio site
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PortfolioService } from '@/lib/services/portfolio';
import { useEditorStore } from '@/stores/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function DomainSettings() {
  const supabase = createClient();
  const portfolioService = new PortfolioService(supabase);
  const queryClient = useQueryClient();
  const { currentPage } = useEditorStore();
  const [domainInput, setDomainInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const siteId = currentPage?.site_id;

  // Fetch site data
  const { data: site } = useQuery({
    queryKey: ['portfolio-site', siteId],
    queryFn: async () => {
      if (!siteId) return null;
      return await portfolioService.getSiteById(siteId);
    },
    enabled: !!siteId,
  });

  // Update domain mutation
  const updateDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      if (!siteId) throw new Error('No site ID');
      return await portfolioService.updateSite(siteId, {
        custom_domain: domain,
        custom_domain_verified: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site', siteId] });
    },
  });

  // Verify domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: async () => {
      if (!siteId) throw new Error('No site ID');
      setIsVerifying(true);
      try {
        const response = await fetch('/api/portfolio/domain/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ site_id: siteId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Failed to verify domain');
        }

        if (!result.data.verified) {
          throw new Error(
            result.data.error ||
              'Verification failed. Please check your DNS settings.'
          );
        }

        return result.data;
      } finally {
        setIsVerifying(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-site', siteId] });
    },
  });

  const handleSetDomain = () => {
    if (!domainInput.trim()) return;
    const domain = domainInput
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');
    updateDomainMutation.mutate(domain);
    setDomainInput('');
  };

  const handleRemoveDomain = () => {
    if (confirm('Remove custom domain?')) {
      updateDomainMutation.mutate('');
    }
  };

  if (!siteId) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No site selected
      </div>
    );
  }

  const customDomain = site?.custom_domain;
  const isVerified = site?.custom_domain_verified;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Custom Domain</h2>
        <p className="text-sm text-muted-foreground">
          Connect your own domain to your portfolio site
        </p>
      </div>

      {/* Current Domain Status */}
      {customDomain && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Current Domain</CardTitle>
              </div>
              {isVerified ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending Verification
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-mono">{customDomain}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your site is accessible at{' '}
                <a
                  href={`https://${customDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://{customDomain}
                  <ExternalLink className="inline h-3 w-3 ml-1" />
                </a>
              </p>
            </div>
            {!isVerified && (
              <div className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Domain verification is pending. Please configure your DNS
                    records:
                  </AlertDescription>
                </Alert>
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <div>
                    <Label className="text-xs">CNAME Record</Label>
                    <p className="font-mono text-sm mt-1">
                      {customDomain} → portfolio.example.com
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs">Or A Record</Label>
                    <p className="font-mono text-sm mt-1">
                      {customDomain} → 192.0.2.1
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => verifyDomainMutation.mutate()}
                  disabled={verifyDomainMutation.isPending || isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Verify Domain'}
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={handleRemoveDomain}>
              Remove Domain
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Domain */}
      {!customDomain && (
        <Card>
          <CardHeader>
            <CardTitle>Add Custom Domain</CardTitle>
            <CardDescription>
              Enter your domain name to connect it to your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                placeholder="example.com"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSetDomain();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Enter your domain without http:// or https://
              </p>
            </div>
            <Button
              onClick={handleSetDomain}
              disabled={!domainInput.trim() || updateDomainMutation.isPending}
            >
              {updateDomainMutation.isPending ? 'Setting...' : 'Set Domain'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Step 1: Add DNS Record</h4>
            <p className="text-sm text-muted-foreground">
              Add a CNAME or A record in your domain&apos;s DNS settings
              pointing to our servers.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Step 2: Wait for Propagation</h4>
            <p className="text-sm text-muted-foreground">
              DNS changes can take up to 48 hours to propagate globally.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Step 3: Verify Domain</h4>
            <p className="text-sm text-muted-foreground">
              Click &quot;Verify Domain&quot; once your DNS records are
              configured. We&apos;ll automatically set up SSL certificates for
              secure HTTPS access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
