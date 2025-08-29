-- Fix the infinite recursion issue in profiles table policies
-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "verified_admins_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "verified_admins_can_update_all_profiles" ON public.profiles;

-- Create a secure function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin'::app_role FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Create new non-recursive admin policies using the function
CREATE POLICY "admins_can_view_all_profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin() OR auth.uid() = id);

CREATE POLICY "admins_can_update_all_profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin() OR auth.uid() = id);