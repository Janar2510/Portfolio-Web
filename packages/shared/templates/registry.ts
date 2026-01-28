import { TemplateId, TemplateDefinition, TemplateConfig } from './types';

const TEMPLATES: TemplateDefinition[] = [
    {
        id: 'editorial-minimal',
        name: 'Editorial Minimal',
        description: 'Clean, typography-focused layout for thinkers and writers.',
        previewImage: '/templates/editorial-minimal.png',
        allowedSections: ['hero', 'about', 'projects', 'contact'],
    },
    {
        id: 'playful-pop',
        name: 'Playful Pop',
        description: 'Bold colors and dynamic shapes for creative explorers.',
        previewImage: '/templates/playful-pop.png',
        allowedSections: ['hero', 'projects', 'contact'],
    },
];

const DEFAULT_CONFIGS: Record<TemplateId, TemplateConfig> = {
    'editorial-minimal': {
        siteTitle: 'My Portfolio',
        theme: {
            palette: {
                primary: '#1a1a1a',
                background: '#ffffff',
                text: '#1a1a1a',
                accent: '#c0c0c0',
            },
            fonts: {
                headingFont: 'Playfair Display',
                bodyFont: 'Inter',
            },
        },
        sections: {
            order: ['hero', 'about', 'projects'],
            content: {
                hero: {
                    hero: {
                        headline: 'Thinker & Creator',
                        subtitle: 'Crafting digital experiences with precision.',
                    },
                },
                about: {
                    about: {
                        bio: 'I am a designer focused on creating minimalist digital solutions that solve complex problems.',
                    },
                },
                projects: {
                    projects: {
                        title: 'Selected Works',
                        items: [
                            { id: '1', title: 'Project One', description: 'A brief overview of the first project.' },
                            { id: '2', title: 'Project Two', description: 'A brief overview of the second project.' },
                        ],
                    },
                },
            },
            visibility: {
                hero: true,
                about: true,
                projects: true,
            },
        },
        assets: {
            avatar: '',
            logo: '',
        },
    },
    'playful-pop': {
        siteTitle: 'Hello World',
        theme: {
            palette: {
                primary: '#ff4d4d',
                background: '#fff9f9',
                text: '#2a2a2a',
                accent: '#ffdada',
            },
            fonts: {
                headingFont: 'Outfit',
                bodyFont: 'Plus Jakarta Sans',
            },
        },
        sections: {
            order: ['hero', 'projects'],
            content: {
                hero: {
                    hero: {
                        headline: 'Let\'s Play!',
                        subtitle: 'Bright ideas for bright people.',
                    },
                },
                projects: {
                    projects: {
                        title: 'Experiments',
                        items: [
                            { id: '1', title: 'Pop Art', description: 'Vibrant colors and bold lines.' },
                        ],
                    },
                },
            },
            visibility: {
                hero: true,
                projects: true,
            },
        },
        assets: {
            avatar: '',
            logo: '',
        },
    },
};

export function listTemplates(): TemplateDefinition[] {
    return TEMPLATES;
}

export function getTemplate(id: TemplateId): TemplateDefinition | undefined {
    return TEMPLATES.find(t => t.id === id);
}

export function defaultConfig(id: TemplateId): TemplateConfig {
    const config = DEFAULT_CONFIGS[id];
    if (!config) {
        throw new Error(`No default config found for template: ${id}`);
    }
    // Return a deep clone to prevent accidental mutations of constants
    return JSON.parse(JSON.stringify(config));
}
