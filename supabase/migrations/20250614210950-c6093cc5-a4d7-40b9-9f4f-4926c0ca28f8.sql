-- Criar bucket para imagens do CAIP
INSERT INTO storage.buckets (id, name, public) VALUES ('caip-images', 'caip-images', true);

-- Criar políticas para o bucket de imagens CAIP
CREATE POLICY "Imagens CAIP são publicamente visíveis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'caip-images');

CREATE POLICY "Usuários autenticados podem fazer upload de imagens CAIP" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'caip-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar suas imagens CAIP" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'caip-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar suas imagens CAIP" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'caip-images' AND auth.uid() IS NOT NULL);