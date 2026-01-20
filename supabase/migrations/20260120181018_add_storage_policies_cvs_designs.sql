-- Create storage policies for cvs bucket to allow team members to upload designs

-- Policy for authenticated users to upload to designs folder
CREATE POLICY "Authenticated users can upload designs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' 
  AND (storage.foldername(name))[1] = 'designs'
);

-- Policy for authenticated users to read designs
CREATE POLICY "Authenticated users can read designs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' 
  AND (storage.foldername(name))[1] = 'designs'
);

-- Policy for authenticated users to delete their team's designs
CREATE POLICY "Authenticated users can delete designs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' 
  AND (storage.foldername(name))[1] = 'designs'
);