-- Create task_relations table
CREATE TABLE IF NOT EXISTS task_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    related_type TEXT NOT NULL CHECK (related_type IN ('contact', 'organization', 'lead')),
    related_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, related_type, related_id)
);

-- Enable RLS
ALTER TABLE task_relations ENABLE ROW LEVEL SECURITY;

-- Policies
-- We assume if you can see the task, you can see its relations. 
-- For simplicity in this phase, we'll allow authenticated users to view/manage relations 
-- (assuming project/crm access logic handles the entities themselves).

CREATE POLICY "Users can view task relations" ON task_relations
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage task relations" ON task_relations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Indexes
CREATE INDEX idx_task_relations_task_id ON task_relations(task_id);
CREATE INDEX idx_task_relations_related_id ON task_relations(related_id);
