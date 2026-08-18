ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_last_active()
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    UPDATE users SET last_active_at = NOW() WHERE id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS INTEGER
SECURITY DEFINER
AS $$
DECLARE
  online_count INTEGER;
BEGIN
  -- Consider anyone who has pinged in the last 5 minutes as 'online'
  SELECT count(*) INTO online_count FROM users WHERE last_active_at > NOW() - INTERVAL '5 minutes';
  RETURN online_count;
END;
$$ LANGUAGE plpgsql;
