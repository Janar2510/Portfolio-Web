# Editor Foundation Documentation

## Overview

The editor foundation provides a complete block-based page builder system with drag-and-drop functionality, type-safe block schemas, and a comprehensive set of base block components.

## Architecture

### Block Schema System

Located in `src/domain/builder/blocks/schemas.ts`, the schema system provides:

- **Type Definitions**: Zod schemas for all block types
- **Type Safety**: TypeScript types derived from schemas
- **Validation**: Runtime validation helpers
- **Block Registry**: Metadata for all available blocks

#### Supported Block Types

1. **Hero** - Large banner section with headline and CTA
2. **Text** - Rich text content block
3. **Gallery** - Image gallery with multiple layouts
4. **Projects** - Display portfolio projects
5. **Form** - Contact or newsletter form
6. **Image** - Single image with optional link
7. **Video** - Embedded video player

### Drag and Drop Infrastructure

Built with `@dnd-kit`, the drag-and-drop system provides:

- **BlockEditor**: Main editor component with DndContext
- **SortableBlockWrapper**: Wrapper for sortable blocks with drag handles
- **Utilities**: Helper functions for drag ID management

#### Features

- ✅ Vertical list sorting
- ✅ Keyboard navigation support
- ✅ Visual feedback during drag
- ✅ Automatic sort_order updates

### Block Components

All blocks are located in `src/components/portfolio/blocks/`:

#### BaseBlock

Base wrapper component that provides:
- Editing controls (edit, delete, add after)
- Hover states
- Visual editing indicators
- Consistent block structure

#### Individual Block Components

1. **HeroBlock** (`HeroBlock.tsx`)
   - Headline and subheadline
   - Call-to-action button
   - Background options (solid, gradient, image)
   - Alignment and height controls

2. **TextBlock** (`TextBlock.tsx`)
   - Rich text content
   - HTML support
   - Text alignment
   - Font size options
   - Max width control

3. **GalleryBlock** (`GalleryBlock.tsx`)
   - Multiple layout options (grid, masonry, carousel)
   - Configurable columns
   - Image captions
   - Responsive design

4. **ProjectsBlock** (`ProjectsBlock.tsx`)
   - Project grid/list display
   - Configurable limit
   - Description and tags toggle
   - Multiple layout options

5. **FormBlock** (`FormBlock.tsx`)
   - Contact/newsletter/custom forms
   - Configurable fields
   - Two-column layout option
   - Success message handling

6. **ImageBlock** (`ImageBlock.tsx`)
   - Single image display
   - Optional link
   - Alignment controls
   - Rounded corners and shadow options

7. **VideoBlock** (`VideoBlock.tsx`)
   - YouTube/Vimeo/direct video support
   - Aspect ratio controls
   - Autoplay, loop, mute options
   - Thumbnail support

## Usage

### Basic Editor Setup

```tsx
import { BlockEditor } from '@/components/portfolio/editor/BlockEditor';
import { PortfolioService } from '@/lib/services/portfolio';

function PageEditor({ pageId }: { pageId: string }) {
  const [blocks, setBlocks] = useState<PortfolioBlock[]>([]);
  const portfolioService = new PortfolioService();

  const handleBlocksChange = async (newBlocks: PortfolioBlock[]) => {
    setBlocks(newBlocks);
    // Update sort_order in database
    for (const block of newBlocks) {
      await portfolioService.updateBlock(block.id, {
        sort_order: block.sort_order,
      });
    }
  };

  const handleBlockUpdate = async (
    blockId: string,
    updates: Partial<PortfolioBlock>
  ) => {
    await portfolioService.updateBlock(blockId, updates);
    // Refresh blocks
    const updated = await portfolioService.getBlocks(pageId);
    setBlocks(updated);
  };

  const handleBlockDelete = async (blockId: string) => {
    await portfolioService.deleteBlock(blockId);
    // Refresh blocks
    const updated = await portfolioService.getBlocks(pageId);
    setBlocks(updated);
  };

  return (
    <BlockEditor
      blocks={blocks}
      onBlocksChange={handleBlocksChange}
      onBlockUpdate={handleBlockUpdate}
      onBlockDelete={handleBlockDelete}
      onBlockAdd={async (blockType, afterBlockId) => {
        const newBlock = await portfolioService.createBlock(pageId, {
          block_type: blockType,
          sort_order: afterBlockId
            ? blocks.findIndex((b) => b.id === afterBlockId) + 1
            : blocks.length,
        });
        // Refresh blocks
        const updated = await portfolioService.getBlocks(pageId);
        setBlocks(updated);
      }}
      isEditing={true}
    />
  );
}
```

### Rendering Blocks (Preview Mode)

```tsx
import { BlockRenderer } from '@/components/portfolio/editor/BlockRenderer';

function PagePreview({ blocks }: { blocks: PortfolioBlock[] }) {
  return (
    <div>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          isEditing={false}
          onUpdate={() => {}}
          onDelete={() => {}}
        />
      ))}
    </div>
  );
}
```

### Creating a New Block Type

1. **Add Schema** (`lib/blocks/schema.ts`):

```typescript
export const customBlockContentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});

export const customBlockSettingsSchema = z.object({
  color: z.string().default('#000000'),
});
```

2. **Add to Registry**:

```typescript
export const blockRegistry: Record<BlockType, BlockMetadata> = {
  // ... existing blocks
  custom: {
    type: 'custom',
    name: 'Custom Block',
    description: 'A custom block type',
    icon: 'CustomIcon',
    category: 'content',
    defaultContent: { title: 'Default Title' },
    defaultSettings: { color: '#000000' },
  },
};
```

3. **Create Component** (`components/portfolio/blocks/CustomBlock.tsx`):

```tsx
import { BaseBlock } from './BaseBlock';

export function CustomBlock({ block, isEditing, onUpdate, onDelete }: BlockProps) {
  const content = block.content as CustomBlockContent;
  const settings = block.settings as CustomBlockSettings;

  return (
    <BaseBlock block={block} isEditing={isEditing} onUpdate={onUpdate} onDelete={onDelete}>
      <div style={{ color: settings.color }}>
        <h2>{content.title}</h2>
        {content.description && <p>{content.description}</p>}
      </div>
    </BaseBlock>
  );
}
```

4. **Add to BlockRenderer**:

```tsx
case 'custom':
  return <CustomBlock {...blockProps} />;
```

## File Structure

```
src/
├── lib/
│   └── blocks/
│       ├── schema.ts          # Block schemas and validation
│       ├── types.ts           # TypeScript type definitions
│       ├── dnd.ts             # Drag-and-drop utilities
│       └── index.ts           # Exports
├── components/
│   └── portfolio/
│       ├── editor/
│       │   ├── BlockEditor.tsx        # Main editor component
│       │   ├── BlockRenderer.tsx      # Block renderer
│       │   └── SortableBlockWrapper.tsx # Drag wrapper
│       └── blocks/
│           ├── BaseBlock.tsx          # Base block wrapper
│           ├── HeroBlock.tsx
│           ├── TextBlock.tsx
│           ├── GalleryBlock.tsx
│           ├── ProjectsBlock.tsx
│           ├── FormBlock.tsx
│           ├── ImageBlock.tsx
│           ├── VideoBlock.tsx
│           └── index.ts               # Exports
```

## Dependencies

- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable list support
- `@dnd-kit/utilities` - Utility functions
- `zod` - Schema validation
- `lucide-react` - Icons
- `next/image` - Optimized images

## Next Steps

- [ ] Block editing dialogs/forms
- [ ] Block library sidebar
- [ ] Undo/redo functionality
- [ ] Block duplication
- [ ] Block templates/presets
- [ ] Advanced block settings panels
- [ ] Block preview mode
- [ ] Block export/import
