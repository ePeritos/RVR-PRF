-- Fix infinite recursion error in profiles table policies
-- Remove the problematic policies and create simpler, non-recursive ones

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "admins_can_view_profiles_same_unit" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_profiles_same_unit" ON public.profiles;

-- Create simple, non-recursive policies
-- Users can always view and update their own profile
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

-- Admins can view all profiles (for now, we'll implement unit-based restrictions later if needed)
CREATE POLICY "admins_can_view_all_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_admin());

-- Admins can update all profiles (for now, we'll implement unit-based restrictions later if needed)
CREATE POLICY "admins_can_update_all_profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_admin());

-- Users can insert their own profile
CREATE POLICY "users_can_insert_own_profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);