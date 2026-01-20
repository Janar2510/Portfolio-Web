# Publishing System Documentation

## Overview

The publishing system enables public portfolio sites to be served via subdomains with SSG/ISR, proper SEO, and optimized performance.

## Features

### ✅ SSG/ISR Configuration

Portfolio sites are statically generated with Incremental Static Regeneration (ISR):

- **Static Generation**: All published sites and pages are pre-rendered at build time
- **ISR**: Pages are revalidated every hour (3600 seconds)
- **On-Demand Revalidation**: Can be triggered when sites are published/updated

**Configuration:**
```typescript
// Revalidate every hour
export const revalidate = 3600;
```

### ✅ Subdomain Routing

Portfolio sites are accessible via subdomains:

- **Format**: `subdomain.domain.com` or `subdomain.localhost:3000`
- **Middleware**: Detects subdomain and rewrites to `/sites/[subdomain]` route
- **Public Access**: No authentication required for published sites

**Example:**
- `john-doe.portfolio.com` → `/sites/john-doe`
- `john-doe.portfolio.com/about` → `/sites/john-doe/about`

### ✅ SEO Fields and Meta Tags

Comprehensive SEO support:

- **Page-level SEO**: Title, description per page
- **Site-level SEO**: Default title, description, favicon
- **Open Graph**: Full OG tags for social sharing
- **Twitter Cards**: Twitter-specific meta tags
- **Structured Data**: JSON-LD schema.org markup
- **Canonical URLs**: Proper canonical links
- **Robots Meta**: Index/follow controls

## Architecture

### File Structure

```
apps/web/
├── app/
│   └── sites/
│       └── [subdomain]/
│           ├── layout.tsx              # Site layout with metadata
│           ├── page.tsx                 # Homepage (ISR)
│           ├── [slug]/
│           │   └── page.tsx            # Page routes (ISR)
│           ├── PublicPortfolioPage.tsx  # Client component for rendering
│           └── not-found.tsx           # 404 page
├── lib/
│   ├── portfolio/
│   │   └── public.ts                   # Public portfolio service
│   └── seo/
│       └── metadata.ts                 # SEO utilities
├── components/
│   └── portfolio/
│       └── public/
│           └── SEOMetadata.tsx        # SEO metadata component
└── middleware.ts                       # Subdomain routing
```

### Components

#### 1. PublicPortfolioService

**Location**: `lib/portfolio/public.ts`

Service for fetching public portfolio data (no authentication required).

**Methods:**
- `getSiteBySubdomain(subdomain)` - Get published site by subdomain
- `getPagesBySite(siteId)` - Get all published pages for a site
- `getPageBySlug(siteId, slug)` - Get specific page by slug
- `getBlocksByPage(pageId)` - Get blocks for a page
- `getStylesBySite(siteId)` - Get styles for a site
- `getAllPublishedSites()` - Get all published sites (for static generation)

#### 2. SEO Metadata Utilities

**Location**: `lib/seo/metadata.ts`

Functions for generating SEO metadata:

- `generatePageMetadata()` - Generate SEO metadata object
- `generateMetadataTags()` - Generate HTML meta tags
- `generateStructuredData()` - Generate JSON-LD structured data

#### 3. Subdomain Middleware

**Location**: `middleware.ts`

Handles subdomain detection and routing:

```typescript
// Detects: subdomain.domain.com
// Rewrites to: /sites/[subdomain]/[path]
```

**Features:**
- Subdomain detection
- Path rewriting
- Bypasses auth for public sites
- Preserves query parameters

## Usage

### Accessing Portfolio Sites

**Development:**
```
http://subdomain.localhost:3000
http://subdomain.localhost:3000/about
```

**Production:**
```
https://subdomain.portfolio.com
https://subdomain.portfolio.com/about
```

### Static Generation

Sites are statically generated at build time:

```bash
npm run build
```

During build:
1. `generateStaticParams()` fetches all published sites
2. Each site's homepage is pre-rendered
3. Each page is pre-rendered
4. Static HTML files are generated

### ISR Revalidation

Pages are revalidated every hour, or on-demand:

**On-Demand Revalidation:**
```typescript
// Revalidate a specific site
await fetch(`/api/revalidate?subdomain=${subdomain}`);

// Revalidate all sites
await fetch('/api/revalidate?all=true');
```

## SEO Implementation

### Page Metadata

Each page includes:

1. **Title**: Page SEO title or site name
2. **Description**: Page SEO description or site description
3. **Open Graph**: Full OG tags for social sharing
4. **Twitter Cards**: Twitter-specific meta tags
5. **Structured Data**: JSON-LD schema.org markup
6. **Canonical URL**: Proper canonical link

### Example Metadata

```typescript
{
  title: "John Doe | Portfolio",
  description: "Creative designer and developer",
  openGraph: {
    title: "John Doe | Portfolio",
    description: "Creative designer and developer",
    url: "https://john-doe.portfolio.com",
    siteName: "John Doe",
    images: ["https://..."],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "John Doe | Portfolio",
    description: "Creative designer and developer"
  }
}
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_PORTFOLIO_BASE_URL=https://portfolio.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Next.js Config

No special configuration needed - SSG/ISR works out of the box with App Router.

## Performance

### Static Generation Benefits

- **Fast Loading**: Pre-rendered HTML served instantly
- **SEO Friendly**: Fully rendered content for crawlers
- **CDN Cacheable**: Static files can be cached globally
- **Reduced Server Load**: No server-side rendering needed

### ISR Benefits

- **Fresh Content**: Pages revalidated every hour
- **On-Demand Updates**: Can trigger revalidation when content changes
- **Best of Both Worlds**: Static performance with dynamic updates

## Security

### Public Access

- Portfolio sites are **publicly accessible** (no authentication)
- Only **published** sites are accessible
- RLS policies ensure users can only access their own data in admin

### Data Exposure

- Only published content is exposed
- User authentication not required
- Site data fetched with anon key (RLS protected)

## Customization

### Styles Application

Site styles are applied via:

1. **CSS Variables**: Color palette and typography
2. **Custom CSS**: Pro feature for advanced customization
3. **Inline Styles**: Applied to root element

### Block Rendering

Blocks are rendered using the same `BlockRenderer` component:

- **Edit Mode**: Shows editing controls
- **Preview Mode**: Clean public view
- **Responsive**: All blocks are mobile-friendly

## Next Steps

- [ ] Custom domain support
- [ ] Analytics integration (GA4)
- [ ] Sitemap generation
- [ ] RSS feed generation
- [ ] On-demand revalidation API
- [ ] Preview mode for unpublished sites
- [ ] Password protection for sites
- [ ] Multi-language support per site
