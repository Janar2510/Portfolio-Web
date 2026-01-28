import { z } from 'zod';

/**
 * Deployment Provider Interface
 * This defines how the application interacts with infrastructure providers
 * (e.g., Vercel, Netlify, Cloudflare) for domain management.
 */

export const DomainVerificationSchema = z.object({
    domain: z.string(),
    type: z.enum(['CNAME', 'A', 'TXT']),
    target: z.string(),
    status: z.enum(['pending', 'verified', 'failed']),
    reason: z.string().optional(),
});

export type DomainVerification = z.infer<typeof DomainVerificationSchema>;

export interface IDeploymentProvider {
    /**
     * Registers a custom domain with the provider
     */
    addDomain(siteId: string, domain: string): Promise<DomainVerification>;

    /**
     * Checks the DNS status of a domain
     */
    verifyDomain(domain: string): Promise<DomainVerification>;

    /**
     * Removes a domain from the provider
     */
    removeDomain(domain: string): Promise<void>;

    /**
     * Purges cache for a specific site
     */
    purgeCache(domain: string): Promise<void>;
}

/**
 * Site Release (History/Rollback)
 */
export const SiteReleaseSchema = z.object({
    id: z.string().uuid(),
    siteId: z.string().uuid(),
    config: z.any(), // TemplateConfig
    version: z.number(),
    publishedBy: z.string().uuid(),
    createdAt: z.string().datetime(),
});

export type SiteRelease = z.infer<typeof SiteReleaseSchema>;
