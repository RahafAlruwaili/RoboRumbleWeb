-- Fix team status CHECK constraint to allow 'approved' and 'final_approved'
-- The frontend uses 'approved' and 'final_approved' but the original constraint only allowed 'pending', 'accepted', 'rejected'

-- First, drop the existing constraint
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_status_check;

-- Add the new constraint with correct values
ALTER TABLE public.teams 
ADD CONSTRAINT teams_status_check 
CHECK (status IN ('pending', 'approved', 'final_approved', 'rejected'));

-- Update any existing 'accepted' values to 'approved' (in case there are any)
UPDATE public.teams SET status = 'approved' WHERE status = 'accepted';

-- Add team_code column for easy team joining
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS team_code TEXT UNIQUE;

-- Create function to generate random alphanumeric team codes
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate codes for existing teams that don't have one
UPDATE public.teams 
SET team_code = generate_team_code() 
WHERE team_code IS NULL;

-- Create trigger to auto-generate team_code on insert
CREATE OR REPLACE FUNCTION set_team_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.team_code IS NULL THEN
    NEW.team_code := generate_team_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS team_code_trigger ON public.teams;
CREATE TRIGGER team_code_trigger
BEFORE INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION set_team_code();
