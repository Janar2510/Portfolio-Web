/**
 * Structured Data (JSON-LD) generation for Supale main site
 */

export function generateSoftwareApplicationJSONLD(locale: string) {
  const isEt = locale === 'et';
  const name = 'Supale';
  const slogan = isEt
    ? 'Sinu professionaalne pale internetis.'
    : 'Show your true face.';
  const description = isEt
    ? 'Supale on lihtsaim viis luua veebis oma professionaalne pale. Ideaalne copywriteritele ja disaineritele.'
    : 'Supale is the easiest way to create your professional face online. Ideal for copywriters and designers.';

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    brand: {
      '@type': 'Brand',
      name,
      slogan,
    },
  };
}

export function generateOrganizationJSONLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Supale',
    url: 'https://supale.ee',
    logo: 'https://supale.ee/logo.png', // Placeholder until actual logo
    sameAs: ['https://twitter.com/supale', 'https://instagram.com/supale'],
  };
}
