# Portfolio Data Layer Documentation

## Overview

The portfolio data layer consists of 5 main tables with comprehensive RLS policies and a seeded templates library.

## Tables

### 1. `portfolio_sites`
Main portfolio site configuration.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `name` (TEXT)
- `subdomain` (TEXT, UNIQUE)
- `custom_domain` (TEXT, UNIQUE, nullable)
- `is_published` (BOOLEAN, default: false)
- `seo_title`, `seo_description` (TEXT, nullable)
- `favicon_url`, `analytics_id` (TEXT, nullable)
- `created_at`, `updated_at`, `published_at` (TIMESTAMPTZ)

**Constraints:**
- One site per user (UNIQUE constraint on `user_id`)

### 2. `portfolio_pages`
Pages within a portfolio site.

**Columns:**
- `id` (UUID, PK)
- `site_id` (UUID, FK → portfolio_sites.id)
- `slug` (TEXT)
- `title` (TEXT)
- `is_homepage` (BOOLEAN, default: false)
- `is_published` (BOOLEAN, default: true)
- `sort_order` (INTEGER, default: 0)
- `seo_title`, `seo_description` (TEXT, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Constraints:**
- Unique slug per site (UNIQUE constraint on `site_id, slug`)

### 3. `portfolio_blocks`
Block-based page content (block builder system).

**Columns:**
- `id` (UUID, PK)
- `page_id` (UUID, FK → portfolio_pages.id)
- `block_type` (TEXT) - e.g., 'hero', 'text', 'gallery', 'projects', 'form'
- `content` (JSONB, default: {})
- `settings` (JSONB, default: {})
- `sort_order` (INTEGER, default: 0)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 4. `portfolio_styles`
Design presets and global styles for a site.

**Columns:**
- `id` (UUID, PK)
- `site_id` (UUID, FK → portfolio_sites.id, UNIQUE)
- `color_palette` (JSONB) - {primary, secondary, accent, background, text}
- `typography` (JSONB) - {headingFont, bodyFont, scale}
- `spacing_scale` (TEXT, default: 'default')
- `custom_css` (TEXT, nullable) - Pro feature

**Constraints:**
- One style per site (UNIQUE constraint on `site_id`)

### 5. `portfolio_templates`
System-wide template library (not user-specific).

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `thumbnail_url` (TEXT, nullable)
- `category` (TEXT, nullable) - e.g., 'minimal', 'creative', 'professional'
- `pages_schema` (JSONB) - Template structure with pages and blocks
- `styles_schema` (JSONB) - Default styles for the template
- `is_active` (BOOLEAN, default: true)
- `created_at` (TIMESTAMPTZ)

## Row Level Security (RLS)

All portfolio tables have RLS enabled with the following policies:

### `portfolio_sites`

**SELECT:**
- **"Anyone can view published portfolio sites"** - Public can view published sites, users can view their own
  - `is_published = TRUE OR auth.uid() = user_id`

**INSERT:**
- **"Users can insert own sites"** - Users can only create sites for themselves
  - `WITH CHECK (auth.uid() = user_id)`

**UPDATE:**
- **"Users can update own sites"** - Users can only update their own sites
  - `USING (auth.uid() = user_id)`

**DELETE:**
- **"Users can delete own sites"** - Users can only delete their own sites
  - `USING (auth.uid() = user_id)`

### `portfolio_pages`

**SELECT:**
- **"Users can view own site pages"** - Users can view pages of their own sites
- **"Public can view published pages"** - Public can view published pages of published sites

**INSERT/UPDATE/DELETE:**
- Users can manage pages of their own sites only

### `portfolio_blocks`

**SELECT:**
- **"Users can view own site blocks"** - Users can view blocks of their own site pages
- **"Public can view published page blocks"** - Public can view blocks of published pages

**INSERT/UPDATE/DELETE:**
- Users can manage blocks of their own site pages only

### `portfolio_styles`

**SELECT:**
- **"Users can view own site styles"** - Users can view styles of their own sites
- **"Public can view published site styles"** - Public can view styles of published sites

**INSERT/UPDATE/DELETE:**
- Users can manage styles of their own sites only

### `portfolio_templates`

**SELECT:**
- **"Everyone can view active templates"** - Anyone can view active templates (system-wide)
  - `USING (is_active = TRUE)`

**INSERT/UPDATE/DELETE:**
- No policies for authenticated users - managed by service role only

## Templates Library

The templates library is seeded with 5 starter templates:

### 1. **Minimal** (category: `minimal`)
- Clean, minimal design
- Focus on content
- Black and white color scheme
- Inter font family
- Pages: Home, About, Contact

### 2. **Creative** (category: `creative`)
- Bold, vibrant colors
- Dynamic layouts
- Dark background with bright accents
- Poppins/Open Sans fonts
- Pages: Home, Work

### 3. **Professional** (category: `professional`)
- Polished, business-focused
- Clean typography
- Professional color scheme
- Roboto font family
- Pages: Home, Services, Contact

### 4. **Developer** (category: `developer`)
- Modern, tech-focused
- Dark theme with code-inspired colors
- JetBrains Mono/Inter fonts
- Pages: Home, Projects

### 5. **Artist** (category: `artist`)
- Beautiful, elegant design
- Gallery-focused
- Light, airy design
- Playfair Display/Lora fonts
- Pages: Home, Gallery

## Template Schema Structure

Templates use a JSONB structure for `pages_schema`:

```json
[
  {
    "slug": "home",
    "title": "Home",
    "is_homepage": true,
    "blocks": [
      {
        "block_type": "hero",
        "content": {
          "headline": "Welcome",
          "subheadline": "Subtitle",
          "cta_text": "Button Text",
          "cta_link": "/link"
        },
        "settings": {
          "alignment": "center",
          "background": "gradient"
        }
      },
      {
        "block_type": "text",
        "content": {
          "text": "Content here"
        },
        "settings": {
          "max_width": "800px"
        }
      }
    ]
  }
]
```

And `styles_schema`:

```json
{
  "color_palette": {
    "primary": "#000000",
    "secondary": "#666666",
    "accent": "#0066ff",
    "background": "#ffffff",
    "text": "#000000"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "scale": "1.25"
  },
  "spacing_scale": "default"
}
```

## Indexes

All tables have optimized indexes for common queries:

- `portfolio_sites`: user_id, subdomain, custom_domain, is_published
- `portfolio_pages`: site_id, slug, homepage, published status
- `portfolio_blocks`: page_id, block_type, combined page_id + sort_order
- `portfolio_styles`: site_id
- `portfolio_templates`: is_active, category

## Triggers

- **`set_portfolio_sites_updated_at`** - Updates `updated_at` on site changes
- **`set_portfolio_pages_updated_at`** - Updates `updated_at` on page changes
- **`set_portfolio_blocks_updated_at`** - Updates `updated_at` on block changes
- **`set_portfolio_site_published_at`** - Sets `published_at` when site is first published

## Service Layer

The `PortfolioService` class provides methods to:
- Create/read/update/delete sites, pages, blocks, styles
- List and get templates
- Apply templates to sites (creates pages and blocks from template schema)

## Usage Example

```typescript
import { PortfolioService } from '@/lib/services/portfolio';

const portfolioService = new PortfolioService();

// Create a site
const site = await portfolioService.createSite({
  name: 'My Portfolio',
  subdomain: 'my-portfolio',
});

// Apply a template
await portfolioService.applyTemplate(site.id, templateId);

// Create a page
const page = await portfolioService.createPage(site.id, {
  slug: 'about',
  title: 'About Me',
  is_homepage: false,
});

// Add a block to the page
await portfolioService.createBlock(page.id, {
  block_type: 'hero',
  content: {
    headline: 'About Me',
    subheadline: 'Learn more',
  },
  settings: {
    alignment: 'center',
  },
});
```

## Security Notes

- All tables have RLS enabled
- Users can only access their own data
- Public can view published sites/pages/blocks/styles
- Templates are system-wide and read-only for users
- Service role is required to manage templates
