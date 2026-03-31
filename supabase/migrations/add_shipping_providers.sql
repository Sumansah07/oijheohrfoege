-- Migration: Add Shipping Providers System
-- Run this after initial setup.sql

-- 1. Create shipping_providers table
CREATE TABLE IF NOT EXISTS public.shipping_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  provider_type TEXT DEFAULT 'carrier' CHECK (provider_type IN ('carrier', 'flat_rate', 'free')),
  config JSONB DEFAULT '{}',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add shipping columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_provider_slug TEXT REFERENCES public.shipping_providers(slug);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_rate DECIMAL(10,2);

-- 3. Add shipping_config to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS shipping_config JSONB DEFAULT '{"zones": [], "free_shipping_threshold": 0, "default_rate": 10.00, "weight_unit": "kg", "dimension_unit": "cm"}';

-- 4. Seed initial shipping providers
INSERT INTO public.shipping_providers (name, slug, is_active, provider_type, logo_url, config) VALUES
  ('DHL Express', 'dhl', false, 'carrier', '/fonts/assets/dhl-logo.svg', '{"api_key": "", "account_number": "", "test_mode": true}'),
  ('FedEx', 'fedex', false, 'carrier', '/fonts/assets/fedex-logo.svg', '{"api_key": "", "account_number": "", "test_mode": true}'),
  ('UPS', 'ups', false, 'carrier', '/fonts/assets/ups-logo.svg', '{"api_key": "", "account_number": "", "test_mode": true}'),
  ('Flat Rate Shipping', 'flat-rate', true, 'flat_rate', '/fonts/assets/shipping-box.svg', '{"rate": 10.00, "estimated_days": "3-5"}'),
  ('Free Shipping', 'free-shipping', false, 'free', '/fonts/assets/free-shipping.svg', '{"minimum_order": 100.00}')
ON CONFLICT (slug) DO NOTHING;

-- 5. Enable RLS
ALTER TABLE public.shipping_providers ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Shipping providers are viewable by everyone" ON public.shipping_providers;
CREATE POLICY "Shipping providers are viewable by everyone" ON public.shipping_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage shipping providers" ON public.shipping_providers;
CREATE POLICY "Admins can manage shipping providers" ON public.shipping_providers FOR ALL USING (public.is_admin());
