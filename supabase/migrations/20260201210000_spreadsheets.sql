-- Create spreadsheets table
CREATE TABLE IF NOT EXISTS spreadsheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Spreadsheet',
    columns JSONB DEFAULT '[]'::jsonb,
    rows JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE spreadsheets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own spreadsheets" ON spreadsheets
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spreadsheets" ON spreadsheets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spreadsheets" ON spreadsheets
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spreadsheets" ON spreadsheets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_spreadsheets_user_id ON spreadsheets(user_id);
CREATE INDEX idx_spreadsheets_project_id ON spreadsheets(project_id);
