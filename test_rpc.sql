CREATE OR REPLACE FUNCTION debug_dist()
RETURNS TABLE(job_id UUID, dist_m FLOAT, job_rad INT, usr_rad INT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id, 
        ST_Distance(j.location, u.default_location) AS dist_m,
        j.radius_km,
        u.default_radius_km
    FROM jobs j
    CROSS JOIN users u
    WHERE u.username = '@vini';
END;
$$ LANGUAGE plpgsql;
