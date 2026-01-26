-- Database migration to add default pipeline stages for new users
-- and backfill stages for existing users who have none

-- 1. Create a function to insert default stages
CREATE OR REPLACE FUNCTION public.create_default_crm_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default pipeline stages
  -- Stages: Lead (10%), Contact Made (20%), Needs Defined (40%), Proposal Made (60%), Negotiation Started (80%)
  INSERT INTO public.pipeline_stages (user_id, name, sort_order, probability, is_won, is_lost, color)
  VALUES
    (NEW.id, 'Lead', 0, 10, FALSE, FALSE, '#94a3b8'),
    (NEW.id, 'Contact Made', 1, 20, FALSE, FALSE, '#60a5fa'),
    (NEW.id, 'Needs Defined', 2, 40, FALSE, FALSE, '#818cf8'),
    (NEW.id, 'Proposal Made', 3, 60, FALSE, FALSE, '#a78bfa'),
    (NEW.id, 'Negotiation Started', 4, 80, FALSE, FALSE, '#e879f9');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a trigger that runs after a profile is inserted
-- We attach to public.profiles because that's where the user entity is firmly established
DROP TRIGGER IF EXISTS on_profile_created_crm_defaults ON public.profiles;

CREATE TRIGGER on_profile_created_crm_defaults
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_crm_setup();

-- 3. Backfill for existing users (Merge defaults)
-- This ensures everyone gets the default stages if they are missing them
INSERT INTO public.pipeline_stages (user_id, name, sort_order, probability, is_won, is_lost, color)
SELECT p.id, s.name, s.sort_order, s.probability, FALSE, FALSE, s.color
FROM public.profiles p
CROSS JOIN (
  VALUES
    ('Lead', 0, 10, '#94a3b8'),
    ('Contact Made', 1, 20, '#60a5fa'),
    ('Needs Defined', 2, 40, '#818cf8'),
    ('Proposal Made', 3, 60, '#a78bfa'),
    ('Negotiation Started', 4, 80, '#e879f9')
) AS s(name, sort_order, probability, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.pipeline_stages ps 
  WHERE ps.user_id = p.id AND ps.name = s.name
);
