-- Fix security issue with responsaveis_tecnicos table
-- Only admins should be able to modify technical professional data

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create responsaveis_tecnicos" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Authenticated users can update responsaveis_tecnicos" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Authenticated users can delete responsaveis_tecnicos" ON public.responsaveis_tecnicos;
DROP POLICY IF EXISTS "Authenticated users can view responsaveis_tecnicos" ON public.responsaveis_tecnicos;

-- Create secure policies: READ access for authenticated users, WRITE access only for admins
CREATE POLICY "authenticated_users_can_view_responsaveis_tecnicos" 
ON public.responsaveis_tecnicos 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "only_admins_can_create_responsaveis_tecnicos" 
ON public.responsaveis_tecnicos 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "only_admins_can_update_responsaveis_tecnicos" 
ON public.responsaveis_tecnicos 
FOR UPDATE 
TO authenticated
USING (public.is_admin());

CREATE POLICY "only_admins_can_delete_responsaveis_tecnicos" 
ON public.responsaveis_tecnicos 
FOR DELETE 
TO authenticated
USING (public.is_admin());