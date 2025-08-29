-- Fix security issue with profiles table
-- Implement granular access controls based on management units

-- Drop the overly broad admin policies
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON public.profiles;

-- Create more granular admin policies
-- Admins can only view/update profiles from their own management unit
CREATE POLICY "admins_can_view_profiles_same_unit" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  is_admin() AND (
    unidade_gestora = (SELECT unidade_gestora FROM public.profiles WHERE id = auth.uid()) OR
    auth.uid() = id  -- Users can always see their own profile
  )
);

CREATE POLICY "admins_can_update_profiles_same_unit" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  is_admin() AND (
    unidade_gestora = (SELECT unidade_gestora FROM public.profiles WHERE id = auth.uid()) OR
    auth.uid() = id  -- Users can always update their own profile
  )
);

-- Create a super admin function for future use if needed
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::app_role AND unidade_gestora = 'SEDE' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Optional: Create a policy for super admins (SEDE) to view all profiles if needed
-- Uncomment if super admin access is required
-- CREATE POLICY "super_admins_can_view_all_profiles" 
-- ON public.profiles 
-- FOR SELECT 
-- TO authenticated
-- USING (is_super_admin());