-- Add new columns to profiles table for complete profile data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS university_id text,
ADD COLUMN IF NOT EXISTS university text,
ADD COLUMN IF NOT EXISTS cv_link text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS technical_skills text[],
ADD COLUMN IF NOT EXISTS personal_skills text[],
ADD COLUMN IF NOT EXISTS can_commit boolean,
ADD COLUMN IF NOT EXISTS goals text,
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;