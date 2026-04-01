-- Add editorial control fields for discovery curation
ALTER TABLE cryptos ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE cryptos ADD COLUMN IF NOT EXISTS is_discoverable BOOLEAN DEFAULT TRUE;
ALTER TABLE cryptos ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE cryptos ADD COLUMN IF NOT EXISTS listing_tier TEXT;

-- Constrain listing_tier to known values when present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cryptos_listing_tier_check'
  ) THEN
    ALTER TABLE cryptos
      ADD CONSTRAINT cryptos_listing_tier_check
      CHECK (listing_tier IN ('major', 'midcap', 'emerging', 'prelaunch') OR listing_tier IS NULL);
  END IF;
END $$;

-- Helpful indexes for discovery and curation flows
CREATE INDEX IF NOT EXISTS idx_cryptos_discovery_controls
  ON cryptos (is_hidden, is_discoverable, is_featured, listing_tier);

CREATE INDEX IF NOT EXISTS idx_cryptos_status_source_rank
  ON cryptos (status, source, market_cap_rank);
