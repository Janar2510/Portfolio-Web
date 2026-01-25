/**
 * Block Registry System
 * Central registry for all block types with their schemas, components, and metadata
 */

import { z } from 'zod';
import type { ComponentType } from 'react';
import type { PortfolioBlock } from '@/lib/portfolio/types';

// ===========================================
// BLOCK TYPE DEFINITIONS
// ===========================================

export type BlockType =
  // Layout
  | 'hero'
  | 'split-hero'
  | 'cyber-hero'
  | 'organic-hero'
  | 'section'
  | 'columns'
  | 'container'
  | 'divider'
  | 'spacer'
  | 'shape'
  | 'frame'
  | 'header'
  | 'footer'
  // Content
  | 'text'
  | 'heading'
  | 'quote'
  | 'list'
  | 'code'
  | 'table'
  // Media
  | 'image'
  | 'gallery'
  | 'video'
  | 'carousel'
  | 'logo-cloud'
  | 'embed'
  // Interactive
  | 'contact-form'
  | 'newsletter'
  | 'social-links'
  | 'map'
  | 'testimonials'
  | 'faq'
  | 'pricing'
  // Portfolio-specific
  | 'project-grid'
  | 'project-detail'
  | 'skills'
  | 'services'
  | 'experience'
  | 'education'
  | 'clients'
  | 'stats'
  | 'awards';

export type BlockCategory =
  | 'layout'
  | 'content'
  | 'media'
  | 'interactive'
  | 'portfolio';

// ===========================================
// BLOCK METADATA
// ===========================================

export interface BlockMetadata {
  type: BlockType;
  name: string;
  nameKey?: string; // i18n key
  description: string;
  descriptionKey?: string; // i18n key
  icon: ComponentType<{ className?: string }> | string;
  category: BlockCategory;
  schema: z.ZodSchema;
  defaultContent: Record<string, unknown>;
  defaultSettings: Record<string, unknown>;
  variants?: BlockVariant[];
  isPremium?: boolean;
  isExperimental?: boolean;
}

export interface BlockVariant {
  id: string;
  name: string;
  thumbnail?: string;
  content?: Partial<Record<string, unknown>>;
  settings?: Partial<Record<string, unknown>>;
}

// ===========================================
// BLOCK COMPONENT INTERFACES
// ===========================================

export interface BlockEditProps {
  block: PortfolioBlock;
  onChange: (
    content: Record<string, unknown>,
    settings?: Record<string, unknown>
  ) => void;
  onDelete?: () => void;
  isSelected?: boolean;
}

export interface BlockViewProps {
  block: PortfolioBlock;
  styles?: Record<string, unknown>;
  isPreview?: boolean;
}

export interface BlockSettingsProps {
  block: PortfolioBlock;
  onChange: (settings: Record<string, unknown>) => void;
}

// ===========================================
// BLOCK REGISTRY INTERFACE
// ===========================================

export interface BlockRegistryEntry {
  metadata: BlockMetadata;
  EditComponent?: ComponentType<BlockEditProps>;
  ViewComponent: ComponentType<BlockViewProps>;
  SettingsPanel?: ComponentType<BlockSettingsProps>;
}

// ===========================================
// BLOCK REGISTRY
// ===========================================

class BlockRegistry {
  private blocks: Map<BlockType, BlockRegistryEntry> = new Map();

  /**
   * Register a block type
   */
  register(entry: BlockRegistryEntry): void {
    this.blocks.set(entry.metadata.type, entry);
  }

  /**
   * Get a block entry by type
   */
  get(type: BlockType): BlockRegistryEntry | undefined {
    return this.blocks.get(type);
  }

  /**
   * Get all registered blocks
   */
  getAll(): BlockRegistryEntry[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Get blocks by category
   */
  getByCategory(category: BlockCategory): BlockRegistryEntry[] {
    return Array.from(this.blocks.values()).filter(
      entry => entry.metadata.category === category
    );
  }

  /**
   * Check if a block type is registered
   */
  has(type: BlockType): boolean {
    return this.blocks.has(type);
  }

  /**
   * Get all block types
   */
  getTypes(): BlockType[] {
    return Array.from(this.blocks.keys());
  }

  /**
   * Validate block content against schema
   */
  validate(
    type: BlockType,
    content: unknown
  ): { success: boolean; error?: z.ZodError } {
    const entry = this.get(type);
    if (!entry) {
      return { success: false, error: new z.ZodError([]) };
    }

    const result = entry.metadata.schema.safeParse(content);
    if (result.success) {
      return { success: true };
    }

    return { success: false, error: result.error };
  }

  /**
   * Get default content for a block type
   */
  getDefaultContent(type: BlockType): Record<string, unknown> {
    const entry = this.get(type);
    return entry?.metadata.defaultContent || {};
  }

  /**
   * Get default settings for a block type
   */
  getDefaultSettings(type: BlockType): Record<string, unknown> {
    const entry = this.get(type);
    return entry?.metadata.defaultSettings || {};
  }
}

// ===========================================
// GLOBAL REGISTRY INSTANCE
// ===========================================

export const blockRegistry = new BlockRegistry();

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Register a block with the registry
 */
export function registerBlock(entry: BlockRegistryEntry): void {
  blockRegistry.register(entry);
}

/**
 * Create a block with default content and settings
 */
export function createBlock(
  type: BlockType,
  overrides?: {
    content?: Partial<Record<string, unknown>>;
    settings?: Partial<Record<string, unknown>>;
    layout?: Partial<Record<string, unknown>>;
  }
): Omit<PortfolioBlock, 'id' | 'page_id' | 'created_at' | 'updated_at'> {
  const defaultContent = blockRegistry.getDefaultContent(type);
  const defaultSettings = blockRegistry.getDefaultSettings(type);

  return {
    block_type: type,
    content: { ...defaultContent, ...overrides?.content },
    settings: { ...defaultSettings, ...overrides?.settings },
    styles: {},
    layout: {
      width: 'container',
      padding: 'default',
      margin: 'default',
      background: null,
      alignment: 'left',
      ...overrides?.layout,
    },
    is_visible: true,
    visible_on: {
      desktop: true,
      tablet: true,
      mobile: true,
    },
    animation: {
      type: null,
      delay: 0,
      duration: 'normal',
    },
    variant: null,
    is_locked: false,
    sort_order: 0,
  };
}

/**
 * Validate a block's content
 */
export function validateBlock(block: PortfolioBlock): {
  valid: boolean;
  errors?: z.ZodError;
} {
  const result = blockRegistry.validate(
    block.block_type as BlockType,
    block.content
  );
  return {
    valid: result.success,
    errors: result.error,
  };
}
