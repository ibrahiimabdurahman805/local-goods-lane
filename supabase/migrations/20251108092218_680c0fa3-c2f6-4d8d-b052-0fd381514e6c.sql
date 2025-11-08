-- Add contact details to suppliers table
ALTER TABLE public.suppliers
ADD COLUMN email text,
ADD COLUMN phone text,
ADD COLUMN address text,
ADD COLUMN contact_person text;

-- Add index for email lookups
CREATE INDEX idx_suppliers_email ON public.suppliers(email);