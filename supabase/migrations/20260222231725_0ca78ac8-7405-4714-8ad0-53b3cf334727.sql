
-- Fix remaining functions with mutable search_path

-- has_role(bigint, text) - legacy function
CREATE OR REPLACE FUNCTION public.has_role(user_id bigint, role_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    RETURN false;
END;
$function$;

-- get_user_role() - legacy function
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    RETURN (SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$function$;
