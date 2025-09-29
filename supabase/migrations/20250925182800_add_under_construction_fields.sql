ALTER TABLE under_construction
ADD COLUMN logo_url TEXT,
ADD COLUMN expected_date TIMESTAMP,
ADD COLUMN social_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN progress_percentage INTEGER DEFAULT 0,
ADD COLUMN contact_email TEXT,
ADD COLUMN newsletter_enabled BOOLEAN DEFAULT false;