-- Rate Limiting Infrastructure
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_ip_action_time ON rate_limits(ip_hash, action, created_at);

-- Grant privileges
GRANT ALL PRIVILEGES ON TABLE rate_limits TO postgres, anon, authenticated, service_role;

-- RPC for atomic rate limiting
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
    -- Cleanup strategy: Prune records older than 24 hours to prevent unbounded table growth.
    -- Done inline for simplicity in low-traffic environments. 
    -- Alternatively, could be a pg_cron job in high-traffic environments.
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

-- Grant execute
REVOKE EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INT, INTERVAL) FROM public;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INT, INTERVAL) TO anon, authenticated, service_role;
