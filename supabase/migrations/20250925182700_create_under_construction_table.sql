CREATE TABLE under_construction (
  id SERIAL PRIMARY KEY,
  is_active BOOLEAN DEFAULT false,
  title TEXT DEFAULT 'Onder Constructie',
  message TEXT DEFAULT 'Deze website is momenteel onder constructie...',
  footer_text TEXT DEFAULT 'Bedankt voor uw geduld!',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);