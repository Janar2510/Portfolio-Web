
import { createBlock } from '@/lib/portfolio/blocks/registry';
import type { PortfolioBlock } from '@/lib/services/portfolio';

export interface GeneratedSiteContent {
    blocks: Omit<PortfolioBlock, 'id' | 'page_id' | 'created_at' | 'updated_at'>[];
    styles: Record<string, any>;
}

export function generateSiteFromTemplate(templateId: string): GeneratedSiteContent {
    // Always start with Global Header
    const blocks: Omit<PortfolioBlock, 'id' | 'page_id' | 'created_at' | 'updated_at'>[] = [
        createBlock('header')
    ];
    const styles: Record<string, any> = {};



    // ... (Content blocks based on template) ...
    // Note: I will need to insert the switch case content here, but since I am replacing the whole function for safety/clarity or just wrapping logic.
    // Actually, let's keep the switch but just append header first and footer last.

    // (Wait, replace_file_content replaces a chunk. I should just use the existing switch and init/finalize arrays)

    // Re-approach: I will initialize blocks with Header, and push Footer at the end.
    // But since I can't easily wrap the switch statement with a single replace without re-writing the whole switch, 
    // I will replace the initialization and the return statement.
    // Or better: Just insert `blocks.push(createBlock('header'));` at the start and `blocks.push(createBlock('footer'));` before return.

    // Let's do it in two chunks? No, strict tool usage says "Single contiguous block" for replace_file.
    // I'll stick to replacing the initialization and the return.

    // Always append Global Footer
    blocks.push(createBlock('footer'));

    return { blocks, styles };
}
// STOP. I must use the tool correctly. I will assume the file content is known. I'll read it first to be precise.
// I already read it in previous steps.

        case 'espresso':
// Dark Coffee Theme
styles.colors = {
    primary: '#4E342E',
    secondary: '#3E2723',
    accent: '#A1887F',
    background: '#2B211E', // Dark brown background
    text: '#EFEBE9',
    surface: '#3E2723',
    border: '#4E342E',
};
styles.typography = { fontFamily: 'Playfair Display' };

blocks.push(createBlock('hero', {
    content: {
        headline: 'The Espresso Stroll',
        subheadline: 'Sipping my way through hidden café gems.',
        cta_text: 'Read the Blog',
        cta_link: '#blog',
        background_image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2787&auto=format&fit=crop',
    },
    settings: { height: 'medium', alignment: 'left', background: 'transparent' }
}));

blocks.push(createBlock('project-grid', { content: { limit: 3 }, settings: { columns: 2 } }));
break;

        case 'ava':
// Creative Gradient Theme
styles.colors = {
    primary: '#FF8A65', // Salmon
    secondary: '#FFCCBC',
    accent: '#FFAB91',
    background: '#FFF8F5', // Very light warm gray/pink
    text: '#1F2937',
    surface: '#FFFFFF',
    border: '#FFE0B2',
};
styles.typography = { fontFamily: 'Inter' };

blocks.push(createBlock('hero', {
    content: {
        headline: 'Creative copywriter, huge fan of unusual ideas.',
        subheadline: 'I\'m Ava, a passionate copywriter seeking new opportunities.',
        cta_text: 'View Portfolio',
    },
    settings: { height: 'medium', alignment: 'left', variant: 'clean' }
}));
blocks.push(createBlock('text', {
    content: { text: '## 01 — Introduction\n\nWith a diverse portfolio spanning tech, beauty, and healthcare...' }
}));
break;

        case 'bernadette':
// Neutral Professional Theme
styles.colors = {
    primary: '#8D6E63',
    secondary: '#D7CCC8',
    accent: '#A1887F',
    background: '#F5F5F4', // Warm grey
    text: '#44403C',
    surface: '#E7E5E4',
    border: '#D6D3D1',
};
styles.typography = { fontFamily: 'DM Sans' };

blocks.push(createBlock('hero', {
    content: {
        headline: 'Digital marketing manager, specializing in content marketing.',
        subheadline: 'Bringing in traffic and building a following is my speciality.',
        cta_text: 'Tell Me More',
    },
    settings: { height: 'medium', alignment: 'left', }
}));
blocks.push(createBlock('image', {
    content: { image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop' },
    settings: { width: 'small', alignment: 'left', borderRadius: 'circle' }
}));
break;

        case 'emily':
// Minimalist Writer Theme
styles.colors = {
    primary: '#262626',
    secondary: '#525252',
    accent: '#A3A3A3',
    background: '#FAFAFA',
    text: '#171717',
    surface: '#F5F5F5',
    border: '#E5E5E5',
};
styles.typography = { fontFamily: 'Lora' };

blocks.push(createBlock('hero', {
    content: {
        headline: 'Creative copywriter helping your business stand out',
        subheadline: 'Hi there, my name is Emily. I\'m a copywriter with a degree in English Literature.',
        cta_text: 'Get In Touch',
    },
    settings: { height: 'medium', alignment: 'left' }
}));
blocks.push(createBlock('image', {
    content: { image_url: 'https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=2940&auto=format&fit=crop' },
    settings: { width: 'half', alignment: 'right' }
}));
break;

        case 'bento':
// Modern Grid / Bento Theme
styles.colors = {
    primary: '#6366f1', // Indigo
    secondary: '#a5b4fc',
    accent: '#818cf8',
    background: '#f8fafc', // Slate 50
    text: '#0f172a', // Slate 900
    surface: '#ffffff',
    border: '#e2e8f0',
};
styles.typography = { fontFamily: 'Outfit' };

// 1. Large Profile Image (Top Left, 8 cols, 2 rows)
blocks.push(createBlock('image', {
    content: {
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop',
        caption: 'Visual Designer & Art Director'
    },
    settings: { rounded: true, shadow: true },
    layout: { colSpan: 8, rowSpan: 2 }
}));

// 2. Introduction Card (Top Right, 4 cols)
blocks.push(createBlock('text', {
    content: { text: '# Hello, I\'m Alex.\n\nI craft digital experiences that look good and work better.' },
    settings: { background_color: '#ffffff', padding: 24, rounded: true },
    layout: { colSpan: 4 }
}));

// 3. Social/Contact Card (Middle Right, 4 cols)
blocks.push(createBlock('social-links', {
    content: {
        links: [
            { platform: 'twitter', url: '#' },
            { platform: 'dribbble', url: '#' },
            { platform: 'linkedin', url: '#' }
        ]
    },
    settings: { layout: 'horizontal', style: 'button' },
    layout: { colSpan: 4 }
}));

// 4. Project 1 (Bottom Left, 6 cols)
blocks.push(createBlock('image', {
    content: { image_url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2787&auto=format&fit=crop' },
    settings: { rounded: true },
    layout: { colSpan: 6 }
}));

// 5. Project 2 (Bottom Right, 6 cols)
blocks.push(createBlock('image', {
    content: { image_url: 'https://images.unsplash.com/photo-1600508774662-721446edbf9c?q=80&w=2787&auto=format&fit=crop' },
    settings: { rounded: true },
    layout: { colSpan: 6 }
}));
break;

        default:
// Default empty starter
blocks.push(createBlock('hero'));
blocks.push(createBlock('text'));
break;
    }

return { blocks, styles };
}
