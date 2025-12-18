-- Add theme preference to suppliers
ALTER TABLE public.suppliers
ADD COLUMN theme text DEFAULT 'sunrise';
