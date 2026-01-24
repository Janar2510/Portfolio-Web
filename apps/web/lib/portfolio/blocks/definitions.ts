
/**
 * Block Definitions
 * Registers all available blocks in the registry
 */


import { blockRegistry } from './registry';
import { HeroBlock } from '@/components/portfolio/blocks/HeroBlock';
import { TextBlock } from '@/components/portfolio/blocks/TextBlock';
import { ImageBlock } from '@/components/portfolio/blocks/ImageBlock';
import { GalleryBlock } from '@/components/portfolio/blocks/GalleryBlock';
import { VideoBlock } from '@/components/portfolio/blocks/VideoBlock';
import { FormBlock } from '@/components/portfolio/blocks/FormBlock';
import { ProjectsBlock } from '@/components/portfolio/blocks/ProjectsBlock';
import { ProjectGridBlock } from '@/components/portfolio/blocks/ProjectGridBlock';
import { SkillsBlock } from '@/components/portfolio/blocks/SkillsBlock';
import { StatsBlock } from '@/components/portfolio/blocks/StatsBlock';
import { ShapeBlock } from '@/components/portfolio/blocks/ShapeBlock';
import { FrameBlock } from '@/components/portfolio/blocks/FrameBlock';
import { HeaderBlock } from '@/components/portfolio/blocks/HeaderBlock';
import { FooterBlock } from '@/components/portfolio/blocks/FooterBlock';
import * as Schemas from './schemas';
import {
    LayoutTemplate,
    Type,
    Image as ImageIcon,
    GalleryVerticalEnd,
    Video,
    Mail,
    Briefcase,
    Grid3X3,
    BarChart,
    Trophy,
    Shapes,
    Square,
    PanelTop,
    PanelBottom
} from 'lucide-react';

// Hero Block
blockRegistry.register({
    metadata: {
        type: 'hero',
        name: 'Hero',
        description: 'A large banner with a headline, subheadline, and call-to-action.',
        icon: LayoutTemplate,
        category: 'layout',
        schema: Schemas.heroBlockContentSchema,
        defaultContent: {
            headline: 'Welcome to My Portfolio',
            subheadline: 'I am a creative professional based in San Francisco.',
            cta_text: 'View My Work',
            cta_link: '#projects',
        },
        defaultSettings: {
            alignment: 'center',
            background: 'solid',
            height: 'medium',
            overlay: false,
        },
    },
    ViewComponent: HeroBlock,
    EditComponent: HeroBlock,
});

// Text Block
blockRegistry.register({
    metadata: {
        type: 'text',
        name: 'Text Content',
        description: 'A rich text block for paragraphs and headings.',
        icon: Type,
        category: 'content',
        schema: Schemas.textBlockContentSchema,
        defaultContent: {
            text: 'Start typing your content here...',
        },
        defaultSettings: {
            max_width: '800px',
            text_align: 'left',
        },
    },
    ViewComponent: TextBlock,
    EditComponent: TextBlock,
});

// Image Block
blockRegistry.register({
    metadata: {
        type: 'image',
        name: 'Image',
        description: 'Display a single image with optional caption.',
        icon: ImageIcon,
        category: 'media',
        schema: Schemas.imageBlockContentSchema,
        defaultContent: {
            image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
            alt_text: 'Placeholder image',
        },
        defaultSettings: {
            width: 'medium',
            alignment: 'center',
        },
    },
    ViewComponent: ImageBlock,
    EditComponent: ImageBlock,
});

// Gallery Block
blockRegistry.register({
    metadata: {
        type: 'gallery',
        name: 'Gallery',
        description: 'A grid or carousel of images.',
        icon: GalleryVerticalEnd,
        category: 'media',
        schema: Schemas.galleryBlockContentSchema,
        defaultContent: {
            images: [],
        },
        defaultSettings: {
            layout: 'grid',
            columns: 3,
            gap: 'default',
        },
    },
    ViewComponent: GalleryBlock,
    EditComponent: GalleryBlock,
});

// Video Block
blockRegistry.register({
    metadata: {
        type: 'video',
        name: 'Video',
        description: 'Embed a video from YouTube, Vimeo, or a direct link.',
        icon: Video,
        category: 'media',
        schema: Schemas.videoBlockContentSchema,
        defaultContent: {
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            autoplay: false,
            controls: true,
        },
        defaultSettings: {
            aspect_ratio: '16:9',
            width: 'full',
        },
    },
    ViewComponent: VideoBlock,
    EditComponent: VideoBlock,
});

// Contact Form Block
blockRegistry.register({
    metadata: {
        type: 'contact-form',
        name: 'Contact Form',
        description: 'A form for visitors to get in touch with you.',
        icon: Mail,
        category: 'interactive',
        schema: Schemas.contactFormBlockContentSchema,
        defaultContent: {
            title: 'Get in Touch',
            description: 'Send me a message and I will get back to you as soon as possible.',
            fields: [
                { name: 'name', type: 'text', label: 'Name', required: true },
                { name: 'email', type: 'email', label: 'Email', required: true },
                { name: 'message', type: 'textarea', label: 'Message', required: true },
            ],
            submit_text: 'Send Message',
        },
        defaultSettings: {
            layout: 'default',
        },
    },
    ViewComponent: FormBlock,
    EditComponent: FormBlock,
});

// Project Grid Block
blockRegistry.register({
    metadata: {
        type: 'project-grid',
        name: 'Project Grid',
        description: 'Display your projects in a grid layout.',
        icon: Grid3X3,
        category: 'portfolio',
        schema: Schemas.projectGridBlockContentSchema,
        defaultContent: {
            limit: 6,
        },
        defaultSettings: {
            layout: 'grid',
            columns: 3,
            gap: 'default',
        },
    },
    ViewComponent: ProjectGridBlock,
    EditComponent: ProjectGridBlock,
});

// Skills Block
blockRegistry.register({
    metadata: {
        type: 'skills',
        name: 'Skills',
        description: 'Showcase your skills and expertise.',
        icon: Briefcase,
        category: 'portfolio',
        schema: Schemas.skillsBlockContentSchema,
        defaultContent: {
            skills: [
                { id: '1', name: 'JavaScript', level: 90 },
                { id: '2', name: 'TypeScript', level: 85 },
                { id: '3', name: 'React', level: 95 },
            ],
        },
        defaultSettings: {
            layout: 'grid',
            show_level: true,
        },
    },
    ViewComponent: SkillsBlock,
    EditComponent: SkillsBlock,
});

// Stats Block
blockRegistry.register({
    metadata: {
        type: 'stats',
        name: 'Stats',
        description: 'Display key statistics or numbers.',
        icon: BarChart,
        category: 'portfolio',
        schema: Schemas.statsBlockContentSchema,
        defaultContent: {
            stats: [
                { id: '1', label: 'Years Experience', value: '5+' },
                { id: '2', label: 'Projects Completed', value: '50+' },
                { id: '3', label: 'Happy Clients', value: '100%' },
            ],
        },
        defaultSettings: {
            layout: 'grid',
            columns: 3,
        },
    },
    ViewComponent: StatsBlock,
    EditComponent: StatsBlock,
});

// Shape Block
blockRegistry.register({
    metadata: {
        type: 'shape',
        name: 'Shape',
        description: 'Add basic shapes like circles, squares, and triangles.',
        icon: Shapes,
        category: 'content',
        schema: Schemas.shapeBlockContentSchema,
        defaultContent: {
            shape: 'square',
            color: '#000000',
            width: 100,
            height: 100,
        },
        defaultSettings: {
            alignment: 'center',
            rotate: 0,
        },
    },
    ViewComponent: ShapeBlock,
    EditComponent: ShapeBlock,
});

// Frame Block
blockRegistry.register({
    metadata: {
        type: 'frame',
        name: 'Frame',
        description: 'A container with customizable border and background.',
        icon: Square,
        category: 'layout',
        schema: Schemas.frameBlockContentSchema,
        defaultContent: {
            borderColor: '#000000',
            borderWidth: 2,
            borderRadius: 0,
            backgroundColor: 'transparent',
            padding: 20,
            minHeight: 200,
        },
        defaultSettings: {
            alignment: 'center',
            shadow: false,
        },
    },
    ViewComponent: FrameBlock,
    EditComponent: FrameBlock,
});

// Header Block
blockRegistry.register({
    metadata: {
        type: 'header',
        name: 'Header',
        description: 'Site navigation and logo.',
        icon: PanelTop,
        category: 'layout',
        schema: Schemas.headerBlockContentSchema,
        defaultContent: {
            logo_text: 'My Portfolio',
            links: [
                { label: 'Home', url: '/' },
                { label: 'Services', url: '/services' },
                { label: 'My Work', url: '/work' },
                { label: 'Contact', url: '/contact' },
            ],
        },
        defaultSettings: {
            layout: 'simple',
            sticky: true,
        },
    },
    ViewComponent: HeaderBlock,
    EditComponent: HeaderBlock,
});

// Footer Block
blockRegistry.register({
    metadata: {
        type: 'footer',
        name: 'Footer',
        description: 'Site footer with copyright and social links.',
        icon: PanelBottom,
        category: 'layout',
        schema: Schemas.footerBlockContentSchema,
        defaultContent: {
            copyright_text: `© ${new Date().getFullYear()} My Portfolio. All rights reserved.`,
            social_links: [
                { platform: 'twitter', url: 'https://twitter.com' },
                { platform: 'linkedin', url: 'https://linkedin.com' },
                { platform: 'instagram', url: 'https://instagram.com' },
            ],
            legal_links: [
                { label: 'Privacy Policy', url: '/privacy' },
            ]
        },
        defaultSettings: {
            layout: 'simple',
        },
    },
    ViewComponent: FooterBlock,
    EditComponent: FooterBlock,
});
