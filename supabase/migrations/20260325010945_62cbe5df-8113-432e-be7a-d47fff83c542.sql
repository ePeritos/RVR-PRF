-- Drop the existing policy without WITH CHECK
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;

-- Recreate with WITH CHECK preventing role and perfil_permissao_id self-escalation
CREATE POLICY "users_can_update_own_profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  AND perfil_permissao_id IS NOT DISTINCT FROM (SELECT perfil_permissao_id FROM public.profiles WHERE id = auth.uid())
);