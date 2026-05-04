-- Create a storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read PDFs
CREATE POLICY "Public PDF Access"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'pdfs');

-- Allow authenticated users to upload PDFs
CREATE POLICY "Authenticated PDF Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdfs');

-- Allow authenticated users to update PDFs
CREATE POLICY "Authenticated PDF Update"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'pdfs');

-- Allow authenticated users to delete PDFs
CREATE POLICY "Authenticated PDF Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pdfs');
