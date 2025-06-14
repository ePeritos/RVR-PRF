-- Verificar e recriar a função handle_new_user para garantir que funcione corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'usuario_padrao'::app_role
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log do erro para debug
    RAISE LOG 'Erro ao criar perfil do usuário %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Continua mesmo com erro para não bloquear o cadastro
END;
$$;

-- Verificar se o trigger existe, se não existir, criar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();