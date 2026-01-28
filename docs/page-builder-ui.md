# Page Builder UI Documentation

## Overview

The Page Builder UI provides a complete visual editor for creating and managing portfolio pages with a block-based system. It includes pages management, block insertion, editing panels, and style customization.

## Components

### 1. PageBuilder (Main Component)

**Location**: `components/portfolio/builder/PageBuilder.tsx`

The main orchestrator component that brings together all page builder functionality.

**Features:**
- Three-panel layout (Pages List, Editor, Style Panel)
- React Query integration for data fetching
- Mutation handling for all CRUD operations
- Preview mode toggle
- Real-time updates

**Usage:**
```tsx
import { PageBuilder } from '@/components/portfolio/builder';

<PageBuilder siteId={siteId} />
```

### 2. PagesList

**Location**: `components/portfolio/builder/PagesList.tsx`

Sidebar component for managing pages.

**Features:**
- List all pages with homepage indicator
- Create new pages (with slug validation)
- Edit page details (title, slug, homepage status)
- Delete pages (with confirmation)
- Visual indication of current page
- Sort pages (homepage first, then by sort_order)

**Props:**
- `pages`: Array of PortfolioPage
- `currentPageId`: Currently selected page ID
- `onPageSelect`: Callback when page is selected
- `onPageCreate`: Callback to create new page
- `onPageUpdate`: Callback to update page
- `onPageDelete`: Callback to delete page

### 3. BlockToolbar

**Location**: `components/portfolio/builder/BlockToolbar.tsx`

Toolbar for inserting new blocks into the page.

**Features:**
- Popover menu with categorized blocks
- Visual icons for each block type
- Descriptions for each block
- Organized by category (Content, Media, Interactive)

**Props:**
- `onBlockAdd`: Callback when block is selected
- `disabled`: Disable the toolbar (e.g., in preview mode)

**Block Categories:**
- **Content**: Hero, Text, Projects
- **Media**: Image, Gallery, Video
- **Interactive**: Form

### 4. BlockEditingPanel

**Location**: `components/portfolio/builder/BlockEditingPanel.tsx`

Modal dialog for editing block content and settings.

**Features:**
- Tabbed interface (Content / Settings)
- Type-safe form fields based on block type
- React Hook Form integration
- Zod validation
- Dynamic field rendering per block type

**Props:**
- `block`: Block to edit (null to close)
- `isOpen`: Dialog open state
- `onClose`: Close callback
- `onSave`: Save callback with content and settings

**Supported Block Types:**
- Hero: Headline, subheadline, CTA, background image, alignment, height
- Text: Title, text content, HTML, alignment, max width
- Gallery: Title, images (placeholder), layout, columns
- Projects: Title, limit, layout, columns
- Form: Title, description, submit text, success message, layout, button style
- Image: Image URL, alt text, caption, link, alignment, width
- Video: Video URL, type, thumbnail, aspect ratio, controls

### 5. StyleCustomizationPanel

**Location**: `components/portfolio/builder/StyleCustomizationPanel.tsx`

Sidebar panel for customizing site-wide styles.

**Features:**
- Tabbed interface (Colors, Typography, Spacing)
- Color picker with hex input
- Font selection dropdowns
- Font scale options
- Spacing scale presets
- Custom CSS editor (Pro feature)

**Props:**
- `style`: Current PortfolioStyle (null if not created)
- `onSave`: Save callback
- `isOpen`: Panel visibility
- `onClose`: Close callback

**Tabs:**
1. **Colors**: Primary, Secondary, Accent, Background, Text
2. **Typography**: Heading font, Body font, Font scale
3. **Spacing**: Spacing scale, Custom CSS

## UI Components

### Dialog
Shadcn UI dialog component for modals.

**Location**: `components/ui/dialog.tsx`

### Tabs
Shadcn UI tabs component for tabbed interfaces.

**Location**: `components/ui/tabs.tsx`

### Popover
Shadcn UI popover component for dropdowns.

**Location**: `components/ui/popover.tsx`

### Textarea
Shadcn UI textarea component.

**Location**: `components/ui/textarea.tsx`

## Integration with Editor Foundation

The Page Builder UI integrates seamlessly with the editor foundation:

1. **BlockEditor**: Uses the drag-and-drop editor for block management
2. **BlockRenderer**: Renders blocks with editing capabilities
3. **Block Schema**: Uses type-safe schemas for validation
4. **Block Components**: All 7 base blocks are supported

## Data Flow

```
PageBuilder
  ├── PagesList (React Query: pages)
  ├── BlockEditor (React Query: blocks)
  │   └── BlockRenderer
  │       └── Block Components (Hero, Text, etc.)
  ├── BlockEditingPanel (Modal)
  └── StyleCustomizationPanel (React Query: styles)
```

## State Management

- **React Query**: All data fetching and caching
- **Local State**: UI state (dialogs, panels, preview mode)
- **Mutations**: Optimistic updates with query invalidation

## Features

### ✅ Pages Management
- Create, edit, delete pages
- Set homepage
- Slug validation
- Visual page list

### ✅ Block Management
- Add blocks via toolbar
- Drag-and-drop reordering
- Edit block content and settings
- Delete blocks
- Visual editing controls

### ✅ Style Customization
- Color palette customization
- Typography settings
- Spacing controls
- Custom CSS (Pro)

### ✅ Preview Mode
- Toggle between edit and preview
- Hide editing controls
- Full page preview

## Usage Example

```tsx
'use client';

import { PageBuilder } from '@/components/portfolio/builder';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function PortfolioEditorPage({ params }: { params: { siteId: string } }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PageBuilder siteId={params.siteId} />
    </QueryClientProvider>
  );
}
```

## File Structure

```
app/[locale]/(admin)/builder/
├── PageBuilder.tsx              # Main component
├── PagesList.tsx                # Pages sidebar
├── BlockToolbar.tsx             # Block insertion toolbar
├── BlockEditingPanel.tsx        # Block edit dialog
├── StyleCustomizationPanel.tsx  # Style customization panel
└── index.ts                     # Exports

src/components/ui/
├── dialog.tsx                   # Dialog component
├── tabs.tsx                     # Tabs component
├── popover.tsx                  # Popover component
└── textarea.tsx                 # Textarea component
```

## Next Steps

- [ ] Image upload integration for gallery/image blocks
- [ ] Rich text editor for text blocks
- [ ] Block duplication
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Block templates/presets
- [ ] Responsive preview
- [ ] Publish/unpublish pages
- [ ] Page templates
- [ ] SEO settings per page
