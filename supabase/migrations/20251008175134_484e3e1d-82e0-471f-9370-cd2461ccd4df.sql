-- Fix security issue: Add RLS policies to imovel_ambientes_existentes table
-- This table links properties (imoveis) to their existing environments (ambientes)
-- Access should be restricted based on the user's unidade_gestora

-- Policy 1: Admins can view all property-environment associations
CREATE POLICY "Admins can view all property environments"
ON public.imovel_ambientes_existentes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 2: Users can view property environments from their management unit
CREATE POLICY "Users can view property environments from their management unit"
ON public.imovel_ambientes_existentes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.imoveis i
    WHERE i.id = imovel_ambientes_existentes.imovel_id
      AND i.unidade_gestora = (
        SELECT unidade_gestora 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
  )
);

-- Policy 3: Admins can insert any property-environment association
CREATE POLICY "Admins can insert any property environment"
ON public.imovel_ambientes_existentes
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 4: Users can insert property environments for their management unit
CREATE POLICY "Users can insert property environments for their management unit"
ON public.imovel_ambientes_existentes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.imoveis i
    WHERE i.id = imovel_ambientes_existentes.imovel_id
      AND i.unidade_gestora = (
        SELECT unidade_gestora 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
  )
);

-- Policy 5: Admins can update any property-environment association
CREATE POLICY "Admins can update any property environment"
ON public.imovel_ambientes_existentes
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 6: Users can update property environments from their management unit
CREATE POLICY "Users can update property environments from their management unit"
ON public.imovel_ambientes_existentes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.imoveis i
    WHERE i.id = imovel_ambientes_existentes.imovel_id
      AND i.unidade_gestora = (
        SELECT unidade_gestora 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
  )
);

-- Policy 7: Admins can delete any property-environment association
CREATE POLICY "Admins can delete any property environment"
ON public.imovel_ambientes_existentes
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 8: Users can delete property environments from their management unit
CREATE POLICY "Users can delete property environments from their management unit"
ON public.imovel_ambientes_existentes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.imoveis i
    WHERE i.id = imovel_ambientes_existentes.imovel_id
      AND i.unidade_gestora = (
        SELECT unidade_gestora 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
  )
);

-- Add table comment documenting the security model
COMMENT ON TABLE public.imovel_ambientes_existentes IS 'Junction table linking properties to their existing environments. Access is restricted by RLS: admins can access all records, while regular users can only access records for properties within their unidade_gestora. This prevents unauthorized users from viewing or modifying environment data for properties outside their management scope.';