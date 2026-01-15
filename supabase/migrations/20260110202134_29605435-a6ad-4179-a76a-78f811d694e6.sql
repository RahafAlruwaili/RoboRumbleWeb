-- Add unique constraint on user_id to prevent joining multiple teams
ALTER TABLE public.team_members 
ADD CONSTRAINT team_members_user_id_unique UNIQUE (user_id);