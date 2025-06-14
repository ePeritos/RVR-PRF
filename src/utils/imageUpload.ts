import { supabase } from '@/integrations/supabase/client';

export class ImageUploadService {
  private static bucket = 'caip-images';

  static async uploadImage(file: File, folder: string): Promise<string | null> {
    try {
      console.log(`Fazendo upload da imagem ${file.name} para ${folder}...`);
      
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${folder}/${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;

      // Upload para o storage
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucket)
        .getPublicUrl(data.path);

      console.log(`✅ Upload concluído: ${publicUrl}`);
      return publicUrl;

    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  }

  static async deleteImage(url: string): Promise<boolean> {
    try {
      // Extrair o path da URL
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === this.bucket);
      if (bucketIndex === -1) return false;
      
      const path = urlParts.slice(bucketIndex + 1).join('/');
      
      const { error } = await supabase.storage
        .from(this.bucket)
        .remove([path]);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        return false;
      }

      console.log(`✅ Imagem deletada: ${path}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }

  static isStorageUrl(url: string): boolean {
    return url && url.includes('supabase') && url.includes(this.bucket);
  }
}