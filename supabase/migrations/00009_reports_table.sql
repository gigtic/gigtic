-- Enum for report status
CREATE TYPE report_status AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- Table for user-generated reports and issues
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports
CREATE POLICY "Users can insert reports"
ON reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Admins can read all reports (bypassed via Service Key or if we add a read policy, 
-- but since admin uses anon key currently, we need a policy for admins, 
-- or we can just allow anyone to read reports they created, and admins to read all)
CREATE POLICY "Users can view own reports"
ON reports FOR SELECT
USING (auth.uid() = reporter_id);

-- For the admin dashboard to see reports using the anon key, 
-- we will create a SECURITY DEFINER function to fetch them securely
CREATE OR REPLACE FUNCTION get_admin_reports()
RETURNS TABLE (
  id UUID,
  reporter_nickname TEXT,
  reported_user_nickname TEXT,
  reported_job_title TEXT,
  reason TEXT,
  details TEXT,
  status report_status,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Assuming the caller is authorized (checked in application layer)
  RETURN QUERY 
  SELECT 
    r.id,
    u1.nickname AS reporter_nickname,
    u2.nickname AS reported_user_nickname,
    j.title AS reported_job_title,
    r.reason,
    r.details,
    r.status,
    r.created_at
  FROM reports r
  LEFT JOIN users u1 ON r.reporter_id = u1.id
  LEFT JOIN users u2 ON r.reported_user_id = u2.id
  LEFT JOIN jobs j ON r.reported_job_id = j.id
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;
