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
                id: 'header-1',
                type: 'header',
                enabled: true,
                content: {
                    logoText: 'Minimal',
                    navLinks: [
                        { label: { et: 'Tööd', en: 'Work' }, href: '#projects' },
                        { label: { et: 'Minust', en: 'About' }, href: '#about' },
                        { label: { et: 'Kontakt', en: 'Contact' }, href: '#contact' }
                    ]
                }
            },
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
            },
            {
                id: 'footer-1',
                type: 'footer',
                enabled: true,
                content: {
                    text: { et: '© 2024 Minimal Portfoolio', en: '© 2024 Minimal Portfolio' },
                    socials: []
                }
            }
        ],
        theme: {
            palette: {
                primary: '#000000',
                secondary: '#666666',
                background: '#ffffff',
                text: '#000000',
                accent: '#000000',
            }
        }
    },
    clean: {
        id: 'clean',
        name: 'Clean',
        description: 'Õhuline ja moderne disain portfoolio esitlemiseks.',
        templateVersion: 1,
        defaultLocale: 'et',
        defaultSections: [
            {
                id: 'header-1',
                type: 'header',
                enabled: true,
                content: {
                    logoText: 'Clean',
                    navLinks: [
                        { label: { et: 'Avaleht', en: 'Home' }, href: '#hero' },
                        { label: { et: 'Teenused', en: 'Services' }, href: '#services' },
                        { label: { et: 'Kontakt', en: 'Contact' }, href: '#contact' }
                    ]
                }
            },
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
            },
            {
                id: 'footer-1',
                type: 'footer',
                enabled: true,
                content: {
                    text: { et: '© 2024 Clean Design', en: '© 2024 Clean Design' },
                    socials: [
                        { platform: 'instagram', url: '#' },
                        { platform: 'twitter', url: '#' }
                    ]
                }
            }
        ],
        theme: {
            palette: {
                primary: '#1a1a1a',
                secondary: '#4a4a4a',
                background: '#ffffff',
                text: '#1a1a1a',
                accent: '#3b82f6',
            }
        }
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        description: 'Struktureeritud ja professionaalne valik kogenud spetsialistile.',
        templateVersion: 1,
        defaultLocale: 'et',
        defaultSections: [
            {
                id: 'header-1',
                type: 'header',
                enabled: true,
                content: {
                    logoText: 'Expert',
                    navLinks: [
                        { label: { et: 'Ekspertiis', en: 'Expertise' }, href: '#about' },
                        { label: { et: 'Teenused', en: 'Services' }, href: '#services' },
                        { label: { et: 'Kliendid', en: 'Clients' }, href: '#projects' },
                        { label: { et: 'Kontakt', en: 'Contact' }, href: '#contact' }
                    ]
                }
            },
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
            },
            {
                id: 'footer-1',
                type: 'footer',
                enabled: true,
                content: {
                    text: { et: '© 2024 Professional. Kõik õigused kaitstud.', en: '© 2024 Professional. All rights reserved.' },
                    socials: [
                        { platform: 'linkedin', url: '#' },
                        { platform: 'twitter', url: '#' }
                    ]
                }
            }
        ],
        theme: {
            palette: {
                primary: '#1e3a8a',
                secondary: '#3b82f6',
                background: '#ffffff',
                text: '#111827',
                accent: '#3b82f6',
            }
        }
    },
    'neon-noir': {
        id: 'neon-noir',
        name: 'Neon Noir',
        description: 'Cyberpunk inspired portfolio with dark mode and neon entry animations.',
        templateVersion: 1,
        defaultLocale: 'en',
        defaultSections: [
            {
                id: 'header',
                type: 'header',
                enabled: true,
                content: {
                    logoText: 'CYBER',
                    navLinks: [
                        { label: { en: 'Home', et: 'Avaleht' }, href: '#hero' },
                        { label: { en: 'Work', et: 'Tööd' }, href: '#projects' }
                    ]
                }
            },
            {
                id: 'hero',
                type: 'hero',
                enabled: true,
                content: {
                    headline: { en: 'CYBER\nCREATIVE', et: 'KÜBER\nLOOVUS' },
                    subheadline: { en: 'Designing the digital frontier.', et: 'Disainides digitaalset tulevikku.' },
                    ctaLabel: { en: 'Enter System', et: 'Sisene süsteemi' },
                    ctaHref: '#projects'
                }
            },
            {
                id: 'marquee',
                type: 'marquee',
                enabled: true,
                content: {
                    items: [
                        { en: 'UI/UX DESIGN', et: 'UI/UX DISAIN' },
                        { en: 'FULL STACK', et: 'TÄISLAHENDUS' },
                        { en: 'CYBERSECURITY', et: 'KÜBERTURVALISUS' }
                    ]
                },
                settings: {
                    speed: 'fast',
                    background: 'black',
                    gap: 'large'
                }
            },
            {
                id: 'projects',
                type: 'projects',
                enabled: true,
                content: {
                    heading: { en: 'System Logs', et: 'Süsteemi logid' },
                    items: []
                }
            },
            {
                id: 'contact',
                type: 'footer',
                enabled: true,
                content: { text: { en: 'SYSTEM OFFLINE', et: 'SÜSTEEM VÄLJAS' } }
            }
        ],
        theme: {
            palette: {
                primary: '#00ffcc',
                secondary: '#ff00ff',
                background: '#050505',
                text: '#ffffff',
                accent: '#00ffcc',
                surface: '#111111',
            }
        }
    },
    'swiss-style': {
        id: 'swiss-style',
        name: 'Swiss Style',
        description: 'Clean, grid-based layout focusing on typography and whitespace.',
        templateVersion: 1,
        defaultLocale: 'en',
        defaultSections: [
            {
                id: 'hero',
                type: 'hero',
                enabled: true,
                content: {
                    headline: { en: 'Helvetica.\nGrid.\nDesign.', et: 'Helvetica.\nRuudustik.\nDisain.' },
                    subheadline: { en: 'Form follows function.', et: 'Vorm järgib funktsiooni.' },
                }
            },
            {
                id: 'marquee',
                type: 'marquee',
                enabled: true,
                content: {
                    items: [
                        { en: 'T Y P O G R A P H Y', et: 'T Ü P O G R A A F I A' },
                        { en: 'G R I D', et: 'R U U D U S T I K' },
                        { en: 'C O L O R', et: 'V Ä R V' }
                    ]
                },
                settings: {
                    speed: 'slow',
                    background: 'transparent',
                    gap: 'large'
                }
            },
            {
                id: 'gallery',
                type: 'gallery',
                enabled: true,
                content: {
                    heading: { en: 'Collection 2024', et: 'Kollektsioon 2024' },
                    items: []
                }
            },
            {
                id: 'footer',
                type: 'footer',
                enabled: true,
                content: { text: { en: '© 2024 Studio Swiss', et: '© 2024 Studio Swiss' } }
            }
        ],
        theme: {
            palette: {
                primary: '#D4B483', // Sand & Silk Accent
                secondary: '#FFFFFF', // Soft Highlight
                background: '#F9F5F0', // Main Background
                text: '#483C32', // Deep Contrast
                accent: '#D4B483',
                surface: '#EFE6D5', // Section/Card BG
            }
        }
    },
    'editorial': {
        id: 'editorial',
        name: 'Editorial',
        description: 'Premium magazine-style portfolio featuring the high-contrast Oceanic Abyss palette and cinematic imagery.',
        templateVersion: 1,
        defaultLocale: 'en',
        defaultSections: [
            {
                id: 'header',
                type: 'header',
                enabled: true,
                content: {
                    logoText: 'EDITORIAL',
                    navLinks: [
                        { label: { en: 'Journal', et: 'Žurnaal' }, href: '#projects' },
                        { label: { en: 'Perspective', et: 'Perspektiiv' }, href: '#about' },
                        { label: { en: 'Archive', et: 'Arhiiv' }, href: '#gallery' }
                    ]
                }
            },
            {
                id: 'hero',
                type: 'hero',
                enabled: true,
                content: {
                    headline: { en: 'OCEANIC\nABYSS', et: 'OOKEANI\nSÜVIK' },
                    subheadline: { en: 'A dialogue between light and depth. Minimalist aesthetics for the modern visionary.', et: 'Dialoog valguse ja sügavuse vahel. Minimalistlik esteetika kaasaegsele visionäärile.' },
                    ctaLabel: { en: 'Explore Archive', et: 'Avasta arhiiv' },
                    backgroundImage: '/templates/editorial/hero-bg.png'
                }
            },
            {
                id: 'about',
                type: 'about',
                enabled: true,
                content: {
                    heading: { en: 'The Vision', et: 'Visioon' },
                    body: {
                        en: 'Designing at the intersection of cinematic atmosphere and functional clarity. The Editorial suite is built for storytellers who demand depth in every pixel.',
                        et: 'Disainides kinematograafilise atmosfääri ja funktsionaalse selguse piiril. Editorial komplekt on loodud jutuvestjatele, kes nõuavad sügavust igas pikslis.'
                    }
                }
            },
            {
                id: 'projects',
                type: 'projects',
                enabled: true,
                content: {
                    heading: { en: 'Selected Works', et: 'Valitud tööd' },
                    items: [
                        {
                            id: 'p1',
                            title: { en: 'Bioluminescence', et: 'Bioluminestsents' },
                            description: { en: 'Visual research on glowing ecosystems.', et: 'Visuaalne uurimistöö hiilgavatest ökosüsteemidest.' },
                            image: { src: '/templates/editorial/gallery-1.png', alt: { en: 'Teal Ink', et: 'Teal Tint' } }
                        },
                        {
                            id: 'p2',
                            title: { en: 'Obsidian Structure', et: 'Obsidiaan struktuur' },
                            description: { en: 'Architectural shadows in brutalist environments.', et: 'Arhitektuursed varjud brutalistlikes keskkondades.' },
                            image: { src: '/templates/editorial/gallery-2.png', alt: { en: 'Architecture', et: 'Arhitektuur' } }
                        }
                    ]
                }
            },
            {
                id: 'gallery',
                type: 'gallery',
                enabled: true,
                content: {
                    heading: { en: 'Visual Archive', et: 'Visuaalne arhiiv' },
                    items: [
                        { id: 'g1', image: { src: '/templates/editorial/gallery-1.png', alt: { en: 'Oceanic Glow', et: 'Ookeani kumma' } } },
                        { id: 'g2', image: { src: '/templates/editorial/gallery-2.png', alt: { en: 'Architectural Shadows', et: 'Arhitektuursed varjud' } } },
                        { id: 'g3', image: { src: '/templates/editorial/hero-bg.png', alt: { en: 'Bioluminescent Coast', et: 'Bioluminestsents rannik' } } }
                    ]
                }
            },
            {
                id: 'footer',
                type: 'footer',
                enabled: true,
                content: {
                    text: { en: 'ESTABLISHED IN THE DEPTHS // © 2024', et: 'LOODUD SÜGAVUTES // © 2024' },
                    socials: [
                        { platform: 'instagram', url: '#' },
                        { platform: 'linkedin', url: '#' }
                    ]
                }
            }
        ],
        theme: {
            palette: {
                background: '#020B0D',
                surface: '#002B36',
                primary: '#48E5E5',
                secondary: '#1CB2B2',
                text: '#FFFFFF',
                accent: '#48E5E5',
            },
            fonts: {
                headingFont: 'Playfair Display',
                bodyFont: 'Inter'
            },
            buttons: {
                radius: '0px',
                style: 'solid',
                uppercase: true
            }
        }
    },
    'saas-modern': {
        id: 'saas-modern',
        name: 'SaaS Modern',
        description: 'High-conversion landing page for software products.',
        templateVersion: 1,
        defaultLocale: 'en',
        defaultSections: [
            {
                id: 'header',
                type: 'header',
                enabled: true,
                content: {
                    logoText: 'SUPALE',
                    navLinks: [
                        { label: { en: 'Features', et: 'Funktsioonid' }, href: '#features' },
                        { label: { en: 'Work', et: 'Tehtud tööd' }, href: '#work' },
                    ]
                }
            },
            {
                id: 'hero',
                type: 'hero',
                enabled: true,
                content: {
                    headline: { en: 'Scale Your Business Faster', et: 'Kasvata oma äri kiiremini' },
                    subheadline: { en: 'The all-in-one platform for growth.', et: 'Kõik-ühes platvorm kasvuks.' },
                    ctaLabel: { en: 'Start Free Trial', et: 'Alusta tasuta prooviperioodi' },
                    ctaHref: '/signup'
                }
            },
            {
                id: 'features',
                type: 'features',
                enabled: true,
                content: {
                    heading: { en: 'Powerful Features', et: 'Võimsad funktsioonid' },
                    title: { en: 'Everything you need to succeed.', et: 'Kõik, mida vajad eduks.' },
                    items: [
                        { title: { en: 'Analytics', et: 'Analüütika' }, description: { en: 'Real-time data insights.', et: 'Reaalajas andmed.' }, icon: 'TrendingUp' },
                        { title: { en: 'Security', et: 'Turvalisus' }, description: { en: 'Bank-grade encryption.', et: 'Pangatasemel krüpteering.' }, icon: 'Shield' },
                        { title: { en: 'Global', et: 'Globaalne' }, description: { en: 'Lightning fast CDN.', et: 'Välkkiire CDN.' }, icon: 'Globe' }
                    ]
                }
            },
            {
                id: 'work',
                type: 'gallery',
                enabled: true,
                content: {
                    heading: { en: 'Our Latest Creations', et: 'Meie viimased teosed' },
                    subheading: { en: 'A visual collection of our most recent works – each piece crafted with intention, emotion, and style.', et: 'Visuaalne kogumik meie viimastest töödest – iga teos on loodud kavatsuse, emotsiooni ja stiiliga.' },
                    items: [
                        { id: '1', image: { src: 'https://images.unsplash.com/photo-1719368472026-dc26f70a9b76?q=80&h=800&w=800&auto=format&fit=crop', alt: { en: 'Creation 1', et: 'Teos 1' } } },
                        { id: '2', image: { src: 'https://images.unsplash.com/photo-1649265825072-f7dd6942baed?q=80&h=800&w=800&auto=format&fit=crop', alt: { en: 'Creation 2', et: 'Teos 2' } } },
                        { id: '3', image: { src: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&h=800&w=800&auto=format&fit=crop', alt: { en: 'Creation 3', et: 'Teos 3' } } },
                        { id: '4', image: { src: 'https://images.unsplash.com/photo-1729086046027-09979ade13fd?q=80&h=800&w=800&auto=format&fit=crop', alt: { en: 'Creation 4', et: 'Teos 4' } } },
                        { id: '5', image: { src: 'https://images.unsplash.com/photo-1601568494843-772eb04aca5d?q=80&h=800&w=800&auto=format&fit=crop', alt: { en: 'Creation 5', et: 'Teos 5' } } },
                        { id: '6', image: { src: 'https://images.unsplash.com/photo-1585687501004-615dfdfde7f1?q=80&h=800&w=800&auto=format&fit=crop', alt: { en: 'Creation 6', et: 'Teos 6' } } }
                    ]
                },
                settings: {
                    layout: 'accordion'
                }
            },
            {
                id: 'footer',
                type: 'footer',
                enabled: true,
                content: { text: { en: '© 2024 SUPALE. All rights reserved.', et: '© 2024 SUPALE. Kõik õigused kaitstud.' } }
            }
        ],
        theme: {
            palette: {
                primary: '#8E44AD',
                secondary: '#D980FA',
                background: '#2A0B3F',
                text: '#FFFFFF',
                accent: '#FDCBFE',
                surface: '#3E0F5C',
            },
            fonts: {
                headingFont: 'Poppins',
                bodyFont: 'Poppins'
            }
        }
    },
    'bento-grid': {
        id: 'bento-grid',
        name: 'Bento Box',
        description: 'Modernne, moodulitest koosnev ruudustik.',
        templateVersion: 1,
        previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=500',
        defaultLocale: 'et',
        defaultSections: [
            {
                id: 'header-1',
                type: 'header',
                enabled: true,
                content: {
                    logoText: 'Bento.',
                    navLinks: [
                        { label: { et: 'Tööd', en: 'Work' }, href: '#grid' },
                        { label: { et: 'Teenused', en: 'Services' }, href: '#services' },
                        { label: { et: 'Kontakt', en: 'Contact' }, href: '#contact' }
                    ]
                }
            },
            {
                id: 'hero',
                type: 'hero',
                enabled: true,
                content: {
                    headline: { et: 'Minu Digitaalne Aed', en: 'My Digital Garden' },
                    subheadline: { et: 'Kureeritud kollektsioon projektidest ja mõtetest. Uurin tehnoloogia ja disaini kokkupuutepunkte.', en: 'A curated collection of projects and thoughts. Exploring the intersection of design and technology.' },
                    ctaLabel: { et: 'Vaata projekte', en: 'View Projects' },
                    ctaHref: '#grid'
                }
            },
            {
                id: 'grid',
                type: 'bento',
                enabled: true,
                content: {
                    heading: { et: 'Ülevaade', en: 'Overview' },
                    items: [
                        { id: '1', title: { et: 'Minust', en: 'About Me' }, description: { et: 'Olen tootedisainer, kes armastab koodi. Ehitan kasutajasõbralikke liideseid ja skaleeritavaid süsteeme.', en: 'I am a product designer who loves code. Building user-friendly interfaces and scalable systems.' }, col_span: 2, row_span: 1, type: 'text' },
                        { id: '2', title: { et: 'Twitter', en: 'Twitter' }, col_span: 1, row_span: 1, type: 'icon', icon: 'Twitter' },
                        { id: '3', title: { et: 'Projekt 1', en: 'Project 1' }, image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', col_span: 1, row_span: 2, type: 'image' },
                        { id: '4', title: { et: 'Tehnoloogiad', en: 'Stack' }, description: { et: 'React, Next, Node, Supabase, Tailwind', en: 'React, Next, Node, Supabase, Tailwind' }, col_span: 2, row_span: 1, type: 'text' },
                        { id: '5', title: { et: 'Dribbble', en: 'Dribbble' }, col_span: 1, row_span: 1, type: 'icon', icon: 'Dribbble' },
                        { id: '6', title: { et: 'Projekt 2', en: 'Project 2' }, image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000', col_span: 2, row_span: 1, type: 'image' }
                    ]
                },
            },
            {
                id: 'services',
                type: 'features', // Changed to features to support icons
                enabled: true,
                content: {
                    heading: { et: 'Teenused', en: 'Services' },
                    items: [
                        { title: { et: 'UI/UX Disain', en: 'UI/UX Design' }, description: { et: 'Veebilehed ja rakendused', en: 'Websites and applications' }, icon: 'Layout' },
                        { title: { et: 'Arendus', en: 'Development' }, description: { et: 'React & Next.js', en: 'React & Next.js' }, icon: 'Code' },
                        { title: { et: 'Bränding', en: 'Branding' }, description: { et: 'Visuaalne identiteet', en: 'Visual identity' }, icon: 'PenTool' }
                    ]
                }
            },
            {
                id: 'contact',
                type: 'contact',
                enabled: true,
                content: {
                    heading: { et: 'Kirjuta mulle', en: 'Get in Touch' },
                    email: 'hello@bento.design',
                    formEnabled: true
                }
            },
            {
                id: 'footer',
                type: 'footer',
                enabled: true,
                content: {
                    text: { et: '© 2024 Bento Portfolio. Loodud armastusega.', en: '© 2024 Bento Portfolio. Made with love.' },
                    socials: [
                        { platform: 'github', url: '#' },
                        { platform: 'twitter', url: '#' }
                    ]
                }
            }
        ],
        theme: {
            palette: {
                primary: '#68A9A5',
                secondary: '#ffffff',
                background: '#050505',
                text: '#ffffff',
                accent: '#68A9A5',
                surface: '#111111',
            },
            buttons: {
                radius: '0px',
                style: 'solid',
                uppercase: false,
            }
        }
    },
    'marquee-portfolio': {
        id: 'marquee-portfolio',
        name: 'Marquee',
        description: 'Dünaamiline ja tüpograafia-keskne portfoolio.',
        templateVersion: 1,
        previewImage: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=500',
        defaultLocale: 'et',
        defaultSections: [
            {
                id: 'header',
                type: 'header',
                enabled: true,
                content: {
                    logoText: 'MOTION',
                    navLinks: [
                        { label: { et: 'Tööd', en: 'Work' }, href: '#projects' },
                        { label: { et: 'Teenused', en: 'Services' }, href: '#services' },
                        { label: { et: 'Kontakt', en: 'Contact' }, href: '#contact' }
                    ]
                }
            },
            {
                id: 'hero',
                type: 'hero',
                enabled: true,
                content: {
                    headline: { et: 'DISAIN ON\nLIIKUMINE', en: 'DESIGN IS\nMOTION' },
                    subheadline: { et: 'Loovjuht & Arendaja', en: 'Creative Director & Developer' },
                    ctaLabel: { et: 'Alusta projekti', en: 'Start a Project' },
                    ctaHref: '#contact'
                },
                // settings removed as not in HeroSection schema
            },
            {
                id: 'marquee-1',
                type: 'marquee',
                enabled: true,
                content: {
                    items: [
                        { et: 'LOOVJUHTIMINE', en: 'CREATIVE DIRECTION' },
                        { et: 'VEEBIDISAIN', en: 'WEB DESIGN' },
                        { et: 'BRÄNDING', en: 'BRANDING' },
                        { et: 'STRATEEGIA', en: 'STRATEGY' },
                        { et: 'MOTION DISAIN', en: 'MOTION DESIGN' }
                    ]
                },
                settings: { speed: 'normal', background: 'transparent', direction: 'left', gap: 'large' }
            },
            {
                id: 'projects',
                type: 'projects',
                enabled: true,
                content: {
                    heading: { et: 'Valitud Tööd', en: 'Selected Works' },
                    items: [
                        {
                            id: 'p1',
                            title: { et: 'Finantsäpp 2.0', en: 'Finance App 2.0' },
                            description: { et: 'Täielik ümberdisain (2024)', en: 'Complete Redesign (2024)' },
                            image: { src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000' }
                        },
                        {
                            id: 'p2',
                            title: { et: 'Reisibüroo Veeb', en: 'Travel Agency Web' },
                            description: { et: 'Bränding ja Arendus', en: 'Branding & Development' },
                            image: { src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000' }
                        },
                        {
                            id: 'p3',
                            title: { et: 'E-pood', en: 'E-Commerce' },
                            description: { et: 'Kasutajakogemuse Audit', en: 'UX Audit & Optimization' },
                            image: { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000' }
                        }
                    ]
                }
                // settings removed or must be handled if ProjectsSection supports it. 
                // Schema says BaseSection only has id/type/enabled. ProjectsSection does not explicitly have settings.
                // Assuming settings are causing error too.
            },
            {
                id: 'marquee-2',
                type: 'marquee',
                enabled: true,
                content: {
                    items: [
                        { et: 'REACT', en: 'REACT' },
                        { et: 'TYPESCRIPT', en: 'TYPESCRIPT' },
                        { et: 'NEXT.JS', en: 'NEXT.JS' },
                        { et: 'TAILWINDCSS', en: 'TAILWINDCSS' },
                        { et: 'FIGMA', en: 'FIGMA' },
                        { et: 'FRAMER', en: 'FRAMER' }
                    ]
                },
                settings: { speed: 'slow', background: 'transparent', direction: 'right', gap: 'medium' }
            },
            {
                id: 'about',
                type: 'about',
                enabled: true,
                content: {
                    heading: { et: 'Filosoofia', en: 'Philosophy' },
                    body: {
                        et: 'Hea disain on nähtamatu. See lahendab probleeme enne, kui kasutaja need teadvustab. Loon süsteeme, mis on skaleeritavad, ligipääsetavad ja esteetiliselt nauditavad.',
                        en: 'Good design is invisible. It solves problems before the user realizes them. I create systems that are scalable, accessible, and aesthetically pleasing.'
                    }
                }
            },
            {
                id: 'contact',
                type: 'contact',
                enabled: true,
                content: {
                    heading: { et: 'Alustame vestlust', en: 'Let\'s talk' },
                    email: 'hello@motion.studio',
                    formEnabled: true
                }
            },
            {
                id: 'footer',
                type: 'footer',
                enabled: true,
                content: {
                    text: { et: '© 2024 Motion Studio', en: '© 2024 Motion Studio' },
                    socials: [
                        { platform: 'instagram', url: '#' },
                        { platform: 'twitter', url: '#' },
                        { platform: 'linkedin', url: '#' }
                    ]
                }
            }
        ],
        theme: {
            palette: {
                primary: '#ffffff',
                secondary: '#888888',
                background: '#000000',
                text: '#ffffff',
                accent: '#ffffff',
                surface: '#111111',
            },
            buttons: {
                radius: '9999px',
                style: 'outline',
                uppercase: true,
            }
        }
    },
    'brutalist': {
        id: 'brutalist',
        name: 'Brutalist',
        description: 'Raw, bold, and high-contrast design.',
        templateVersion: 1,
        defaultLocale: 'en',
        defaultSections: [
            {
                id: 'hero',
                type: 'hero',
                enabled: true,
                content: {
                    headline: { en: 'DESIGN IS\nCHAOS', et: 'DISAIN ON\nKAOS' }
                }
            },
            {
                id: 'footer',
                type: 'footer',
                enabled: true,
                content: { text: { en: 'MADE ON EARTH', et: 'TEHTUD MAAL' } }
            }
        ],
        theme: {
            palette: {
                primary: '#000000',
                secondary: '#ff0000',
                background: '#ffffff',
                text: '#000000',
                accent: '#ff0000',
            }
        }
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
            fonts: template.theme?.fonts || {
                headingFont: 'Inter',
                bodyFont: 'Inter',
                monoFont: 'JetBrains Mono',
                baseSize: 16,
                scale: 1.25,
            },
            palette: template.theme?.palette || {
                primary: '#000000',
                secondary: '#ffffff',
                background: '#ffffff',
                text: '#000000',
                accent: '#7c3aed',
            },
            buttons: template.theme?.buttons || {
                radius: '0.5rem',
                style: 'solid',
                uppercase: false,
            },
        },
        sections: {
            order: template.defaultSections.map(s => s.id),
            visibility: Object.fromEntries(
                template.defaultSections.map(s => [s.id, true])
            ),
            content: Object.fromEntries(
                template.defaultSections.map(s => [s.id, s.content])
            ),
        },
    };
}
