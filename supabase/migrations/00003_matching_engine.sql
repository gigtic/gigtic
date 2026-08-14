-- Create the matching engine RPC function
CREATE OR REPLACE FUNCTION get_explore_feed(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    requester_nickname TEXT,
    requester_trust_score INTEGER,
    title TEXT,
    category TEXT,
    description TEXT,
    service_mode service_mode,
    budget_amount DECIMAL,
    is_urgent BOOLEAN,
    distance_km FLOAT
) AS $$
DECLARE
    v_user_location GEOGRAPHY(POINT);
    v_user_radius_km INTEGER;
    v_user_gender user_gender;
    v_is_anywhere BOOLEAN;
BEGIN
    -- Fetch the current user's profile and preferences
    SELECT default_location, default_radius_km, gender, is_anywhere_default
    INTO v_user_location, v_user_radius_km, v_user_gender, v_is_anywhere
    FROM users
    WHERE users.id = p_user_id;

    RETURN QUERY
    SELECT 
        j.id,
        CASE WHEN j.is_incognito THEN 'Anonymous Student' ELSE u.nickname END AS requester_nickname,
        u.trust_score AS requester_trust_score,
        j.title,
        j.category,
        j.description,
        j.service_mode,
        j.budget_amount,
        j.is_urgent,
        -- Calculate distance in KM, or 0 if Digital/Anywhere
        CASE 
            WHEN j.service_mode = 'Physical' AND j.location IS NOT NULL AND v_user_location IS NOT NULL THEN
                ST_Distance(j.location, v_user_location) / 1000.0
            ELSE 0.0
        END AS distance_km
    FROM jobs j
    JOIN users u ON j.requester_id = u.id
    WHERE j.status = 'OPEN'
      AND j.requester_id != p_user_id -- Don't show own jobs
      -- Handle Women-Only toggle
      AND (j.is_women_only = FALSE OR (j.is_women_only = TRUE AND v_user_gender = 'Female'))
      -- Handle Geographic Matching
      AND (
          j.service_mode = 'Digital' 
          OR 
          (
              j.service_mode = 'Physical' 
              AND j.location IS NOT NULL 
              AND v_user_location IS NOT NULL
              -- Use ST_DWithin for spatial index optimization and COALESCE to prevent NULL failures
              AND ST_DWithin(j.location, v_user_location, COALESCE(j.radius_km, 5) * 1000)
              AND (
                  v_is_anywhere = TRUE OR 
                  ST_DWithin(j.location, v_user_location, COALESCE(v_user_radius_km, 5) * 1000)
              )
          )
      )
    ORDER BY 
        j.is_urgent DESC, -- Urgent jobs bubble to the top
        u.trust_score DESC, -- Higher trust score ranks higher
        distance_km ASC; -- Closer jobs rank higher
END;
$$ LANGUAGE plpgsql;
