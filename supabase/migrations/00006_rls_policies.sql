-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- USERS Table Policies
-- 1. Users can read all other users' public profiles
CREATE POLICY "Users can view all profiles"
ON users FOR SELECT
USING (true);

-- 2. Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- 3. Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- JOBS Table Policies
-- 1. Anyone can view OPEN jobs (or you could restrict to authenticated only)
CREATE POLICY "Anyone can view open jobs"
ON jobs FOR SELECT
USING (status = 'OPEN' OR auth.uid() = requester_id OR auth.uid() = provider_id);

-- 2. Requesters can create jobs
CREATE POLICY "Users can create jobs"
ON jobs FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- 3. Requesters can update their own OPEN jobs
CREATE POLICY "Requesters can update own open jobs"
ON jobs FOR UPDATE
USING (auth.uid() = requester_id AND status = 'OPEN');

-- REVIEWS Table Policies
-- 1. Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
USING (true);

-- 2. Users can insert reviews if they were part of the job and it is COMPLETED
CREATE POLICY "Users can insert reviews for completed jobs"
ON reviews FOR INSERT
WITH CHECK (
    auth.uid() = reviewer_id 
    AND EXISTS (
        SELECT 1 FROM jobs 
        WHERE id = job_id 
        AND status = 'COMPLETED' 
        AND (requester_id = auth.uid() OR provider_id = auth.uid())
    )
);
