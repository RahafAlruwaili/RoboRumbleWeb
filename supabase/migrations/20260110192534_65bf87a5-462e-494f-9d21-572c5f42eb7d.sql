-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own CV
CREATE POLICY "Users can upload their own CV"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own CV
CREATE POLICY "Users can update their own CV"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own CV
CREATE POLICY "Users can delete their own CV"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view CVs (public bucket)
CREATE POLICY "Anyone can view CVs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'cvs');

-- Add new robotics-specific columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS robotics_experience text,
ADD COLUMN IF NOT EXISTS has_programmed_robot text,
ADD COLUMN IF NOT EXISTS autonomous_logic_exp text,
ADD COLUMN IF NOT EXISTS circuit_reading_exp text,
ADD COLUMN IF NOT EXISTS mechanical_work_exp text,
ADD COLUMN IF NOT EXISTS manual_control_exp text,
ADD COLUMN IF NOT EXISTS competitive_activities text;