-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Only requester and provider of the job can read/write messages
CREATE POLICY "Users can read job messages"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM jobs 
        WHERE id = job_id 
        AND (requester_id = auth.uid() OR provider_id = auth.uid())
    )
);

CREATE POLICY "Users can insert job messages"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
        SELECT 1 FROM jobs 
        WHERE id = job_id 
        AND (requester_id = auth.uid() OR provider_id = auth.uid())
        AND status != 'COMPLETED'
        AND status != 'DELETED'
    )
);
