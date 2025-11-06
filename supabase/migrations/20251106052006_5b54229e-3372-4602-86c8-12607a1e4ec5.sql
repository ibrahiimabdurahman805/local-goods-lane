-- Add delivery and payment details to orders table
ALTER TABLE public.orders
ADD COLUMN delivery_address TEXT,
ADD COLUMN delivery_city TEXT,
ADD COLUMN delivery_phone TEXT,
ADD COLUMN delivery_notes TEXT,
ADD COLUMN payment_intent_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending';

-- Create order_items table to support multiple products per order
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_items
CREATE POLICY "Customers can view their own order items"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all order items"
ON public.order_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Suppliers can view order items for their products"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.id = order_items.product_id
    AND s.user_id = auth.uid()
  )
);

-- Add index for better performance
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);