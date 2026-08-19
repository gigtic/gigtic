-- Strictly limit who can add/remove admins
CREATE OR REPLACE FUNCTION add_admin(new_email text)
RETURNS void
SECURITY DEFINER AS $$
DECLARE
  caller_email text;
BEGIN
  caller_email := auth.jwt()->>'email';
  
  -- ONLY Master Admins can add new admins
  IF caller_email NOT IN ('vineethbpawar@gmail.com', 'keepsmilling64@gmail.com', 'unigig.official@gmail.com') THEN 
    RAISE EXCEPTION 'Only Super Admins can add new admins'; 
  END IF;
  
  INSERT INTO admin_whitelist (email, added_by) VALUES (lower(new_email), auth.uid()) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_admin(target_email text)
RETURNS void
SECURITY DEFINER AS $$
DECLARE
  caller_email text;
BEGIN
  caller_email := auth.jwt()->>'email';
  
  -- ONLY Master Admins can remove admins
  IF caller_email NOT IN ('vineethbpawar@gmail.com', 'keepsmilling64@gmail.com', 'unigig.official@gmail.com') THEN 
    RAISE EXCEPTION 'Only Super Admins can remove admins'; 
  END IF;
  
  DELETE FROM admin_whitelist WHERE email = lower(target_email);
END;
$$ LANGUAGE plpgsql;
