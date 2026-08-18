-- Drop the existing function first because we are changing the return signature
DROP FUNCTION IF EXISTS get_admin_reports();

-- Recreate with the target user ID included
CREATE OR REPLACE FUNCTION get_admin_reports()
RETURNS TABLE (
  id UUID,
  reporter_nickname TEXT,
  reported_user_id UUID,
  reported_user_nickname TEXT,
  reported_job_id UUID,
  reported_job_title TEXT,
  reason TEXT,
  details TEXT,
  status report_status,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    r.id,
    u1.nickname AS reporter_nickname,
    r.reported_user_id,
    u2.nickname AS reported_user_nickname,
    r.reported_job_id,
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
