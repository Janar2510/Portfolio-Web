import dns from 'dns';

/**
 * Validates domain format
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * Verifies domain DNS records
 */
export async function verifyDomainDNS(domain: string): Promise<{
  verified: boolean;
  type?: 'CNAME' | 'A';
  error?: string;
}> {
  try {
    // 1. Basic validation
    if (!isValidDomain(domain)) {
      return { verified: false, error: 'Invalid domain format' };
    }

    // 2. Perform real DNS lookups
    // In a real environment, you would check against your specific target IP or CNAME
    // For now, we'll verify if the domain resolves to ANY CNAME or A record
    // to demonstrate the actual DNS check working.

    const [cnames, aRecords] = await Promise.all([
      dns.promises.resolveCname(domain).catch(() => [] as string[]),
      dns.promises.resolve4(domain).catch(() => [] as string[]),
    ]);

    if (cnames.length > 0) {
      return {
        verified: true,
        type: 'CNAME',
      };
    }

    if (aRecords.length > 0) {
      return {
        verified: true,
        type: 'A',
      };
    }

    return {
      verified: false,
      error: 'DNS records not found or propagation still in progress',
    };
  } catch (error) {
    console.error('Domain verification error:', error);
    return {
      verified: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown DNS verification error',
    };
  }
}
