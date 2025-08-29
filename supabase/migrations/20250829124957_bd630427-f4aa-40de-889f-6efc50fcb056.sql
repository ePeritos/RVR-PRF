-- Fix the security issue with the profiles table
-- Remove the overly broad admin policy and make it more restrictive

-- First, drop the existing admin policies that might be too permissive
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON public.profiles;

-- Create a more secure policy for admin viewing that only allows true admins
CREATE POLICY "verified_admins_can_view_all_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'::app_role
  )
);

-- Create a more secure policy for admin updates that only allows true admins
CREATE POLICY "verified_admins_can_update_all_profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'::app_role
  )
);

-- Ensure the has_role function is properly secured and only checks the profiles table
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;