CREATE TABLE IF NOT EXISTS admin_whitelist (
  email text PRIMARY KEY,
  added_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Insert the known admin
INSERT INTO admin_whitelist (email) VALUES ('keepsmilling64@gmail.com') ON CONFLICT DO NOTHING;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
DECLARE
  caller_email text;
BEGIN
  caller_email := auth.jwt()->>'email';
  
  -- Master fallback (Exact match only for extreme security)
  IF caller_email IN ('vineethbpawar@gmail.com', 'keepsmilling64@gmail.com', 'unigig.official@gmail.com') THEN
    RETURN true;
  END IF;
  
  -- Check whitelist
  RETURN EXISTS (SELECT 1 FROM admin_whitelist WHERE email = lower(caller_email));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expose simple boolean check for the frontend
CREATE OR REPLACE FUNCTION check_admin_access() RETURNS boolean
SECURITY DEFINER AS $$
BEGIN
  RETURN is_admin();
END;
$$ LANGUAGE plpgsql;

-- Fetch list of admins
CREATE OR REPLACE FUNCTION get_admin_whitelist()
RETURNS TABLE(email text, created_at timestamptz)
SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY SELECT w.email, w.created_at FROM admin_whitelist w ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Add a new admin
CREATE OR REPLACE FUNCTION add_admin(new_email text)
RETURNS void
SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  INSERT INTO admin_whitelist (email, added_by) VALUES (lower(new_email), auth.uid()) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Remove an admin
CREATE OR REPLACE FUNCTION remove_admin(target_email text)
RETURNS void
SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  DELETE FROM admin_whitelist WHERE email = lower(target_email);
END;
$$ LANGUAGE plpgsql;
