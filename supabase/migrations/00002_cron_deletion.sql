-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to delete old jobs and their associated data (messages, images)
CREATE OR REPLACE FUNCTION delete_completed_jobs_older_than_7_days()
RETURNS void AS $$
BEGIN
    -- Delete from jobs where status is COMPLETED and completed_at is older than 7 days
    -- Due to ON DELETE CASCADE (or similar relations to be set up), this will also delete associated messages.
    DELETE FROM jobs
    WHERE status = 'COMPLETED'
      AND completed_at < NOW() - INTERVAL '7 days';
      
    -- Note: We will need a separate Supabase Storage webhook or Edge Function
    -- to actually delete the image files from Cloudflare R2 / Supabase Storage
    -- since SQL cannot directly delete from external storage.
END;
$$ LANGUAGE plpgsql;

-- Schedule the cron job to run daily at midnight
SELECT cron.schedule(
    'delete_old_jobs_daily',
    '0 0 * * *', -- Every day at midnight
    'SELECT delete_completed_jobs_older_than_7_days();'
);
