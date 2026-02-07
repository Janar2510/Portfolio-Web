import type { WizardStep } from '@/stores/portfolio/editor-store';

export interface EditorWizardStep {
  id: WizardStep;
  title: string;
  description: string;
}

export const EDITOR_WIZARD_STEPS: EditorWizardStep[] = [
  {
    id: 'template',
    title: 'Template',
    description: 'Pick a full website template to start.',
  },
  {
    id: 'content',
    title: 'Content',
    description: 'Add your headline, bio, and key text.',
  },
  {
    id: 'media',
    title: 'Images',
    description: 'Upload logo, hero image, and portfolio visuals.',
  },
  {
    id: 'theme',
    title: 'Theme',
    description: 'Choose colors and fonts.',
  },
  {
    id: 'contact',
    title: 'Contact & SEO',
    description: 'Set your contact info and SEO text.',
  },
  {
    id: 'publish',
    title: 'Publish',
    description: 'Preview and deploy your site.',
  },
];
