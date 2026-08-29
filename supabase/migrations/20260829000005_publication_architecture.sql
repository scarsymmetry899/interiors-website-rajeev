-- Enhanced Publication Architecture Migration

-- 1. Asset Lineage (Master -> Derivative)
ALTER TABLE project_assets 
ADD COLUMN source_asset_id UUID REFERENCES project_assets(id) ON DELETE SET NULL;

-- 2. Asset Publication Intent
ALTER TABLE project_assets 
ADD COLUMN publication_intent TEXT DEFAULT 'internal' CHECK (publication_intent IN ('internal', 'portfolio_candidate'));

-- 3. Project Publication Consent
ALTER TABLE projects 
ADD COLUMN publication_consent_status TEXT DEFAULT 'pending' CHECK (publication_consent_status IN ('pending', 'granted', 'denied', 'revoked'));
