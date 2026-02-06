-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'assignment', 'mention', 'system', 'due_date'
    title TEXT NOT NULL,
    message TEXT,
    entity_type VARCHAR(50), -- 'task', 'project', 'comment'
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Check if we need a policy for creation. 
-- Usually system creates them, or other users when triggering actions.
-- Let's allow authenticated users to insert notifications for ANY user for now (e.g. assigning a task)
-- effectively "Users can send notifications"
CREATE POLICY "Users can create notifications" ON notifications
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
