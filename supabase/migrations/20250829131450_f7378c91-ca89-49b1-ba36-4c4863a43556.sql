-- Fix infinite recursion error by completely rebuilding profiles policies
-- Remove ALL existing policies first

DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_view_profiles_same_unit" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_profiles_same_unit" ON public.profiles;

-- Create clean, simple policies without recursion
CREATE POLICY "users_can_view_own_profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "admins_can_view_all_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_admin());

CREATE POLICY "admins_can_update_all_profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_admin());