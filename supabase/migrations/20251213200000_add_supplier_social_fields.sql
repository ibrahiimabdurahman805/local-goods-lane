-- Add store and social handles to suppliers
ALTER TABLE public.suppliers
ADD COLUMN store_name TEXT,
ADD COLUMN facebook_handle TEXT,
ADD COLUMN tiktok_handle TEXT,
ADD COLUMN instagram_handle TEXT;
