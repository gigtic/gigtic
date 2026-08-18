-- Function to get the real database size
CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS TABLE (
  db_size_bytes bigint,
  db_size_pretty text,
  total_files bigint,
  storage_bytes bigint
) 
SECURITY DEFINER
AS $$
DECLARE
  db_size bigint;
  db_pretty text;
  files_count bigint;
  storage_size bigint;
BEGIN
  -- Check if the user is authorized (optional, assuming RLS or admin frontend gates it, but let's be safe)
  -- For now, we return it to anyone who knows the RPC, or we can restrict it.
  
  -- 1. Get database size
  SELECT pg_database_size(current_database()) INTO db_size;
  SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_pretty;

  -- 2. Get Supabase storage stats (gig-images bucket)
  -- If you have multiple buckets, this counts them all inside the storage schema
  SELECT count(*), COALESCE(sum((metadata->>'size')::bigint), 0)
  INTO files_count, storage_size
  FROM storage.objects;

  RETURN QUERY SELECT db_size, db_pretty, files_count, storage_size;
END;
$$ LANGUAGE plpgsql;
