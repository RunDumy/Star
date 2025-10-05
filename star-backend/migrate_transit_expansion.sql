-- Migration script for expanded transit mappings
-- Ensure user_interactions table can handle expanded transit data

-- Add index for faster transit lookups
CREATE INDEX IF NOT EXISTS idx_user_interactions_transit
ON user_interactions USING gin ((details->'transit'));

-- Add index for zodiac sign filtering
CREATE INDEX IF NOT EXISTS idx_user_interactions_zodiac_sign
ON user_interactions(zodiac_sign);

-- Add function to get user's transit history
CREATE OR REPLACE FUNCTION get_user_transit_history(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    transit_name TEXT,
    zodiac_sign TEXT,
    trait_name TEXT,
    viewed_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ui.details->>'transit' as transit_name,
        ui.zodiac_sign,
        zd.trait_name,
        ui.created_at as viewed_at
    FROM user_interactions ui
    JOIN zodiac_dna zd ON ui.user_id = zd.user_id AND ui.zodiac_sign = zd.zodiac_sign
    WHERE ui.user_id = user_uuid
    AND ui.interaction_type = 'transit_view'
    ORDER BY ui.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add function to calculate transit engagement score
CREATE OR REPLACE FUNCTION calculate_transit_engagement(user_uuid UUID)
RETURNS FLOAT AS $$
DECLARE
    total_transits INTEGER;
    unique_transits INTEGER;
    engagement_score FLOAT;
BEGIN
    -- Count total transit views
    SELECT COUNT(*) INTO total_transits
    FROM user_interactions
    WHERE user_id = user_uuid AND interaction_type = 'transit_view';

    -- Count unique transits viewed
    SELECT COUNT(DISTINCT details->>'transit') INTO unique_transits
    FROM user_interactions
    WHERE user_id = user_uuid AND interaction_type = 'transit_view';

    -- Calculate engagement score (0-1)
    IF total_transits = 0 THEN
        engagement_score := 0;
    ELSE
        engagement_score := LEAST(unique_transits::FLOAT / 16, 1.0); -- 16 total transits
    END IF;

    RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;