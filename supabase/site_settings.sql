-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_type TEXT DEFAULT 'text' CHECK (logo_type IN ('text', 'image')),
    logo_text TEXT DEFAULT 'MODERNSTORE',
    logo_image_url TEXT,
    store_name TEXT DEFAULT 'Modern Store',
    store_url TEXT DEFAULT 'modernstore.com',
    store_description TEXT DEFAULT 'Premium fashion and lifestyle artifacts for the modern world...',
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    social_links JSONB DEFAULT '{}',
    footer_config JSONB DEFAULT '{}',
    navigation_config JSONB DEFAULT '[]',
    marquee_config JSONB DEFAULT '[
        {"icon": "Truck", "title": "Fast Delivery", "desc": "Standard & Express options"},
        {"icon": "ShieldCheck", "title": "Secure Payment", "desc": "Stripe & PayPal integrated"},
        {"icon": "Clock", "title": "24/7 Support", "desc": "Always here to help you"},
        {"icon": "Zap", "title": "Easy Returns", "desc": "14-day return policy"}
    ]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Selectable by everyone
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);

-- Admins can update
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- Insert initial row if not exists
INSERT INTO public.site_settings (logo_type, logo_text, store_name)
SELECT 'text', 'MODERNSTORE', 'Modern Store'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);
