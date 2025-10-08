-- Fix security issue: Protect caderno_ambientes reference data from unauthorized modifications
-- Enable Row Level Security on caderno_ambientes table
ALTER TABLE public.caderno_ambientes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view environment definitions (needed for app functionality)
CREATE POLICY "Authenticated users can view environment definitions"
ON public.caderno_ambientes
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Only admins can insert new environment definitions
CREATE POLICY "Only admins can insert environment definitions"
ON public.caderno_ambientes
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Only admins can update environment definitions
CREATE POLICY "Only admins can update environment definitions"
ON public.caderno_ambientes
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Only admins can delete environment definitions
CREATE POLICY "Only admins can delete environment definitions"
ON public.caderno_ambientes
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add comment explaining the security model
COMMENT ON TABLE public.caderno_ambientes IS 'Environment reference data table with RLS policies. All authenticated users can read environment definitions (required for property evaluations), but only admins can create, modify, or delete this critical reference data to prevent system-wide data corruption.';