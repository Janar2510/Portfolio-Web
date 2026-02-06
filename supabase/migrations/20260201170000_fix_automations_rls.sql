-- Enable RLS on automations if not already
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view automations for projects they have access to
DROP POLICY IF EXISTS "Users can view automations" ON automations;
CREATE POLICY "Users can view automations" ON automations
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy: Users can create/edit automations
DROP POLICY IF EXISTS "Users can manage automations" ON automations;
CREATE POLICY "Users can manage automations" ON automations
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Seed a test automation rule if none exists
-- We use a CTE to find a valid user ID (either current auth.uid() or the first user in the system)
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT COALESCE(auth.uid(), (SELECT id FROM auth.users LIMIT 1)) INTO target_user_id;

    IF target_user_id IS NOT NULL THEN
        INSERT INTO automations (
            user_id,
            name,
            description,
            trigger_type,
            trigger_config,
            action_type,
            action_config,
            is_active,
            project_id
        )
        SELECT
            target_user_id,
            'Test Rule: Move to Done -> Celebrate',
            'Auto-generated test rule',
            'task.status_changed',
            '{"status_id": "done"}',
            'task.create_subtasks',
            '{"subtasks": ["Celebrate Success"]}',
            true,
            NULL
        WHERE NOT EXISTS (SELECT 1 FROM automations LIMIT 1);
    ELSE
        RAISE NOTICE 'No user found to assign automation to. Skipping seed.';
    END IF;
END $$;
