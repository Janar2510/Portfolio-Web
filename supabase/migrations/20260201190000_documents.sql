-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled',
    content JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own documents" ON documents
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON documents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE
    USING (auth.uid() = user_id);

-- Project visibility (if part of a project, project members should see it - simple version for now: owner only or public)
-- ToDo: Add project member policies later.

-- Indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
