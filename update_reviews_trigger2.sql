DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can insert reviews for jobs they are part of" ON reviews;
    
    CREATE POLICY "Users can insert reviews for jobs they are part of"
    ON reviews FOR INSERT
    TO authenticated
    WITH CHECK (
        reviewer_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM jobs
            WHERE id = job_id AND (requester_id = auth.uid() OR provider_id = auth.uid())
        )
    );
END $$;
