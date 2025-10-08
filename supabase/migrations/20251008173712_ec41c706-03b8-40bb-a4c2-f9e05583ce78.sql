-- Fix security issue: Restrict maintenance records access by management unit
-- Drop existing overly permissive policies on manutencao_ambientes
DROP POLICY IF EXISTS "Todos podem visualizar avaliações de manutenção" ON public.manutencao_ambientes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir avaliações" ON public.manutencao_ambientes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar avaliações" ON public.manutencao_ambientes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar avaliações" ON public.manutencao_ambientes;

-- Create new restrictive policies for manutencao_ambientes

-- RLS Policy: Admins can view all maintenance records
CREATE POLICY "Admins can view all maintenance records"
ON public.manutencao_ambientes
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Users can view maintenance records for properties in their management unit
CREATE POLICY "Users can view maintenance records from their management unit"
ON public.manutencao_ambientes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.dados_caip 
    WHERE dados_caip.id = manutencao_ambientes.imovel_id 
    AND dados_caip.unidade_gestora = (
      SELECT unidade_gestora 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);

-- RLS Policy: Admins can insert any maintenance record
CREATE POLICY "Admins can insert any maintenance record"
ON public.manutencao_ambientes
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Users can only insert maintenance records for properties in their management unit
CREATE POLICY "Users can insert maintenance records for their management unit"
ON public.manutencao_ambientes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.dados_caip 
    WHERE dados_caip.id = manutencao_ambientes.imovel_id 
    AND dados_caip.unidade_gestora = (
      SELECT unidade_gestora 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);

-- RLS Policy: Admins can update any maintenance record
CREATE POLICY "Admins can update any maintenance record"
ON public.manutencao_ambientes
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Users can only update maintenance records for properties in their management unit
CREATE POLICY "Users can update maintenance records from their management unit"
ON public.manutencao_ambientes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.dados_caip 
    WHERE dados_caip.id = manutencao_ambientes.imovel_id 
    AND dados_caip.unidade_gestora = (
      SELECT unidade_gestora 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);

-- RLS Policy: Admins can delete any maintenance record
CREATE POLICY "Admins can delete any maintenance record"
ON public.manutencao_ambientes
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policy: Users can only delete maintenance records for properties in their management unit
CREATE POLICY "Users can delete maintenance records from their management unit"
ON public.manutencao_ambientes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.dados_caip 
    WHERE dados_caip.id = manutencao_ambientes.imovel_id 
    AND dados_caip.unidade_gestora = (
      SELECT unidade_gestora 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Add comment explaining the security model
COMMENT ON TABLE public.manutencao_ambientes IS 'Maintenance environment assessments table with RLS policies restricting access by property management unit (unidade_gestora). Admins have full access, regular users can only access records for properties within their own management unit.';