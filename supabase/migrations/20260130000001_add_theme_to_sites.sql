-- Add theme column to sites table
-- Migration: Add theme customization support

ALTER TABLE sites ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{
  "colors": {
    "primary": "#6366F1",
    "secondary": "#8B5CF6",
    "background": "#FFFFFF",
    "surface": "#F9FAFB",
    "text": "#111827",
    "textMuted": "#6B7280"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  }
}'::jsonb;

-- Add index for faster theme queries
CREATE INDEX IF NOT EXISTS idx_sites_theme ON sites USING GIN (theme);

-- Comment
COMMENT ON COLUMN sites.theme IS 'Theme customization settings including colors, fonts, and logo';
