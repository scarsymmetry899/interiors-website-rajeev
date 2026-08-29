-- Initial Schema for Interior Design Studio OS (Phase 1)
-- Requires uuid-ossp extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Multi-tenant foundation)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Projects (Internal Business Entity)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'proposal', 'active', 'completed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_organization_id ON projects(organization_id);

-- 3. Project Rooms
CREATE TABLE project_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    room_type TEXT,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, slug)
);
CREATE INDEX idx_project_rooms_project_id_order ON project_rooms(project_id, display_order);

-- 4. Project Assets (Storage-Aware)
CREATE TABLE project_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    room_id UUID REFERENCES project_rooms(id) ON DELETE SET NULL,
    storage_bucket TEXT NOT NULL CHECK (storage_bucket IN ('portfolio-public', 'studio-internal')),
    storage_path TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('photo', 'video', 'floor_plan', 'render', 'drawing', 'moodboard', 'before_photo', 'after_photo', 'detail_photo')),
    mime_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    aspect_ratio NUMERIC,
    file_size INTEGER,
    alt_text TEXT,
    caption TEXT,
    visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('private', 'internal', 'client', 'portfolio_candidate', 'public')),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_project_assets_project_visibility ON project_assets(project_id, visibility);

-- 5. Project Asset Pairs (Before/After)
CREATE TABLE project_asset_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    before_asset_id UUID NOT NULL REFERENCES project_assets(id) ON DELETE CASCADE,
    after_asset_id UUID NOT NULL REFERENCES project_assets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Portfolio Entries (Public Curated Storytelling)
CREATE TABLE portfolio_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    short_description TEXT,
    long_description TEXT,
    hero_asset_id UUID REFERENCES project_assets(id) ON DELETE SET NULL,
    location_display TEXT,
    property_type TEXT,
    style TEXT,
    area_display TEXT,
    completion_year INTEGER,
    scope_display TEXT,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    seo_title TEXT,
    seo_description TEXT,
    og_asset_id UUID REFERENCES project_assets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);
CREATE INDEX idx_portfolio_entries_status ON portfolio_entries(status);

-- 7. Portfolio Sections (Dynamic Page Layouts)
CREATE TABLE portfolio_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_entry_id UUID NOT NULL REFERENCES portfolio_entries(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL CHECK (section_type IN ('intro', 'full_bleed_image', 'image_grid', 'room', 'before_after', 'text', 'quote', 'materials', 'floor_plan', 'video', 'render_vs_built', 'gallery', 'testimonial')),
    title TEXT,
    body TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_portfolio_sections_entry_order ON portfolio_sections(portfolio_entry_id, display_order);

-- 8. Portfolio Entry Assets (Join Table)
CREATE TABLE portfolio_entry_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_entry_id UUID NOT NULL REFERENCES portfolio_entries(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES project_assets(id) ON DELETE CASCADE,
    section_id UUID REFERENCES portfolio_sections(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    layout_role TEXT NOT NULL CHECK (layout_role IN ('hero_landscape', 'full_bleed', 'wide', 'portrait', 'diptych', 'triptych', 'detail', 'room_hero', 'before_after', 'gallery')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(portfolio_entry_id, asset_id, layout_role)
);

-- 9. Services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_asset_id UUID REFERENCES project_assets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- 10. Articles
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    author TEXT,
    published_at TIMESTAMPTZ,
    cover_asset_id UUID REFERENCES project_assets(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- 11. Testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    quote TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    project_location TEXT,
    property_type TEXT,
    property_area TEXT,
    budget_range TEXT,
    project_stage TEXT,
    expected_start_date TEXT,
    service_interest TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'disqualified', 'converted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- 13. Lead Touchpoints (Attribution)
CREATE TABLE lead_touchpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    anonymous_session_id UUID NOT NULL,
    source TEXT,
    medium TEXT,
    campaign TEXT,
    content TEXT,
    term TEXT,
    landing_page TEXT,
    referrer TEXT,
    gclid TEXT,
    gbraid TEXT,
    wbraid TEXT,
    fbclid TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_lead_touchpoints_session ON lead_touchpoints(anonymous_session_id, timestamp);

-- 14. Site Settings (Non-Sensitive)
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    studio_name TEXT NOT NULL,
    public_email TEXT,
    public_phone TEXT,
    address TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    default_seo JSONB DEFAULT '{}'::jsonb,
    brand_copy TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- 15. Consents
CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    subject_type TEXT NOT NULL CHECK (subject_type IN ('client', 'vendor', 'lead', 'employee')),
    subject_id UUID,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('portfolio_publication', 'project_photography_usage', 'testimonial_usage', 'marketing', 'meeting_recording', 'communication_preferences')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'revoked')),
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    reference_document_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_asset_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_entry_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Public read access policies for published entities
CREATE POLICY "Allow public read of published portfolio entries" ON portfolio_entries
    FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Allow public read of published portfolio sections" ON portfolio_sections
    FOR SELECT TO public USING (
        EXISTS (
            SELECT 1 FROM portfolio_entries 
            WHERE id = portfolio_sections.portfolio_entry_id 
            AND status = 'published'
        )
    );

CREATE POLICY "Allow public read of public assets" ON project_assets
    FOR SELECT TO public USING (visibility = 'public');

CREATE POLICY "Allow public read of published portfolio assets" ON portfolio_entry_assets
    FOR SELECT TO public USING (
        EXISTS (
            SELECT 1 FROM portfolio_entries 
            WHERE id = portfolio_entry_assets.portfolio_entry_id 
            AND status = 'published'
        )
    );

CREATE POLICY "Allow public read of services" ON services
    FOR SELECT TO public;

CREATE POLICY "Allow public read of published articles" ON articles
    FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Allow public read of site settings" ON site_settings
    FOR SELECT TO public;

-- RPC Function for Lead Submission (SECURITY DEFINER)
-- Bypasses RLS to insert into leads and lead_touchpoints safely.
CREATE OR REPLACE FUNCTION submit_consultation_lead(
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_project_location TEXT,
    p_property_type TEXT,
    p_property_area TEXT,
    p_budget_range TEXT,
    p_project_stage TEXT,
    p_expected_start_date TEXT,
    p_service_interest TEXT,
    p_message TEXT,
    p_touchpoints JSONB
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_lead_id UUID;
    v_org_id UUID;
    tp RECORD;
BEGIN
    -- Server-side resolution of the single-tenant organization ID
    SELECT id INTO v_org_id FROM organizations LIMIT 1;
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Configuration error: No organization found.';
    END IF;

    -- Basic DB-level email validation
    IF p_email !~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$' THEN
        RAISE EXCEPTION 'Invalid email format.';
    END IF;

    INSERT INTO leads (
        organization_id, first_name, last_name, email, phone, 
        project_location, property_type, property_area, budget_range, 
        project_stage, expected_start_date, service_interest, message
    ) VALUES (
        v_org_id, p_first_name, p_last_name, p_email, p_phone, 
        p_project_location, p_property_type, p_property_area, p_budget_range, 
        p_project_stage, p_expected_start_date, p_service_interest, p_message
    ) RETURNING id INTO new_lead_id;

    IF p_touchpoints IS NOT NULL AND jsonb_array_length(p_touchpoints) > 0 THEN
        FOR tp IN SELECT * FROM jsonb_to_recordset(p_touchpoints) AS x(
            anonymous_session_id UUID, source TEXT, medium TEXT, campaign TEXT, 
            content TEXT, term TEXT, landing_page TEXT, referrer TEXT, 
            gclid TEXT, gbraid TEXT, wbraid TEXT, fbclid TEXT, "timestamp" TIMESTAMPTZ
        )
        LOOP
            INSERT INTO lead_touchpoints (
                lead_id, anonymous_session_id, source, medium, campaign, content, 
                term, landing_page, referrer, gclid, gbraid, wbraid, fbclid, timestamp
            ) VALUES (
                new_lead_id, tp.anonymous_session_id, tp.source, tp.medium, tp.campaign, tp.content, 
                tp.term, tp.landing_page, tp.referrer, tp.gclid, tp.gbraid, tp.wbraid, tp.fbclid, COALESCE(tp.timestamp, NOW())
            );
        END LOOP;
    END IF;

    RETURN 'success';
END;
$$;

-- Explicitly revoke access from the public schema role
REVOKE EXECUTE ON FUNCTION submit_consultation_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM public;

-- Grant execution specifically to the roles intended to handle web requests
GRANT EXECUTE ON FUNCTION submit_consultation_lead(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated, service_role;
