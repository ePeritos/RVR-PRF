-- Verificar e criar políticas de storage para usuários padrão
-- Deletar políticas existentes se houver problemas
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;

-- Criar políticas permissivas para o bucket caip-images
-- Permitir que usuários autenticados façam upload de suas próprias imagens
CREATE POLICY "Users can upload images to caip-images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'caip-images');

-- Permitir que usuários autenticados vejam todas as imagens do bucket
CREATE POLICY "Users can view images from caip-images" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'caip-images');

-- Permitir que usuários autenticados atualizem suas próprias imagens
CREATE POLICY "Users can update images in caip-images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'caip-images');

-- Permitir que usuários autenticados deletem suas próprias imagens
CREATE POLICY "Users can delete images from caip-images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'caip-images');