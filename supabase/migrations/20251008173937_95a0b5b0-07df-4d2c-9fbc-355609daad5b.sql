-- Fix security issue: Add RLS policies to tipos_imoveis reference data
-- This table stores property type definitions that all users need to read

-- RLS Policy: All authenticated users can view property types (needed for app functionality)
CREATE POLICY "Authenticated users can view property types"
ON public.tipos_imoveis
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Only admins can insert new property types
CREATE POLICY "Only admins can insert property types"
ON public.tipos_imoveis
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Only admins can update property types
CREATE POLICY "Only admins can update property types"
ON public.tipos_imoveis
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Only admins can delete property types
CREATE POLICY "Only admins can delete property types"
ON public.tipos_imoveis
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add comment explaining the security model
COMMENT ON TABLE public.tipos_imoveis IS 'Property type reference data table with RLS policies. All authenticated users can read property types (required for property management), but only admins can create, modify, or delete property types to prevent system-wide data corruption.';