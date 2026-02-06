-- Update check constraint for related_type in task_relations
ALTER TABLE task_relations DROP CONSTRAINT IF EXISTS task_relations_related_type_check;

ALTER TABLE task_relations 
    ADD CONSTRAINT task_relations_related_type_check 
    CHECK (related_type IN ('contact', 'organization', 'lead', 'email'));
