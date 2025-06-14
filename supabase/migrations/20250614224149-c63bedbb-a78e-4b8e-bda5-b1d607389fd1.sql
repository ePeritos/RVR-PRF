-- Verificar se o bucket 'caip-images' existe, se não, criar
DO $$
BEGIN
    -- Tentar inserir o bucket, ignorar se já existir
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'caip-images', 
        'caip-images', 
        true, 
        5242880, -- 5MB em bytes
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Log se o bucket foi criado ou já existia
    IF FOUND THEN
        RAISE NOTICE 'Bucket caip-images criado com sucesso';
    ELSE
        RAISE NOTICE 'Bucket caip-images já existe';
    END IF;
END $$;

-- Criar políticas de storage para o bucket caip-images se não existirem
DO $$
BEGIN
    -- Política para permitir visualização pública das imagens
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Imagens CAIP são publicamente visíveis'
    ) THEN
        CREATE POLICY "Imagens CAIP são publicamente visíveis"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'caip-images');
        
        RAISE NOTICE 'Política de visualização pública criada para caip-images';
    END IF;
    
    -- Política para permitir upload de imagens autenticadas
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários autenticados podem fazer upload de imagens CAIP'
    ) THEN
        CREATE POLICY "Usuários autenticados podem fazer upload de imagens CAIP"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'caip-images');
        
        RAISE NOTICE 'Política de upload criada para caip-images';
    END IF;
    
    -- Política para permitir deleção de imagens autenticadas
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários autenticados podem deletar imagens CAIP'
    ) THEN
        CREATE POLICY "Usuários autenticados podem deletar imagens CAIP"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'caip-images');
        
        RAISE NOTICE 'Política de deleção criada para caip-images';
    END IF;
    
    -- Política para permitir atualização de imagens autenticadas
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Usuários autenticados podem atualizar imagens CAIP'
    ) THEN
        CREATE POLICY "Usuários autenticados podem atualizar imagens CAIP"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'caip-images');
        
        RAISE NOTICE 'Política de atualização criada para caip-images';
    END IF;
END $$;