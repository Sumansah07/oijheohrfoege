-- =====================================================
-- Seed Data for Ecommerce Store
-- Run this in Supabase SQL Editor AFTER running setup.sql
-- =====================================================

-- Categories
INSERT INTO public.categories (name, slug, description, image_url, is_active) VALUES
('Men', 'men', 'Premium menswear collection — shirts, trousers, jackets and more.', 'https://images.unsplash.com/photo-1488161628813-244aa2f87739?q=80&w=2000&auto=format&fit=crop', true),
('Women', 'women', 'Elegant womenswear — dresses, tops, skirts and seasonal collections.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', true),
('Accessories', 'accessories', 'Watches, bags, belts, jewelry and everyday essentials.', 'https://images.unsplash.com/photo-1548036691-03291888b64e?q=80&w=2070&auto=format&fit=crop', true)
ON CONFLICT (slug) DO NOTHING;

-- Products (Men)
WITH men AS (SELECT id FROM public.categories WHERE slug = 'men')
INSERT INTO public.products (name, slug, description, base_price, discount_price, featured_image, images, category_id, is_active, is_featured, stock_quantity, sku, metadata)
SELECT
  name, slug, description, base_price, discount_price, featured_image, images, men.id, is_active, is_featured, stock_quantity, sku, metadata
FROM men, (VALUES
  (
    'Classic Linen Blazer',
    'classic-linen-blazer',
    'Crafted from premium linen, this blazer offers a sophisticated silhouette perfect for warm weather. Natural horn buttons and a soft-structured shoulder make it a timeless wardrobe piece.',
    249.00, 320.00,
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4e91?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4b4e91?q=80&w=1200','https://images.unsplash.com/photo-1507679799987-c73774586bd9?q=80&w=1200&auto=format&fit=crop'],
    true, true, 45, 'BLZ-001',
    '{"colors":["Beige","Navy","Charcoal"],"sizes":["S","M","L","XL","XXL"]}'::jsonb
  ),
  (
    'Oxford Button-Down Shirt',
    'oxford-button-down-shirt',
    'A wardrobe staple crafted from 100% cotton Oxford cloth. This shirt transitions effortlessly from casual Friday to weekend outings.',
    89.00, NULL,
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200'],
    true, true, 120, 'SHT-002',
    '{"colors":["White","Blue","Grey"],"sizes":["S","M","L","XL"]}'::jsonb
  ),
  (
    'Slim Fit Chinos',
    'slim-fit-chinos',
    'Premium cotton-stretch chinos with a modern slim fit. Versatile enough for both office and casual outings.',
    110.00, NULL,
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200'],
    true, false, 80, 'CHN-003',
    '{"colors":["Khaki","Navy","Olive"],"sizes":["28","30","32","34","36"]}'::jsonb
  )
) AS t(name, slug, description, base_price, discount_price, featured_image, images, is_active, is_featured, stock_quantity, sku, metadata)
ON CONFLICT (slug) DO NOTHING;

-- Products (Women)
WITH women AS (SELECT id FROM public.categories WHERE slug = 'women')
INSERT INTO public.products (name, slug, description, base_price, discount_price, featured_image, images, category_id, is_active, is_featured, stock_quantity, sku, metadata)
SELECT
  name, slug, description, base_price, discount_price, featured_image, images, women.id, is_active, is_featured, stock_quantity, sku, metadata
FROM women, (VALUES
  (
    'Silk Wrap Dress',
    'silk-wrap-dress',
    'A flowing wrap dress in pure silk with a flattering adjustable tie-waist. Perfect for day-to-night transitions.',
    189.00, 229.00,
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1200','https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1200'],
    true, true, 35, 'DRS-001',
    '{"colors":["Ivory","Dusty Rose","Forest Green"],"sizes":["XS","S","M","L","XL"]}'::jsonb
  ),
  (
    'Cashmere Crewneck Sweater',
    'cashmere-crewneck-sweater',
    '100% pure cashmere crewneck sweater. Incredibly soft and warm, perfect for layering through the seasons.',
    145.00, NULL,
    'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?q=80&w=1200'],
    true, true, 60, 'SWT-002',
    '{"colors":["Camel","Oatmeal","Blush"],"sizes":["XS","S","M","L"]}'::jsonb
  ),
  (
    'High-Waist Tailored Trousers',
    'high-waist-tailored-trousers',
    'Elegant high-waist trousers with a straight leg silhouette. Designed for the modern professional.',
    129.00, 169.00,
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200'],
    true, false, 50, 'TRS-003',
    '{"colors":["Black","Cream","Burgundy"],"sizes":["XS","S","M","L","XL"]}'::jsonb
  )
) AS t(name, slug, description, base_price, discount_price, featured_image, images, is_active, is_featured, stock_quantity, sku, metadata)
ON CONFLICT (slug) DO NOTHING;

-- Products (Accessories)
WITH acc AS (SELECT id FROM public.categories WHERE slug = 'accessories')
INSERT INTO public.products (name, slug, description, base_price, discount_price, featured_image, images, category_id, is_active, is_featured, stock_quantity, sku, metadata)
SELECT
  name, slug, description, base_price, discount_price, featured_image, images, acc.id, is_active, is_featured, stock_quantity, sku, metadata
FROM acc, (VALUES
  (
    'Minimalist Leather Watch',
    'minimalist-leather-watch',
    'Swiss movement with a slim stainless steel case. Italian leather strap with a matte finish. Water resistant to 30m.',
    159.00, 199.00,
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200','https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200'],
    true, true, 25, 'WTC-001',
    '{"colors":["Black Strap","Brown Strap","Tan Strap"],"sizes":["One Size"]}'::jsonb
  ),
  (
    'Canvas Tote Bag',
    'canvas-tote-bag',
    'Heavy-duty canvas tote with leather handles. Spacious enough for a 15" laptop with interior zip pocket.',
    45.00, NULL,
    'https://images.unsplash.com/photo-1544816153-199d8a2b536a?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1544816153-199d8a2b536a?q=80&w=1200'],
    true, true, 150, 'BAG-002',
    '{"colors":["Natural","Black","Olive"],"sizes":["One Size"]}'::jsonb
  ),
  (
    'Leather Bifold Wallet',
    'leather-bifold-wallet',
    'Full-grain leather bifold wallet with RFID blocking. Slim profile with 6 card slots and a cash compartment.',
    65.00, NULL,
    'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200'],
    true, false, 200, 'WLT-003',
    '{"colors":["Brown","Black","Tan"],"sizes":["One Size"]}'::jsonb
  )
) AS t(name, slug, description, base_price, discount_price, featured_image, images, is_active, is_featured, stock_quantity, sku, metadata)
ON CONFLICT (slug) DO NOTHING;

-- Update Featured Categories
UPDATE public.categories SET is_featured_on_homepage = true WHERE slug IN ('men', 'women');

-- Navigation Links
INSERT INTO public.navigation_links (label, href, sort_order) VALUES
('New Arrivals', '/category/all?sort=newest', 1),
('Bestsellers', '/category/all?sort=bestsellers', 2),
('Blog', '/blog', 3),
('Sale', '/category/all?max=50', 4)
ON CONFLICT DO NOTHING;

-- Blog Posts
INSERT INTO public.blogs (title, slug, excerpt, content, featured_image, is_published, published_at) VALUES
(
  'The Art of Minimalist Fashion',
  'art-of-minimalist-fashion',
  'Discover the power of less with our guide to building a timeless minimalist wardrobe.',
  '## Why Minimalism matters...\nMinimalist fashion isn''t just about wearing neutral colors. It''s about intentionality and quality over quantity.',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  true,
  now()
),
(
  'Sustainable Stylings: A Future of Fashion',
  'sustainable-stylings',
  'How our commitment to sustainable materials is changing the way we design for the future.',
  '## Sustainability is the new black...\nWe believe that fashion should look good and do good. Our new organic collection is the first step.',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop',
  true,
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- Banners (Secondary)
INSERT INTO public.banners (title, subtitle, cta_text, cta_link, image_url, banner_type, sort_order) VALUES
(
  'New Season Sale',
  'Upgrade your wardrobe with our exclusive collection at unbeatable prices.',
  'Shop the Sale',
  '/category/all?max=100',
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
  'secondary',
  1
)
ON CONFLICT DO NOTHING;
