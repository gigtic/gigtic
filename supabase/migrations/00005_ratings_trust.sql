-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    feedback_tags TEXT[], -- e.g., 'Fast Delivery', 'Quality Work'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, reviewer_id) -- Prevent duplicate ratings per job
);

-- Function to recalculate Trust Score
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
DECLARE
    v_total_reviews INTEGER;
    v_avg_rating FLOAT;
    v_new_trust_score INTEGER;
BEGIN
    -- Calculate average rating
    SELECT COUNT(*), AVG(rating) 
    INTO v_total_reviews, v_avg_rating
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id;

    -- Basic Trust Score Algorithm (0-100)
    -- Start at baseline 50, scale up to 100 based on rating
    -- 5 stars = 100, 1 star = 0
    IF v_total_reviews > 0 THEN
        v_new_trust_score := ROUND((v_avg_rating - 1.0) * 25.0);
        
        -- Cap between 0 and 100
        IF v_new_trust_score > 100 THEN v_new_trust_score := 100; END IF;
        IF v_new_trust_score < 0 THEN v_new_trust_score := 0; END IF;

        UPDATE users 
        SET trust_score = v_new_trust_score
        WHERE id = NEW.reviewee_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to fire after a new review
CREATE TRIGGER trigger_update_trust_score
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();
