export type UserType = 'freelancer' | 'agency' | 'business' | 'creative';
export type PrimaryGoal = 'portfolio' | 'clients' | 'both';
export type OnboardingStepId =
  | 'welcome'
  | 'profile'
  | 'template'
  | 'customize'
  | 'content'
  | 'tour'
  | 'publish';

export interface OnboardingStep {
  id: OnboardingStepId;
  number: number;
  name: {
    en: string;
    et: string;
  };
  description: {
    en: string;
    et: string;
  };
  required: boolean;
  estimatedTime: number; // minutes
  component: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    number: 1,
    name: {
      en: 'Welcome',
      et: 'Tere tulemast',
    },
    description: {
      en: 'Tell us about yourself',
      et: 'Räägi meile endast',
    },
    required: true,
    estimatedTime: 1,
    component: 'WelcomeStep',
  },
  {
    id: 'profile',
    number: 2,
    name: {
      en: 'Profile',
      et: 'Profiil',
    },
    description: {
      en: 'Set up your profile',
      et: 'Seadista oma profiil',
    },
    required: false,
    estimatedTime: 1,
    component: 'ProfileStep',
  },
  {
    id: 'template',
    number: 3,
    name: {
      en: 'Template',
      et: 'Mall',
    },
    description: {
      en: 'Choose your starting point',
      et: 'Vali oma lähtepunkt',
    },
    required: false,
    estimatedTime: 1,
    component: 'TemplateStep',
  },
  {
    id: 'customize',
    number: 4,
    name: {
      en: 'Customize',
      et: 'Kohanda',
    },
    description: {
      en: 'Make it yours',
      et: 'Tee see omaks',
    },
    required: false,
    estimatedTime: 1,
    component: 'CustomizeStep',
  },
  {
    id: 'content',
    number: 5,
    name: {
      en: 'Content',
      et: 'Sisu',
    },
    description: {
      en: 'Add your first content',
      et: 'Lisa oma esimene sisu',
    },
    required: false,
    estimatedTime: 2,
    component: 'ContentStep',
  },
  {
    id: 'tour',
    number: 6,
    name: {
      en: 'Tour',
      et: 'Tutvustus',
    },
    description: {
      en: 'Discover features',
      et: 'Avasta funktsioone',
    },
    required: false,
    estimatedTime: 2,
    component: 'TourStep',
  },
  {
    id: 'publish',
    number: 7,
    name: {
      en: 'Publish',
      et: 'Avalda',
    },
    description: {
      en: 'Go live!',
      et: 'Mine live!',
    },
    required: false,
    estimatedTime: 1,
    component: 'PublishStep',
  },
] as const;

export interface TourHighlight {
  id: string;
  target: string; // CSS selector or data attribute
  title: {
    en: string;
    et: string;
  };
  description: {
    en: string;
    et: string;
  };
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_HIGHLIGHTS: TourHighlight[] = [
  {
    id: 'editor',
    target: '[data-tour="portfolio-editor"]',
    title: {
      en: 'Portfolio Editor',
      et: 'Portfoolio redaktor',
    },
    description: {
      en: 'Drag and drop blocks to build beautiful pages. No coding required.',
      et: 'Lohista plokke, et ehitada ilusaid lehti. Koodi pole vaja.',
    },
    position: 'right',
  },
];
