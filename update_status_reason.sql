-- 1. Add status_reason column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_reason TEXT;

-- 2. Update admin_update_user_status RPC to accept and store reason
CREATE OR REPLACE FUNCTION admin_update_user_status(target_user_id UUID, new_status VARCHAR, reason TEXT DEFAULT NULL)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET account_status = new_status,
      status_reason = reason
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Update admin_delete_user RPC to soft-delete with reason
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID, reason TEXT DEFAULT NULL)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  -- Perform a soft delete rather than a hard delete
  UPDATE users 
  SET account_status = 'DELETED',
      status_reason = reason
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql;
