-- Corrigir políticas RLS para usar unidade_gestora em vez de unidade_lotacao
-- Isso permite que usuários padrão vejam dados de sua unidade gestora

-- Remover políticas incorretas
DROP POLICY IF EXISTS "Users can view data from their organization unit" ON public.dados_caip;
DROP POLICY IF EXISTS "Users can insert data for their organization unit" ON public.dados_caip;
DROP POLICY IF EXISTS "Users can update data from their organization unit" ON public.dados_caip;
DROP POLICY IF EXISTS "Users can delete data from their organization unit" ON public.dados_caip;

-- Criar políticas corretas usando unidade_gestora
CREATE POLICY "Users can view data from their management unit" 
ON public.dados_caip 
FOR SELECT 
TO authenticated
USING (unidade_gestora = ( SELECT profiles.unidade_gestora FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert data for their management unit" 
ON public.dados_caip 
FOR INSERT 
TO authenticated
WITH CHECK (unidade_gestora = ( SELECT profiles.unidade_gestora FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update data from their management unit" 
ON public.dados_caip 
FOR UPDATE 
TO authenticated
USING (unidade_gestora = ( SELECT profiles.unidade_gestora FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can delete data from their management unit" 
ON public.dados_caip 
FOR DELETE 
TO authenticated
USING (unidade_gestora = ( SELECT profiles.unidade_gestora FROM profiles WHERE profiles.id = auth.uid()));