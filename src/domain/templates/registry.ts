import { TemplateId } from './types';
import { TemplateDefinition, TemplateRegistry } from './contracts';

export const templates: TemplateRegistry = {
    minimal: {
        id: 'minimal',
        name: 'Minimal',
        description: 'Puhas ja minimalistlik disain, mis keskendub olulisele.',
        templateVersion: 1,
        defaultLocale: 'et',
        defaultSections: [
            {
                id: 'hero-1',
                type: 'hero',
                enabled: true,
                content: {
                    headline: {
                        et: 'Tere, olen vabakutseline loovjuht',
                        en: 'Hi, I am a freelance creative director'
                    },
                    subheadline: {
                        et: 'Aitan brändidel leida oma häält läbi minimalistliku disaini.',
                        en: 'Helping brands find their voice through minimalist design.'
                    },
                    ctaLabel: {
                        et: 'Vaata töid',
                        en: 'View Work'
                    },
                    ctaHref: '#projects'
                }
            },
            {
                id: 'about-1',
                type: 'about',
                enabled: true,
                content: {
                    heading: {
                        et: 'Minust',
                        en: 'About Me'
                    },
                    body: {
                        et: 'Olen üle 10 aasta tegelenud digitaalse disaini ja strateegiaga.',
                        en: 'I have been working in digital design and strategy for over 10 years.'
                    }
                }
            },
            {
                id: 'projects-1',
                type: 'projects',
                enabled: true,
                content: {
                    heading: {
                        et: 'Valitud tööd',
                        en: 'Selected Work'
                    },
                    items: [
                        {
                            id: 'p1',
                            title: { et: 'Brändi Identiteet', en: 'Brand Identity' },
                            description: { et: 'Terviklik visuaalne keel.', en: 'Comprehensive visual language.' }
                        },
                        {
                            id: 'p2',
                            title: { et: 'Veebidisain', en: 'Web Design' },
                            description: { et: 'Kaasaegsed kasutajakogemused.', en: 'Modern user experiences.' }
                        }
                    ]
                }
            },
            {
                id: 'contact-1',
                type: 'contact',
                enabled: true,
                content: {
                    heading: { et: 'Võta ühendust', en: 'Get in Touch' },
                    email: 'tere@minuportfoolio.ee',
                    formEnabled: true
                }
            }
        ]
    },
    clean: {
        id: 'clean',
        name: 'Clean',
        description: 'Õhuline ja moderne disain portfoolio esitlemiseks.',
        templateVersion: 1,
        defaultLocale: 'et',
        defaultSections: [
            {
                id: 'hero-1',
                type: 'hero',
                enabled: true,
                content: {
                    headline: {
                        et: 'Selge visioon. Puhas teostus.',
                        en: 'Clear vision. Clean execution.'
                    },
                    subheadline: {
                        et: 'Loon digitaalseid lahendusi, mis on korraga ilusad ja funktsionaalsed.',
                        en: 'I create digital solutions that are both beautiful and functional.'
                    }
                }
            },
            {
                id: 'about-1',
                type: 'about',
                enabled: true,
                content: {
                    body: {
                        et: 'Minu kireks on detailid ja kasutajamugavus.',
                        en: 'My passion is details and user convenience.'
                    }
                }
            },
            {
                id: 'projects-1',
                type: 'projects',
                enabled: true,
                content: {
                    items: [
                        {
                            id: 'p1',
                            title: { et: 'Tootedisain', en: 'Product Design' },
                            description: { et: 'Kasutajakeskne lähenemine.', en: 'User-centered approach.' }
                        },
                        {
                            id: 'p2',
                            title: { et: 'Mobiilirakendused', en: 'Mobile Apps' },
                            description: { et: 'Intuitiivsed liidesed.', en: 'Intuitive interfaces.' }
                        }
                    ]
                }
            },
            {
                id: 'contact-1',
                type: 'contact',
                enabled: true,
                content: {
                    email: 'kontakt@puasdisain.ee'
                }
            }
        ]
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        description: 'Struktureeritud ja professionaalne valik kogenud spetsialistile.',
        templateVersion: 1,
        defaultLocale: 'et',
        defaultSections: [
            {
                id: 'hero-1',
                type: 'hero',
                enabled: true,
                content: {
                    headline: {
                        et: 'Strateegiline ekspert portfoolio',
                        en: 'Strategic expert portfolio'
                    },
                    subheadline: {
                        et: 'Aitan ettevõtetel saavutada oma eesmärke läbi andmepõhise disaini.',
                        en: 'Helping companies achieve their goals through data-driven design.'
                    }
                }
            },
            {
                id: 'about-1',
                type: 'about',
                enabled: true,
                content: {
                    heading: { et: 'Kogemusest', en: 'Experience' },
                    body: {
                        et: 'Olen nõustanud mitmeid rahvusvahelisi ettevõtteid nende digikasvus.',
                        en: 'I have advised several international companies on their digital growth.'
                    }
                }
            },
            {
                id: 'services-1',
                type: 'services',
                enabled: true,
                content: {
                    heading: { et: 'Teenused', en: 'Services' },
                    items: [
                        {
                            id: 's1',
                            title: { et: 'Konsultatsioon', en: 'Consultation' },
                            description: { et: 'Strateegiline nõustamine ja analüüs.', en: 'Strategic consulting and analysis.' }
                        },
                        {
                            id: 's2',
                            title: { et: 'Koolitus', en: 'Training' },
                            description: { et: 'Meeskondade võimestamine ja töötoad.', en: 'Team empowerment and workshops.' }
                        }
                    ]
                }
            },
            {
                id: 'projects-1',
                type: 'projects',
                enabled: true,
                content: {
                    heading: { et: 'Tehtud tööd', en: 'Past Projects' },
                    items: [
                        {
                            id: 'p1',
                            title: { et: 'Strateegia audit', en: 'Strategy Audit' },
                            description: { et: 'Põhjalik analüüs ja soovitused.', en: 'In-depth analysis and recommendations.' }
                        },
                        {
                            id: 'p2',
                            title: { et: 'Kasvustrateegia', en: 'Growth Strategy' },
                            description: { et: 'Skaalautuv lahendus turule sisenemiseks.', en: 'Scalable solution for market entry.' }
                        }
                    ]
                }
            },
            {
                id: 'contact-1',
                type: 'contact',
                enabled: true,
                content: {
                    email: 'info@ekspert.ee',
                    location: { et: 'Tallinn, Eesti', en: 'Tallinn, Estonia' }
                }
            }
        ]
    }
};

export const listTemplates = (): TemplateDefinition[] => Object.values(templates);

export const getTemplate = (id: TemplateId): TemplateDefinition => templates[id];

export function createDefaultConfig(templateId: TemplateId): any {
    const template = getTemplate(templateId);
    if (!template) return null;

    return {
        templateId: template.id,
        siteTitle: template.name,
        bio: '',
        theme: {
            fonts: {
                headingFont: 'Inter',
                bodyFont: 'Inter',
                monoFont: 'JetBrains Mono',
                baseSize: 16,
                scale: 1.25,
            },
            palette: {
                primary: '#000000',
                secondary: '#ffffff',
                background: '#ffffff',
                text: '#000000',
                accent: '#7c3aed',
            },
        },
        sections: {
            order: template.defaultSections.map(s => s.id),
            visibility: Object.fromEntries(
                template.defaultSections.map(s => [s.id, true])
            ),
            content: Object.fromEntries(
                template.defaultSections.map(s => [s.type, s.content])
            ),
        },
    };
}
