-- Update RPC to include cleanup
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ip_hash TEXT,
    p_action TEXT,
    p_max_requests INT,
    p_window_interval INTERVAL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    request_count INT;
BEGIN
    -- Cleanup strategy: Prune records older than 24 hours
    DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '24 hours';

    -- Count recent requests
    SELECT COUNT(*)
    INTO request_count
    FROM rate_limits
    WHERE ip_hash = p_ip_hash
      AND action = p_action
      AND created_at >= NOW() - p_window_interval;
      
    IF request_count >= p_max_requests THEN
        RETURN FALSE; -- Rate limited (Blocked)
    END IF;
    
    -- Log new request
    INSERT INTO rate_limits (ip_hash, action) VALUES (p_ip_hash, p_action);
    
    RETURN TRUE; -- Allowed
END;
$$;
