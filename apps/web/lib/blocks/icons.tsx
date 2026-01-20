import {
  Sparkles,
  FileText,
  Images,
  Briefcase,
  Mail,
  Image,
  Video,
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
};

export function getIcon(blockType: BlockType): LucideIcon {
  return iconMap[blockType] || FileText;
}
