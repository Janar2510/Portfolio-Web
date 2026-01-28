import {
  Sparkles,
  FileText,
  Images,
  Briefcase,
  Mail,
  Image,
  Video,
  LayoutTemplate,
  List,
  Waves,
  Package,
  Terminal,
  BarChart,
  type LucideIcon,
} from 'lucide-react';
import type { BlockType } from './schema';

export const iconMap: Record<BlockType, LucideIcon> = {
  hero: Sparkles,
  text: FileText,
  gallery: Images,
  projects: Briefcase,
  form: Mail,
  image: Image,
  video: Video,
  header: LayoutTemplate,
  footer: LayoutTemplate,
  features: List,
  'infinite-hero': Waves,
  'brand-hero': Package,
  'organic-hero': Waves,
  skills: Terminal,
  stats: BarChart,
};

export function getIcon(blockType: BlockType): LucideIcon {
  return iconMap[blockType] || FileText;
}
