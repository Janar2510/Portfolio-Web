/**
 * Block Type Definitions
 * TypeScript types for block system
 */

import type { PortfolioBlock } from '@/domain/builder/portfolio';
import type {
  BlockType,
  HeroBlockContent,
  HeroBlockSettings,
  TextBlockContent,
  TextBlockSettings,
  GalleryBlockContent,
  GalleryBlockSettings,
  ProjectsBlockContent,
  ProjectsBlockSettings,
  FormBlockContent,
  FormBlockSettings,
  ImageBlockContent,
  ImageBlockSettings,
  VideoBlockContent,
  VideoBlockSettings,
  FeaturesBlockContent,
  FeaturesBlockSettings,
  InfiniteHeroBlockContent,
  InfiniteHeroBlockSettings,
  BrandHeroBlockContent,
  BrandHeroBlockSettings,
  OrganicHeroBlockContent,
  OrganicHeroBlockSettings,
  SkillsBlockContent,
  SkillsBlockSettings,
  StatsBlockContent,
  StatsBlockSettings,
} from './schema';

// Typed block interfaces
export interface TypedBlock<T extends BlockType = BlockType> {
  id: string;
  page_id: string;
  block_type: T;
  content: BlockContentMap[T];
  settings: BlockSettingsMap[T];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Content type map
export interface BlockContentMap {
  hero: HeroBlockContent;
  text: TextBlockContent;
  gallery: GalleryBlockContent;
  projects: ProjectsBlockContent;
  form: FormBlockContent;
  image: ImageBlockContent;
  video: VideoBlockContent;
  features: FeaturesBlockContent;
  'infinite-hero': InfiniteHeroBlockContent;
  'brand-hero': BrandHeroBlockContent;
  'organic-hero': OrganicHeroBlockContent;
  skills: SkillsBlockContent;
  stats: StatsBlockContent;
  header: any;
  footer: any;
}

// Settings type map
export interface BlockSettingsMap {
  hero: HeroBlockSettings;
  text: TextBlockSettings;
  gallery: GalleryBlockSettings;
  projects: ProjectsBlockSettings;
  form: FormBlockSettings;
  image: ImageBlockSettings;
  video: VideoBlockSettings;
  features: FeaturesBlockSettings;
  'infinite-hero': InfiniteHeroBlockSettings;
  'brand-hero': BrandHeroBlockSettings;
  'organic-hero': OrganicHeroBlockSettings;
  skills: SkillsBlockSettings;
  stats: StatsBlockSettings;
  header: any;
  footer: any;
}

// Helper to convert PortfolioBlock to TypedBlock
export function toTypedBlock<T extends BlockType>(
  block: PortfolioBlock,
  type: T
): TypedBlock<T> {
  return {
    ...block,
    block_type: type,
    content: block.content as BlockContentMap[T],
    settings: block.settings as BlockSettingsMap[T],
  } as TypedBlock<T>;
}

// Block update payload
export interface BlockUpdatePayload<T extends BlockType = BlockType> {
  content?: Partial<BlockContentMap[T]>;
  settings?: Partial<BlockSettingsMap[T]>;
  sort_order?: number;
}

// Block creation payload
export interface BlockCreatePayload<T extends BlockType = BlockType> {
  block_type: T;
  content?: Partial<BlockContentMap[T]>;
  settings?: Partial<BlockSettingsMap[T]>;
  sort_order?: number;
}
