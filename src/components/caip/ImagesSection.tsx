import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { ImageUploadService } from '@/utils/imageUpload';
import { useToast } from '@/hooks/use-toast';

type DadosCAIP = Tables<'dados_caip'>;

interface ImagesSectionProps {
  setValue?: any;
  watchedValues?: any;
}

interface ImagePreview {
  file?: File;
  url: string;
  isExisting?: boolean;
  isUploading?: boolean;
}

export const ImagesSection = ({ setValue, watchedValues }: ImagesSectionProps) => {
  const [imagePreviews, setImagePreviews] = useState<{[key: string]: ImagePreview}>({});
  const { toast } = useToast();

  const imageFields = [
    { key: 'imagem_geral', label: 'Imagem Geral' },
    { key: 'imagem_fachada', label: 'Imagem Fachada' },
    { key: 'imagem_lateral_1', label: 'Imagem Lateral 1' },
    { key: 'imagem_lateral_2', label: 'Imagem Lateral 2' },
    { key: 'imagem_fundos', label: 'Imagem Fundos' },
    { key: 'imagem_sala_cofre', label: 'Imagem Sala Cofre' },
    { key: 'imagem_cofre', label: 'Imagem Cofre' },
    { key: 'imagem_interna_alojamento_masculino', label: 'Imagem Interna Alojamento Masculino' },
    { key: 'imagem_interna_alojamento_feminino', label: 'Imagem Interna Alojamento Feminino' },
    { key: 'imagem_interna_plantao_uop', label: 'Imagem Interna Plantão UOP' }
  ];

  // Load existing images when editing
  useEffect(() => {
    if (watchedValues?.id) {
      console.log('=== LOADING EXISTING IMAGES ===');
      console.log('watchedValues:', watchedValues);
      
      const existingPreviews: {[key: string]: ImagePreview} = {};
      let hasExistingImages = false;
      
      imageFields.forEach(({ key }) => {
        const imageUrl = watchedValues[key];
        console.log(`Verificando campo ${key}:`, imageUrl);
        
        // Validação mais rigorosa para URLs reais de imagem
        if (imageUrl && 
            typeof imageUrl === 'string' && 
            imageUrl.trim() !== '' && 
            imageUrl !== 'null' && 
            imageUrl !== 'undefined' &&
            (imageUrl.startsWith('http') || imageUrl.startsWith('https') || imageUrl.startsWith('blob:')) &&
            !imageUrl.toLowerCase().includes('placeholder') &&
            !imageUrl.toLowerCase().includes('example') &&
            !imageUrl.toLowerCase().includes('default')) {
          
          // Verificar se a URL parece válida (contém extensão de imagem ou domínio supabase)
          const isValidImageUrl = imageUrl.includes('supabase') || 
                                  /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(imageUrl) ||
                                  imageUrl.startsWith('blob:');
          
          if (isValidImageUrl) {
            existingPreviews[key] = {
              url: imageUrl,
              isExisting: true
            };
            hasExistingImages = true;
            console.log(`✅ Imagem existente válida encontrada para ${key}: ${imageUrl}`);
          } else {
            console.log(`⚠️ URL rejeitada para ${key} (não parece ser uma imagem válida): ${imageUrl}`);
          }
        } else {
          console.log(`❌ Campo ${key} não contém imagem válida:`, imageUrl);
        }
      });
      
      if (hasExistingImages) {
        console.log('Carregando imagens existentes:', existingPreviews);
        setImagePreviews(existingPreviews);
      } else {
        console.log('Nenhuma imagem existente válida encontrada');
        setImagePreviews({});
      }
    } else {
      // Clear previews when no ID (new record)
      console.log('Novo registro - limpando previews de imagem');
      setImagePreviews({});
    }
  }, [watchedValues?.id]);

  const handleImageChange = async (fieldKey: string, files: FileList | null) => {
    console.log(`=== IMAGE CHANGE ===`);
    console.log(`Campo: ${fieldKey}`);
    console.log('Files:', files);
    
    if (files && files[0]) {
      const file = files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      console.log(`Processando imagem para campo ${fieldKey}:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Mostrar preview e estado de carregamento
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => ({
        ...prev,
        [fieldKey]: { file, url: previewUrl, isUploading: true }
      }));
      
      try {
        // Fazer upload da imagem
        const uploadedUrl = await ImageUploadService.uploadImage(file, `imovel-${watchedValues?.id || 'novo'}`);
        
        if (uploadedUrl) {
          // Atualizar preview com URL final
          setImagePreviews(prev => ({
            ...prev,
            [fieldKey]: { url: uploadedUrl, isUploading: false }
          }));
          
          // Atualizar valor no formulário
          if (setValue) {
            console.log(`Atualizando campo ${fieldKey} no formulário com URL: ${uploadedUrl}`);
            setValue(fieldKey, uploadedUrl);
          }
          
          // Limpar preview temporário
          URL.revokeObjectURL(previewUrl);
          
          toast({
            title: "Sucesso",
            description: "Imagem carregada com sucesso.",
          });
        } else {
          throw new Error('Falha no upload');
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        setImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[fieldKey];
          return newPreviews;
        });
        
        toast({
          title: "Erro",
          description: "Erro ao carregar a imagem. Tente novamente.",
          variant: "destructive",
        });
        
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  const removeImage = async (fieldKey: string) => {
    const preview = imagePreviews[fieldKey];
    
    // Se for uma imagem existente no storage, tentar deletar
    if (preview && preview.url && ImageUploadService.isStorageUrl(preview.url)) {
      await ImageUploadService.deleteImage(preview.url);
    }
    
    // Limpar preview temporário se existir
    if (preview && preview.url && !preview.isExisting && !ImageUploadService.isStorageUrl(preview.url)) {
      URL.revokeObjectURL(preview.url);
    }
    
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldKey];
      return newPreviews;
    });
    
    // Reset the file input and form value
    const input = document.getElementById(fieldKey) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
    
    if (setValue) {
      setValue(fieldKey, null);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5" />
        Imagens do Imóvel
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageFields.map(({ key, label }) => {
          const preview = imagePreviews[key];
          
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20 relative">
                {preview ? (
                  <div className="relative">
                    <img 
                      src={preview.url} 
                      alt={label}
                      className="w-full h-32 object-cover"
                    />
                    {preview.isUploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="text-sm">Carregando...</span>
                        </div>
                      </div>
                    )}
                    {!preview.isUploading && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeImage(key);
                          }}
                          className="flex items-center gap-2 z-10"
                        >
                          <X className="h-4 w-4" />
                          Remover
                        </Button>
                      </div>
                    )}
                    <div className="p-2 bg-background">
                      <p className="text-xs text-muted-foreground truncate">
                        {preview.file?.name || (preview.isExisting ? 'Imagem existente' : 'Imagem')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <label htmlFor={key} className="block cursor-pointer">
                    <div className="p-4 text-center h-32 flex flex-col justify-center">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar ou tirar uma foto
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo 5MB
                      </p>
                    </div>
                  </label>
                )}
                
                <Input
                  id={key}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    console.log(`Input onChange para campo ${key}:`, e.target.files);
                    handleImageChange(key, e.target.files);
                  }}
                  className="hidden"
                  disabled={preview?.isUploading}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};