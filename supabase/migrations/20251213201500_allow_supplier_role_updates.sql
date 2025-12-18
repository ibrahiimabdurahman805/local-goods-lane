-- Allow authenticated users to switch between customer and supplier roles
CREATE POLICY "Users can manage customer-supplier role"
  ON public.user_roles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    role IN ('customer', 'supplier')
  );
