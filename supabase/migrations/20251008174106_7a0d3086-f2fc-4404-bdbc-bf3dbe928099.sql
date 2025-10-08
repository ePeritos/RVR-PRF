-- Fix security issue: Explicitly deny all anonymous/public access to profiles table
-- While RLS denies by default, explicit denial provides defense-in-depth security

-- Explicit DENY policy: Block anonymous users from viewing any profiles
CREATE POLICY "Deny anonymous users from viewing profiles"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- Explicit DENY policy: Block anonymous users from inserting profiles
CREATE POLICY "Deny anonymous users from inserting profiles"
ON public.profiles
AS RESTRICTIVE
FOR INSERT
TO anon
WITH CHECK (false);

-- Explicit DENY policy: Block anonymous users from updating profiles
CREATE POLICY "Deny anonymous users from updating profiles"
ON public.profiles
AS RESTRICTIVE
FOR UPDATE
TO anon
USING (false);

-- Explicit DENY policy: Block anonymous users from deleting profiles
CREATE POLICY "Deny anonymous users from deleting profiles"
ON public.profiles
AS RESTRICTIVE
FOR DELETE
TO anon
USING (false);

-- Update table comment to document the comprehensive security model
COMMENT ON TABLE public.profiles IS 'Employee profiles table with comprehensive RLS protection. Authenticated users can only view/update their own profile. Admins can view/update all profiles. Anonymous (unauthenticated) access is explicitly denied for all operations to protect sensitive employee data including emails, phone numbers, employee IDs (matricula), and organizational assignments. This prevents phishing attacks and social engineering attempts.';