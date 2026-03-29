-- FAQs Table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Viewable by everyone
DROP POLICY IF EXISTS "FAQs are viewable by everyone" ON public.faqs;
CREATE POLICY "FAQs are viewable by everyone" ON public.faqs FOR SELECT USING (is_active = true OR public.is_admin());

-- Full access for admins
DROP POLICY IF EXISTS "Admins have full access on faqs" ON public.faqs;
CREATE POLICY "Admins have full access on faqs" ON public.faqs FOR ALL USING (public.is_admin());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_faq_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_faq_updated ON public.faqs;
CREATE TRIGGER on_faq_updated
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_faq_updated_at();

-- Initial Seed Data
INSERT INTO public.faqs (question, answer, sort_order) VALUES
('What is your shipping policy?', 'We offer free standard shipping on all orders over $100. Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout.', 1),
('How do I return an item?', 'You can return any unworn, unwashed item within 30 days of purchase. Simply visit our Returns portal to generate a prepaid shipping label.', 2),
('Do you ship internationally?', 'Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location and will be calculated at checkout.', 3),
('Are your products ethically sourced?', 'Absolutely. We pride ourselves on partnering only with manufacturers who adhere to fair labor practices and utilize sustainable materials whenever possible.', 4);
