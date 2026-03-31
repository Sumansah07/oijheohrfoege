-- Fix shipping provider logo URLs to use SVG files

UPDATE public.shipping_providers 
SET logo_url = '/fonts/assets/dhl-logo.svg'
WHERE slug = 'dhl';

UPDATE public.shipping_providers 
SET logo_url = '/fonts/assets/fedex-logo.svg'
WHERE slug = 'fedex';

UPDATE public.shipping_providers 
SET logo_url = '/fonts/assets/ups-logo.svg'
WHERE slug = 'ups';

UPDATE public.shipping_providers 
SET logo_url = '/fonts/assets/shipping-box.svg'
WHERE slug = 'flat-rate';

UPDATE public.shipping_providers 
SET logo_url = '/fonts/assets/free-shipping.svg'
WHERE slug = 'free-shipping';
