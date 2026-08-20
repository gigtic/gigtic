-- 1. Drop existing conflicting policies
DROP POLICY IF EXISTS "Requesters can update own open jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update jobs" ON jobs;

-- 2. Create the new correct policy
CREATE POLICY "Users can update jobs" ON jobs FOR UPDATE 
USING (
    auth.uid() = requester_id 
    OR 
    auth.uid() = provider_id
)
WITH CHECK (
    -- The requester can update anything on their gig
    auth.uid() = requester_id
    OR 
    -- The provider can only drop the gig (ABANDONED) or update the handshake (IN_PROGRESS)
    (auth.uid() = provider_id AND (status = 'ABANDONED' OR status = 'IN_PROGRESS' OR status = 'COMPLETED'))
);
