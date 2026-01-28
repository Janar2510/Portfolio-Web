-- Migration: Seed Portfolio Templates from Definitions
-- Description: Insert 5 comprehensive portfolio templates based on template definitions

-- Helper function to convert template definition to database format
-- This migration uses the new portfolio_templates schema structure

-- Minimal Template
INSERT INTO public.portfolio_templates (
  slug,
  name,
  name_key,
  description,
  description_key,
  category,
  tags,
  preview_image_url,
  thumbnail_url,
  features,
  industries,
  is_premium,
  is_featured,
  pages_schema,
  styles_schema,
  is_active,
  created_at,
  updated_at
) VALUES (
  'minimal',
  'Minimal',
  'template.minimal.name',
  'Clean, minimal portfolio focused on typography and whitespace',
  'template.minimal.description',
  'minimal',
  ARRAY['clean', 'minimal', 'typography', 'whitespace', 'elegant'],
  NULL,
  NULL,
  ARRAY['Responsive Design', 'Typography Focus', 'Clean Layout', 'Fast Loading'],
  ARRAY['Design', 'Writing', 'Content Creation'],
  false,
  true,
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Welcome to My Portfolio",
            "subheadline": "A curated collection of my work and thoughts",
            "cta_text": "View My Work",
            "cta_link": "/projects"
          },
          "settings": {
            "alignment": "center",
            "background": "solid",
            "height": "medium"
          },
          "sort_order": 0
        },
        {
          "block_type": "text",
          "content": {
            "text": "I''m a creative professional passionate about crafting meaningful experiences through design and content. With a focus on clarity and purpose, I bring ideas to life with thoughtful attention to detail."
          },
          "settings": {
            "max_width": "800px",
            "text_align": "center"
          },
          "sort_order": 1
        },
        {
          "block_type": "project-grid",
          "content": {
            "title": "Featured Projects",
            "limit": 3
          },
          "settings": {
            "layout": "grid",
            "columns": 3,
            "show_excerpt": true,
            "show_tags": true
          },
          "sort_order": 2
        },
        {
          "block_type": "contact-form",
          "content": {
            "title": "Let''s Work Together",
            "description": "Get in touch to discuss your project",
            "fields": ["name", "email", "message"],
            "submit_text": "Send Message",
            "success_message": "Thank you! I''ll get back to you soon."
          },
          "settings": {
            "layout": "centered"
          },
          "sort_order": 3
        }
      ]
    }
  ]'::jsonb,
  '{
    "colors": {
      "primary": "#000000",
      "secondary": "#666666",
      "accent": "#0066FF",
      "background": "#FFFFFF",
      "text": "#1A1A1A",
      "surface": "#FAFAFA",
      "border": "#E5E5E5",
      "textSecondary": "#666666"
    },
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Inter",
      "monoFont": "JetBrains Mono",
      "baseSize": 16,
      "scale": 1.25,
      "lineHeight": 1.6,
      "headingWeight": 700,
      "bodyWeight": 400
    },
    "spacing": {
      "scale": "default",
      "sectionPadding": "80px",
      "containerWidth": "1200px",
      "borderRadius": "8px"
    },
    "effects": {
      "shadows": false,
      "animations": true,
      "animationSpeed": "normal",
      "scrollAnimations": false,
      "hoverEffects": true
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  pages_schema = EXCLUDED.pages_schema,
  styles_schema = EXCLUDED.styles_schema,
  updated_at = NOW();

-- Creative Template
INSERT INTO public.portfolio_templates (
  slug,
  name,
  description,
  category,
  tags,
  features,
  industries,
  is_premium,
  is_featured,
  pages_schema,
  styles_schema,
  is_active,
  created_at,
  updated_at
) VALUES (
  'creative',
  'Creative',
  'Bold colors, asymmetric layouts, large visuals',
  'creative',
  ARRAY['bold', 'vibrant', 'asymmetric', 'dynamic', 'expressive'],
  ARRAY['Bold Design', 'Dynamic Layouts', 'Visual Focus', 'Creative Animations'],
  ARRAY['Design', 'Illustration', 'Branding'],
  false,
  true,
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Creative Visionary",
            "subheadline": "Transforming ideas into bold visual experiences",
            "cta_text": "Explore My Work",
            "cta_link": "/projects"
          },
          "settings": {
            "alignment": "left",
            "background": "gradient",
            "height": "large"
          },
          "sort_order": 0
        },
        {
          "block_type": "text",
          "content": {
            "text": "I''m a visual storyteller who believes in the power of bold design. My work combines vibrant colors, dynamic layouts, and expressive typography to create memorable brand experiences that stand out in a crowded digital landscape."
          },
          "settings": {
            "max_width": "900px",
            "text_align": "left"
          },
          "sort_order": 1
        },
        {
          "block_type": "project-grid",
          "content": {
            "title": "Featured Work",
            "limit": 4
          },
          "settings": {
            "layout": "masonry",
            "columns": 2,
            "show_excerpt": true,
            "show_tags": true
          },
          "sort_order": 2
        },
        {
          "block_type": "contact-form",
          "content": {
            "title": "Start Your Project",
            "description": "Let''s create something amazing together",
            "fields": ["name", "email", "message"],
            "submit_text": "Send",
            "success_message": "Thanks! I''ll be in touch soon."
          },
          "settings": {
            "layout": "centered"
          },
          "sort_order": 3
        }
      ]
    }
  ]'::jsonb,
  '{
    "colors": {
      "primary": "#FF6B6B",
      "secondary": "#4ECDC4",
      "accent": "#FFE66D",
      "background": "#FFFFFF",
      "text": "#2C3E50",
      "surface": "#F8F9FA",
      "border": "#E1E8ED",
      "textSecondary": "#7F8C8D"
    },
    "typography": {
      "headingFont": "Plus Jakarta Sans",
      "bodyFont": "Plus Jakarta Sans",
      "monoFont": "Fira Code",
      "baseSize": 16,
      "scale": 1.5,
      "lineHeight": 1.7,
      "headingWeight": 800,
      "bodyWeight": 400
    },
    "spacing": {
      "scale": "relaxed",
      "sectionPadding": "120px",
      "containerWidth": "1400px",
      "borderRadius": "16px"
    },
    "effects": {
      "shadows": true,
      "animations": true,
      "animationSpeed": "normal",
      "scrollAnimations": true,
      "hoverEffects": true
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  pages_schema = EXCLUDED.pages_schema,
  styles_schema = EXCLUDED.styles_schema,
  updated_at = NOW();

-- Professional Template
INSERT INTO public.portfolio_templates (
  slug,
  name,
  description,
  category,
  tags,
  features,
  industries,
  is_premium,
  is_featured,
  pages_schema,
  styles_schema,
  is_active,
  created_at,
  updated_at
) VALUES (
  'professional',
  'Professional',
  'Conservative layout, serif fonts, clear structure',
  'professional',
  ARRAY['conservative', 'structured', 'trustworthy', 'refined', 'authoritative'],
  ARRAY['Professional Layout', 'Serif Typography', 'Clear Structure', 'Business Focus'],
  ARRAY['Consulting', 'Business', 'Professional Services'],
  false,
  true,
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Expert Consulting & Strategic Guidance",
            "subheadline": "Helping businesses achieve their goals through proven methodologies and strategic insight",
            "cta_text": "Schedule a Consultation",
            "cta_link": "/contact"
          },
          "settings": {
            "alignment": "center",
            "background": "solid",
            "height": "medium"
          },
          "sort_order": 0
        },
        {
          "block_type": "text",
          "content": {
            "text": "With over 15 years of experience in business strategy and consulting, I help organizations navigate complex challenges and unlock their potential. My approach combines analytical rigor with practical solutions, delivering measurable results for clients across industries."
          },
          "settings": {
            "max_width": "800px",
            "text_align": "center"
          },
          "sort_order": 1
        },
        {
          "block_type": "project-grid",
          "content": {
            "title": "Case Studies",
            "limit": 3
          },
          "settings": {
            "layout": "grid",
            "columns": 3,
            "show_excerpt": true,
            "show_tags": false
          },
          "sort_order": 2
        },
        {
          "block_type": "contact-form",
          "content": {
            "title": "Schedule a Consultation",
            "description": "Let''s discuss how I can help your business",
            "fields": ["name", "email", "company", "message"],
            "submit_text": "Send Request",
            "success_message": "Thank you! I''ll contact you within 24 hours."
          },
          "settings": {
            "layout": "centered"
          },
          "sort_order": 3
        }
      ]
    }
  ]'::jsonb,
  '{
    "colors": {
      "primary": "#1E3A5F",
      "secondary": "#C9A961",
      "accent": "#2563EB",
      "background": "#FFFFFF",
      "text": "#2C2C2C",
      "surface": "#F5F5F5",
      "border": "#D4D4D4",
      "textSecondary": "#6B6B6B"
    },
    "typography": {
      "headingFont": "Playfair Display",
      "bodyFont": "Lora",
      "monoFont": "JetBrains Mono",
      "baseSize": 17,
      "scale": 1.2,
      "lineHeight": 1.7,
      "headingWeight": 700,
      "bodyWeight": 400
    },
    "spacing": {
      "scale": "default",
      "sectionPadding": "100px",
      "containerWidth": "1200px",
      "borderRadius": "4px"
    },
    "effects": {
      "shadows": false,
      "animations": false,
      "animationSpeed": "normal",
      "scrollAnimations": false,
      "hoverEffects": false
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  pages_schema = EXCLUDED.pages_schema,
  styles_schema = EXCLUDED.styles_schema,
  updated_at = NOW();

-- Developer Template
INSERT INTO public.portfolio_templates (
  slug,
  name,
  description,
  category,
  tags,
  features,
  industries,
  is_premium,
  is_featured,
  pages_schema,
  styles_schema,
  is_active,
  created_at,
  updated_at
) VALUES (
  'developer',
  'Developer',
  'Monospaced fonts, dark/light toggle, grid layout',
  'developer',
  ARRAY['technical', 'grid-based', 'code-focused', 'modern', 'precise'],
  ARRAY['Dark Mode', 'Code Syntax', 'Grid Layout', 'Technical Focus'],
  ARRAY['Development', 'Engineering', 'Technology'],
  false,
  true,
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Full-Stack Developer",
            "subheadline": "Building scalable solutions with modern technologies",
            "cta_text": "View Projects",
            "cta_link": "/projects"
          },
          "settings": {
            "alignment": "left",
            "background": "solid",
            "height": "medium"
          },
          "sort_order": 0
        },
        {
          "block_type": "text",
          "content": {
            "text": "I''m a software engineer passionate about building robust, scalable applications. With expertise in modern web technologies, cloud infrastructure, and system architecture, I turn complex problems into elegant solutions. Always learning, always building."
          },
          "settings": {
            "max_width": "900px",
            "text_align": "left"
          },
          "sort_order": 1
        },
        {
          "block_type": "skills",
          "content": {
            "title": "Technologies",
            "skills": [
              {"id": "1", "name": "React", "level": 90, "category": "Frontend"},
              {"id": "2", "name": "Node.js", "level": 85, "category": "Backend"},
              {"id": "3", "name": "TypeScript", "level": 88, "category": "Language"},
              {"id": "4", "name": "PostgreSQL", "level": 80, "category": "Database"}
            ]
          },
          "settings": {
            "layout": "bars",
            "show_level": true,
            "show_category": true
          },
          "sort_order": 2
        },
        {
          "block_type": "project-grid",
          "content": {
            "title": "Recent Projects",
            "limit": 4
          },
          "settings": {
            "layout": "grid",
            "columns": 2,
            "show_excerpt": true,
            "show_tags": true
          },
          "sort_order": 3
        },
        {
          "block_type": "contact-form",
          "content": {
            "title": "Let''s Build Something",
            "description": "Interested in working together?",
            "fields": ["name", "email", "message"],
            "submit_text": "Send",
            "success_message": "Thanks! I''ll get back to you soon."
          },
          "settings": {
            "layout": "centered"
          },
          "sort_order": 4
        }
      ]
    }
  ]'::jsonb,
  '{
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#10B981",
      "accent": "#F59E0B",
      "background": "#0F172A",
      "text": "#F1F5F9",
      "surface": "#1E293B",
      "border": "#334155",
      "textSecondary": "#94A3B8"
    },
    "colors_dark": {
      "primary": "#60A5FA",
      "secondary": "#34D399",
      "accent": "#FBBF24",
      "background": "#0F172A",
      "text": "#F1F5F9",
      "surface": "#1E293B",
      "border": "#334155",
      "textSecondary": "#94A3B8"
    },
    "typography": {
      "headingFont": "JetBrains Mono",
      "bodyFont": "Inter",
      "monoFont": "JetBrains Mono",
      "baseSize": 16,
      "scale": 1.3,
      "lineHeight": 1.6,
      "headingWeight": 700,
      "bodyWeight": 400
    },
    "spacing": {
      "scale": "default",
      "sectionPadding": "80px",
      "containerWidth": "1200px",
      "borderRadius": "8px"
    },
    "effects": {
      "shadows": true,
      "animations": true,
      "animationSpeed": "fast",
      "scrollAnimations": true,
      "hoverEffects": true
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  pages_schema = EXCLUDED.pages_schema,
  styles_schema = EXCLUDED.styles_schema,
  updated_at = NOW();

-- Artist Template
INSERT INTO public.portfolio_templates (
  slug,
  name,
  description,
  category,
  tags,
  features,
  industries,
  is_premium,
  is_featured,
  pages_schema,
  styles_schema,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artist',
  'Artist',
  'Gallery-style layout, emphasis on visuals, minimal text',
  'artist',
  ARRAY['visual', 'gallery-focused', 'aesthetic', 'immersive', 'artistic'],
  ARRAY['Gallery Layout', 'Visual Focus', 'Image Optimization', 'Minimal Text'],
  ARRAY['Photography', 'Art', 'Illustration'],
  false,
  true,
  '[
    {
      "slug": "home",
      "title": "Home",
      "is_homepage": true,
      "blocks": [
        {
          "block_type": "hero",
          "content": {
            "headline": "Visual Artist",
            "subheadline": "Capturing moments and creating visual narratives",
            "cta_text": "View Gallery",
            "cta_link": "/gallery"
          },
          "settings": {
            "alignment": "center",
            "background": "image",
            "height": "full"
          },
          "sort_order": 0
        },
        {
          "block_type": "text",
          "content": {
            "text": "I''m a visual artist exploring the boundaries between reality and imagination. Through photography, illustration, and digital art, I create visual stories that evoke emotion and inspire connection. Each piece is a journey, a moment frozen in time, a story waiting to be told."
          },
          "settings": {
            "max_width": "700px",
            "text_align": "center"
          },
          "sort_order": 1
        },
        {
          "block_type": "gallery",
          "content": {
            "title": "Featured Works",
            "images": []
          },
          "settings": {
            "layout": "masonry",
            "columns": 3,
            "gap": "default"
          },
          "sort_order": 2
        },
        {
          "block_type": "contact-form",
          "content": {
            "title": "Get in Touch",
            "description": "Interested in my work? Let''s connect.",
            "fields": ["name", "email", "message"],
            "submit_text": "Send",
            "success_message": "Thank you! I''ll respond soon."
          },
          "settings": {
            "layout": "centered"
          },
          "sort_order": 3
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
            "subheadline": "A collection of my work"
          },
          "settings": {
            "alignment": "center",
            "background": "solid",
            "height": "small"
          },
          "sort_order": 0
        },
        {
          "block_type": "gallery",
          "content": {
            "title": "All Works",
            "images": []
          },
          "settings": {
            "layout": "masonry",
            "columns": 4,
            "gap": "default"
          },
          "sort_order": 1
        }
      ]
    }
  ]'::jsonb,
  '{
    "colors": {
      "primary": "#8B5CF6",
      "secondary": "#EC4899",
      "accent": "#F59E0B",
      "background": "#FFFFFF",
      "text": "#1F2937",
      "surface": "#F9FAFB",
      "border": "#E5E7EB",
      "textSecondary": "#6B7280"
    },
    "typography": {
      "headingFont": "Playfair Display",
      "bodyFont": "Open Sans",
      "monoFont": "JetBrains Mono",
      "baseSize": 16,
      "scale": 1.4,
      "lineHeight": 1.7,
      "headingWeight": 700,
      "bodyWeight": 400
    },
    "spacing": {
      "scale": "relaxed",
      "sectionPadding": "100px",
      "containerWidth": "1400px",
      "borderRadius": "12px"
    },
    "effects": {
      "shadows": true,
      "animations": true,
      "animationSpeed": "normal",
      "scrollAnimations": true,
      "hoverEffects": true
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  pages_schema = EXCLUDED.pages_schema,
  styles_schema = EXCLUDED.styles_schema,
  updated_at = NOW();
