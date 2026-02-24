
-- Add edit lock columns to dados_caip
ALTER TABLE public.dados_caip
ADD COLUMN editing_by uuid NULL,
ADD COLUMN editing_at timestamp with time zone NULL;

-- Function to acquire edit lock (with heartbeat expiry of 30 seconds)
CREATE OR REPLACE FUNCTION public.acquire_edit_lock(p_record_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_editor uuid;
  v_current_at timestamptz;
  v_editor_name text;
BEGIN
  SELECT editing_by, editing_at INTO v_current_editor, v_current_at
  FROM public.dados_caip
  WHERE id = p_record_id;

  -- If someone else holds the lock and it hasn't expired (30 seconds)
  IF v_current_editor IS NOT NULL 
     AND v_current_editor != p_user_id 
     AND v_current_at > (now() - interval '30 seconds') THEN
    
    SELECT nome_completo INTO v_editor_name
    FROM public.profiles
    WHERE id = v_current_editor;
    
    RETURN jsonb_build_object(
      'success', false,
      'locked_by', COALESCE(v_editor_name, 'Usuário desconhecido'),
      'locked_at', v_current_at
    );
  END IF;

  -- Acquire lock
  UPDATE public.dados_caip
  SET editing_by = p_user_id, editing_at = now()
  WHERE id = p_record_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function to release edit lock
CREATE OR REPLACE FUNCTION public.release_edit_lock(p_record_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.dados_caip
  SET editing_by = NULL, editing_at = NULL
  WHERE id = p_record_id AND editing_by = p_user_id;
END;
$$;

-- Function to refresh heartbeat
CREATE OR REPLACE FUNCTION public.refresh_edit_lock(p_record_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.dados_caip
  SET editing_at = now()
  WHERE id = p_record_id AND editing_by = p_user_id;
  
  RETURN FOUND;
END;
$$;
