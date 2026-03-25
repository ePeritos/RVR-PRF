-- Drop the zero-argument overload that always returns true (security risk!)
DROP FUNCTION IF EXISTS public.has_role();

-- Drop the (bigint, text) stub that always returns false
DROP FUNCTION IF EXISTS public.has_role(bigint, text);