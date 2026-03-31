-- Add shipping-related fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
ADD COLUMN IF NOT EXISTS pickup_scheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pickup_date DATE,
ADD COLUMN IF NOT EXISTS pickup_time TIME,
ADD COLUMN IF NOT EXISTS pickup_confirmation TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT DEFAULT 'dhl',
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'express';

-- Add index for tracking numbers
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Add index for pickup scheduled orders
CREATE INDEX IF NOT EXISTS idx_orders_pickup_scheduled ON orders(pickup_scheduled) WHERE pickup_scheduled = TRUE;
