-- Primeiro, criar o tipo app_role se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'usuario_padrao');
    END IF;
END $$;

-- Verificar se a coluna role existe e tem o tipo correto
DO $$ 
BEGIN 
    -- Se a coluna role não tem o tipo correto, alterar
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'role' 
               AND data_type != 'USER-DEFINED') THEN
        ALTER TABLE public.profiles 
        ALTER COLUMN role TYPE app_role USING role::text::app_role;
    END IF;
    
    -- Se a coluna role não existe, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN role app_role NOT NULL DEFAULT 'usuario_padrao'::app_role;
    END IF;
END $$;

-- Recriar a função handle_new_user com o tipo correto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    'usuario_padrao'::app_role
  );
  RETURN new;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();