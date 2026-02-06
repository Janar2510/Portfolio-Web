-- Create mind_maps table
CREATE TABLE IF NOT EXISTS mind_maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Mind Map',
    nodes JSONB DEFAULT '[]'::jsonb,
    edges JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own mind maps" ON mind_maps
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mind maps" ON mind_maps
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mind maps" ON mind_maps
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind maps" ON mind_maps
    FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_mind_maps_user_id ON mind_maps(user_id);
CREATE INDEX idx_mind_maps_project_id ON mind_maps(project_id);
