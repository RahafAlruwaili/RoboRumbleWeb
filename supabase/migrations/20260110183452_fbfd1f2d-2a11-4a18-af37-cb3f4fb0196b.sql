-- Add status and preparation_status columns to teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
ADD COLUMN IF NOT EXISTS preparation_status text DEFAULT 'not_started' CHECK (preparation_status IN ('not_started', 'in_progress', 'completed'));

-- Create scores table for judge evaluations
CREATE TABLE IF NOT EXISTS public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL,
  criteria jsonb NOT NULL DEFAULT '{}',
  total_score integer NOT NULL DEFAULT 0,
  comments text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(team_id, judge_id)
);

-- Enable RLS on scores table
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scores
-- Judges can view scores they created
CREATE POLICY "Judges can view own scores"
ON public.scores
FOR SELECT
USING (auth.uid() = judge_id OR has_role(auth.uid(), 'admin'::app_role));

-- Judges can insert their own scores
CREATE POLICY "Judges can insert scores"
ON public.scores
FOR INSERT
WITH CHECK (
  auth.uid() = judge_id AND 
  (has_role(auth.uid(), 'judge'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Judges can update their own scores
CREATE POLICY "Judges can update own scores"
ON public.scores
FOR UPDATE
USING (
  auth.uid() = judge_id AND 
  (has_role(auth.uid(), 'judge'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Admins can manage all scores
CREATE POLICY "Admins can manage all scores"
ON public.scores
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on scores
CREATE TRIGGER update_scores_updated_at
BEFORE UPDATE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add team_role column to team_members if not exists
ALTER TABLE public.team_members 
DROP COLUMN IF EXISTS role;

ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS team_role text DEFAULT 'member';