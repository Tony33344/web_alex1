-- Enable RLS on program_enrollments
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own enrollments" ON program_enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON program_enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON program_enrollments;

-- Create policies for program_enrollments
CREATE POLICY "Users can view their own enrollments" ON program_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create enrollments" ON program_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage enrollments" ON program_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
