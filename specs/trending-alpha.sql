-- Trending Alpha Query for LamboMoon
-- Fetches top crypto opportunities based on upvotes, recency, and price momentum

-- Main query: Get trending alphas
SELECT
  id,
  name,
  symbol,
  category,
  description,
  price,
  change_24h,
  market_cap,
  launch_date,
  upvotes,
  featured,
  -- Calculate trend score based on upvotes + recent momentum
  (
    upvotes * 1.0 + 
    CASE WHEN change_24h > 0 THEN change_24h * 10 ELSE change_24h * 2 END +
    CASE WHEN launch_date > CURRENT_DATE - INTERVAL '30 days' THEN 50 ELSE 0 END
  ) AS trend_score
FROM projects
WHERE 
  -- Exclude very small caps to filter noise
  market_cap > 50000
ORDER BY 
  trend_score DESC,
  upvotes DESC
LIMIT 10;

-- Alternative: Simple version for homepage (just upvotes + featured)
SELECT
  id,
  name,
  symbol,
  category,
  description,
  price,
  change_24h,
  market_cap,
  launch_date,
  upvotes,
  featured
FROM projects
ORDER BY 
  featured DESC,  -- Featured first
  upvotes DESC,    -- Then by upvotes
  change_24h DESC  -- Then by momentum
LIMIT 6;

-- View for easier querying (run once to create)
CREATE OR REPLACE VIEW trending_alpha_view AS
SELECT
  id,
  name,
  symbol,
  category,
  description,
  price,
  change_24h,
  market_cap,
  launch_date,
  upvotes,
  featured,
  ROW_NUMBER() OVER (ORDER BY upvotes DESC, change_24h DESC) AS rank
FROM projects
WHERE market_cap > 50000;

-- Then query the view:
-- SELECT * FROM trending_alpha_view ORDER BY rank LIMIT 6;