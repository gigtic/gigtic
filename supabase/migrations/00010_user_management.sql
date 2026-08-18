-- Add account_status column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR DEFAULT 'ACTIVE';

-- Create RPC to update user status
CREATE OR REPLACE FUNCTION admin_update_user_status(target_user_id UUID, new_status VARCHAR)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users SET account_status = new_status WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create RPC to delete a user's public profile
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;
