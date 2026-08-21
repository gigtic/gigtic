CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
DECLARE
    v_total_reviews INTEGER;
    v_avg_rating FLOAT;
    v_new_trust_score INTEGER;
    v_target_id UUID;
BEGIN
    v_target_id := COALESCE(NEW.reviewee_id, OLD.reviewee_id);

    SELECT COUNT(*), COALESCE(AVG(rating), 0) INTO v_total_reviews, v_avg_rating
    FROM reviews WHERE reviewee_id = v_target_id;

    IF v_total_reviews > 0 THEN
        v_new_trust_score := ROUND((v_avg_rating - 1.0) * 25.0);
        IF v_new_trust_score > 100 THEN v_new_trust_score := 100; END IF;
        IF v_new_trust_score < 0 THEN v_new_trust_score := 0; END IF;
        UPDATE users SET trust_score = v_new_trust_score WHERE id = v_target_id;
    ELSE
        UPDATE users SET trust_score = 0 WHERE id = v_target_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_trust_score ON reviews;

CREATE TRIGGER trigger_update_trust_score
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can insert reviews for jobs they are part of'
    ) THEN
        CREATE POLICY "Users can insert reviews for jobs they are part of"
        ON reviews FOR INSERT
        TO authenticated
        WITH CHECK (
            reviewer_id = auth.uid() AND
            EXISTS (
                SELECT 1 FROM jobs
                WHERE id = job_id AND (client_id = auth.uid() OR freelancer_id = auth.uid())
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Admins can delete reviews'
    ) THEN
        CREATE POLICY "Admins can delete reviews"
        ON reviews FOR DELETE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM admins WHERE id = auth.uid()
            )
        );
    END IF;
END $$;
