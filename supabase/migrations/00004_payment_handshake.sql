-- RPC to handle the 2-step payment handshake securely
CREATE OR REPLACE FUNCTION process_payment_handshake(p_job_id UUID, p_user_id UUID)
RETURNS json AS $$
DECLARE
    v_job jobs%ROWTYPE;
BEGIN
    -- Get current job state securely (for update to avoid race conditions)
    SELECT * INTO v_job FROM jobs WHERE id = p_job_id FOR UPDATE;

    IF v_job.id IS NULL THEN
        RAISE EXCEPTION 'Job not found';
    END IF;

    IF v_job.status != 'IN_PROGRESS' THEN
        RAISE EXCEPTION 'Job must be IN_PROGRESS to perform handshake';
    END IF;

    -- If requester is clicking
    IF v_job.requester_id = p_user_id THEN
        UPDATE jobs SET requester_marked_paid = TRUE WHERE id = p_job_id;
        v_job.requester_marked_paid := TRUE;
    -- If provider is clicking
    ELSIF v_job.provider_id = p_user_id THEN
        UPDATE jobs SET provider_marked_received = TRUE WHERE id = p_job_id;
        v_job.provider_marked_received := TRUE;
    ELSE
        RAISE EXCEPTION 'User is not part of this job';
    END IF;

    -- Check if both sides have completed the handshake
    IF v_job.requester_marked_paid = TRUE AND v_job.provider_marked_received = TRUE THEN
        UPDATE jobs 
        SET 
            status = 'COMPLETED',
            completed_at = NOW()
        WHERE id = p_job_id;
        
        RETURN json_build_object(
            'success', true, 
            'status', 'COMPLETED', 
            'message', 'Job completed. 7-day privacy timer started.'
        );
    END IF;

    RETURN json_build_object(
        'success', true, 
        'status', 'IN_PROGRESS', 
        'message', 'Handshake step recorded. Waiting for the other party.'
    );
END;
$$ LANGUAGE plpgsql;
