-- Adicionar campo unidade_gestora na tabela profiles se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'unidade_gestora') THEN
        ALTER TABLE public.profiles 
        ADD COLUMN unidade_gestora text;
    END IF;
END $$;

-- Atualizar o tipo enum para incluir o papel de admin
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
        ALTER TYPE app_role ADD VALUE 'admin';
    END IF;
END $$;