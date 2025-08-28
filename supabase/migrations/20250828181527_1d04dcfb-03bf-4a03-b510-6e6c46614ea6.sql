-- Remove public access policies that allow unrestricted access to sensitive government data
DROP POLICY IF EXISTS "Permitir leitura pública dos dados CAIP" ON public.dados_caip;
DROP POLICY IF EXISTS "Permitir inserção pública dos dados CAIP" ON public.dados_caip;
DROP POLICY IF EXISTS "Permitir atualização e exclusão para usuários autenticados" ON public.dados_caip;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON public.dados_caip;

-- The remaining policies already provide proper security:
-- 1. Users can only access data from their organization unit
-- 2. Admins can access all data
-- 3. No unauthorized access is allowed

-- Verify RLS is enabled (it should already be)
ALTER TABLE public.dados_caip ENABLE ROW LEVEL SECURITY;