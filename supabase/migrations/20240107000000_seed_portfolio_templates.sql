-- Migration: Seed Portfolio Templates Library
-- Description: Initial templates for users to start with

-- Minimal Portfolio Template
INSERT INTO public.portfolio_templates (
  name,
  description,
  category,
  pages_schema,
  styles_schema,
  is_active
) VALUES (
  'Minimal',
  'A clean, minimal portfolio perfect for showcasing your work with focus on content.',
  'minimal',
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Welcome",
            "subheadline": "I create beautiful digital experiences",
            "cta_text": "View My Work",
            "cta_link": "/projects"
          },
          "settings": {
            "alignment": "center",
            "background": "gradient"
          }
        },
        {
          "block_type": "text",
          "content": {
            "text": "I am a creative professional passionate about design and development."
          },
          "settings": {
            "max_width": "800px"
          }
        },
        {
          "block_type": "projects",
          "content": {
            "title": "Featured Projects",
            "limit": 6
          },
          "settings": {
            "layout": "grid",
            "columns": 3
          }
        }
      ]
    },
    {
      "slug": "about",
      "title": "About",
      "is_homepage": false,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "About Me",
            "subheadline": "Learn more about my journey"
          },
          "settings": {
            "alignment": "center"
          }
        },
        {
          "block_type": "text",
          "content": {
            "text": "I am a passionate designer and developer with years of experience creating digital experiences."
          }
        }
      ]
    },
    {
      "slug": "contact",
      "title": "Contact",
      "is_homepage": false,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Get In Touch",
            "subheadline": "Let us work together"
          },
          "settings": {
            "alignment": "center"
          }
        },
        {
          "block_type": "form",
          "content": {
            "form_type": "contact",
            "fields": ["name", "email", "message"]
          }
        }
      ]
    }
  ]'::jsonb,
  '{
    "color_palette": {
      "primary": "#000000",
      "secondary": "#666666",
      "accent": "#0066ff",
      "background": "#ffffff",
      "text": "#000000"
    },
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Inter",
      "scale": "1.25"
    },
    "spacing_scale": "default"
  }'::jsonb,
  true
);

-- Creative Portfolio Template
INSERT INTO public.portfolio_templates (
  name,
  description,
  category,
  pages_schema,
  styles_schema,
  is_active
) VALUES (
  'Creative',
  'A bold, creative portfolio with vibrant colors and dynamic layouts.',
  'creative',
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Creative Designer",
            "subheadline": "Bringing ideas to life through design",
            "cta_text": "Explore",
            "cta_link": "/work"
          },
          "settings": {
            "alignment": "left",
            "background": "image",
            "overlay": true
          }
        },
        {
          "block_type": "gallery",
          "content": {
            "title": "Featured Work",
            "images": []
          },
          "settings": {
            "layout": "masonry",
            "columns": 4
          }
        },
        {
          "block_type": "text",
          "content": {
            "text": "I specialize in creating memorable brand experiences and digital products that resonate with audiences."
          },
          "settings": {
            "max_width": "900px",
            "text_align": "center"
          }
        }
      ]
    },
    {
      "slug": "work",
      "title": "Work",
      "is_homepage": false,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "My Work",
            "subheadline": "A collection of my best projects"
          }
        },
        {
          "block_type": "projects",
          "content": {
            "title": "All Projects",
            "limit": 12
          },
          "settings": {
            "layout": "grid",
            "columns": 2
          }
        }
      ]
    }
  ]'::jsonb,
  '{
    "color_palette": {
      "primary": "#ff0066",
      "secondary": "#00ccff",
      "accent": "#ffcc00",
      "background": "#0a0a0a",
      "text": "#ffffff"
    },
    "typography": {
      "headingFont": "Poppins",
      "bodyFont": "Open Sans",
      "scale": "1.5"
    },
    "spacing_scale": "relaxed"
  }'::jsonb,
  true
);

-- Professional Portfolio Template
INSERT INTO public.portfolio_templates (
  name,
  description,
  category,
  pages_schema,
  styles_schema,
  is_active
) VALUES (
  'Professional',
  'A polished, professional portfolio ideal for consultants and business professionals.',
  'professional',
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "John Doe",
            "subheadline": "Business Consultant & Strategist",
            "cta_text": "Schedule a Call",
            "cta_link": "/contact"
          },
          "settings": {
            "alignment": "center",
            "background": "solid"
          }
        },
        {
          "block_type": "text",
          "content": {
            "text": "With over 10 years of experience helping businesses grow, I specialize in strategic planning, process optimization, and team development."
          },
          "settings": {
            "max_width": "700px",
            "text_align": "center"
          }
        },
        {
          "block_type": "text",
          "content": {
            "title": "Services",
            "text": "Strategic Consulting | Process Optimization | Team Development | Business Growth"
          },
          "settings": {
            "max_width": "800px"
          }
        },
        {
          "block_type": "text",
          "content": {
            "title": "Testimonials",
            "text": "Client testimonials and case studies"
          }
        }
      ]
    },
    {
      "slug": "services",
      "title": "Services",
      "is_homepage": false,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Services",
            "subheadline": "How I can help your business"
          }
        },
        {
          "block_type": "text",
          "content": {
            "text": "Detailed service descriptions"
          }
        }
      ]
    },
    {
      "slug": "contact",
      "title": "Contact",
      "is_homepage": false,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Let's Talk",
            "subheadline": "Get in touch to discuss your project"
          }
        },
        {
          "block_type": "form",
          "content": {
            "form_type": "contact",
            "fields": ["name", "email", "company", "message"]
          }
        }
      ]
    }
  ]'::jsonb,
  '{
    "color_palette": {
      "primary": "#1a1a1a",
      "secondary": "#4a5568",
      "accent": "#2563eb",
      "background": "#ffffff",
      "text": "#1a1a1a"
    },
    "typography": {
      "headingFont": "Roboto",
      "bodyFont": "Roboto",
      "scale": "1.2"
    },
    "spacing_scale": "default"
  }'::jsonb,
  true
);

-- Developer Portfolio Template
INSERT INTO public.portfolio_templates (
  name,
  description,
  category,
  pages_schema,
  styles_schema,
  is_active
) VALUES (
  'Developer',
  'A modern portfolio template perfect for developers and engineers.',
  'developer',
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Full Stack Developer",
            "subheadline": "Building modern web applications",
            "cta_text": "View Projects",
            "cta_link": "/projects"
          },
          "settings": {
            "alignment": "left",
            "background": "gradient"
          }
        },
        {
          "block_type": "text",
          "content": {
            "title": "Skills",
            "text": "React | Next.js | TypeScript | Node.js | PostgreSQL | AWS"
          },
          "settings": {
            "max_width": "900px"
          }
        },
        {
          "block_type": "projects",
          "content": {
            "title": "Recent Projects",
            "limit": 6
          },
          "settings": {
            "layout": "grid",
            "columns": 3
          }
        },
        {
          "block_type": "text",
          "content": {
            "title": "About",
            "text": "I am a passionate developer with expertise in modern web technologies. I love building scalable applications and solving complex problems."
          }
        }
      ]
    },
    {
      "slug": "projects",
      "title": "Projects",
      "is_homepage": false,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Projects",
            "subheadline": "A showcase of my work"
          }
        },
        {
          "block_type": "projects",
          "content": {
            "title": "All Projects",
            "limit": 20
          },
          "settings": {
            "layout": "grid",
            "columns": 2
          }
        }
      ]
    }
  ]'::jsonb,
  '{
    "color_palette": {
      "primary": "#00d4ff",
      "secondary": "#7c3aed",
      "accent": "#f59e0b",
      "background": "#0f172a",
      "text": "#f1f5f9"
    },
    "typography": {
      "headingFont": "JetBrains Mono",
      "bodyFont": "Inter",
      "scale": "1.3"
    },
    "spacing_scale": "default"
  }'::jsonb,
  true
);

-- Artist Portfolio Template
INSERT INTO public.portfolio_templates (
  name,
  description,
  category,
  pages_schema,
  styles_schema,
  is_active
) VALUES (
  'Artist',
  'A beautiful portfolio template designed for artists and photographers.',
  'artist',
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Artist Name",
            "subheadline": "Visual Artist & Photographer",
            "cta_text": "View Gallery",
            "cta_link": "/gallery"
          },
          "settings": {
            "alignment": "center",
            "background": "image",
            "overlay": true
          }
        },
        {
          "block_type": "gallery",
          "content": {
            "title": "Featured Works",
            "images": []
          },
          "settings": {
            "layout": "grid",
            "columns": 3
          }
        },
        {
          "block_type": "text",
          "content": {
            "text": "I create art that tells stories and captures moments in time."
          },
          "settings": {
            "max_width": "600px",
            "text_align": "center"
          }
        }
      ]
    },
    {
      "slug": "gallery",
      "title": "Gallery",
      "is_homepage": false,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Gallery",
            "subheadline": "My latest works"
          }
        },
        {
          "block_type": "gallery",
          "content": {
            "title": "All Works",
            "images": []
          },
          "settings": {
            "layout": "masonry",
            "columns": 4
          }
        }
      ]
    }
  ]'::jsonb,
  '{
    "color_palette": {
      "primary": "#ffffff",
      "secondary": "#f5f5f5",
      "accent": "#d4af37",
      "background": "#ffffff",
      "text": "#1a1a1a"
    },
    "typography": {
      "headingFont": "Playfair Display",
      "bodyFont": "Lora",
      "scale": "1.4"
    },
    "spacing_scale": "relaxed"
  }'::jsonb,
  true
);
