import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Loader2, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { ImageUploadService } from '@/utils/imageUpload';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  error?: string;
}

export const ImagesSection = ({ setValue, watchedValues }: ImagesSectionProps) => {
  const [imagePreviews, setImagePreviews] = useState<{[key: string]: ImagePreview}>({});
  const [globalError, setGlobalError] = useState<string>('');
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

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB em bytes
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // useEffect for loading existing images
  useEffect(() => {
    if (watchedValues?.id) {
      console.log('=== LOADING EXISTING IMAGES ===');
      console.log('watchedValues:', watchedValues);
      
      const existingPreviews: {[key: string]: ImagePreview} = {};
      let hasExistingImages = false;
      
      imageFields.forEach(({ key }) => {
        const imageUrl = watchedValues[key];
        console.log(`Verificando campo ${key}:`, imageUrl);
        
        if (imageUrl && 
            typeof imageUrl === 'string' && 
            imageUrl.trim() !== '' && 
            imageUrl !== 'null' && 
            imageUrl !== 'undefined' &&
            (imageUrl.startsWith('http') || imageUrl.startsWith('https') || imageUrl.startsWith('blob:')) &&
            !imageUrl.toLowerCase().includes('placeholder') &&
            !imageUrl.toLowerCase().includes('example') &&
            !imageUrl.toLowerCase().includes('default')) {
          
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
      console.log('Novo registro - limpando previews de imagem');
      setImagePreviews({});
    }
  }, [watchedValues?.id]);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Validar tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: `Tipo de arquivo não permitido. Use apenas: ${ALLOWED_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ')}`
      };
    }

    // Validar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return {
        isValid: false,
        error: `Arquivo muito grande (${fileSizeMB}MB). O tamanho máximo permitido é ${maxSizeMB}MB.`
      };
    }

    // Validar nome do arquivo
    if (file.name.length > 100) {
      return {
        isValid: false,
        error: 'Nome do arquivo muito longo. Use um nome com menos de 100 caracteres.'
      };
    }

    return { isValid: true };
  };

  const handleImageChange = async (fieldKey: string, files: FileList | null) => {
    console.log(`=== IMAGE CHANGE ===`);
    console.log(`Campo: ${fieldKey}`);
    console.log('Files:', files);
    
    // Limpar erro global
    setGlobalError('');
    
    if (files && files[0]) {
      const file = files[0];
      
      console.log(`Processando imagem para campo ${fieldKey}:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Validar arquivo
      const validation = validateFile(file);
      if (!validation.isValid) {
        console.error(`Erro de validação para ${fieldKey}:`, validation.error);
        
        // Mostrar erro específico
        setImagePreviews(prev => ({
          ...prev,
          [fieldKey]: {
            ...prev[fieldKey],
            error: validation.error
          }
        }));

        toast({
          title: "Erro na Imagem",
          description: `${imageFields.find(f => f.key === fieldKey)?.label}: ${validation.error}`,
          variant: "destructive",
        });

        // Limpar o input
        const input = document.getElementById(fieldKey) as HTMLInputElement;
        if (input) {
          input.value = '';
        }
        
        return;
      }
      
      // Mostrar preview e estado de carregamento
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => ({
        ...prev,
        [fieldKey]: { 
          file, 
          url: previewUrl, 
          isUploading: true,
          error: undefined // Limpar erro anterior
        }
      }));
      
      try {
        // Fazer upload da imagem
        const uploadedUrl = await ImageUploadService.uploadImage(file, `imovel-${watchedValues?.id || 'novo'}`);
        
        if (uploadedUrl) {
          // Atualizar preview com URL final
          setImagePreviews(prev => ({
            ...prev,
            [fieldKey]: { 
              url: uploadedUrl, 
              isUploading: false,
              error: undefined
            }
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
            description: `${imageFields.find(f => f.key === fieldKey)?.label} carregada com sucesso.`,
          });
        } else {
          throw new Error('Falha no upload - URL não retornada');
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
        
        setImagePreviews(prev => ({
          ...prev,
          [fieldKey]: {
            ...prev[fieldKey],
            isUploading: false,
            error: `Erro no upload: ${errorMessage}`
          }
        }));
        
        toast({
          title: "Erro no Upload",
          description: `${imageFields.find(f => f.key === fieldKey)?.label}: ${errorMessage}`,
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

    toast({
      title: "Imagem Removida",
      description: `${imageFields.find(f => f.key === fieldKey)?.label} foi removida com sucesso.`,
    });
  };

  // Verificar se há erros nas imagens
  const hasImageErrors = Object.values(imagePreviews).some(preview => preview.error);
  const imageErrorCount = Object.values(imagePreviews).filter(preview => preview.error).length;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5" />
        Imagens do Imóvel
      </h3>

      {/* Alert global para erros de imagem */}
      {hasImageErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {imageErrorCount === 1 
              ? 'Uma imagem possui erro e precisa ser corrigida antes de salvar.'
              : `${imageErrorCount} imagens possuem erros e precisam ser corrigidas antes de salvar.`
            }
          </AlertDescription>
        </Alert>
      )}

      {globalError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Requisitos para imagens:</strong>
        </p>
        <ul className="text-xs text-muted-foreground mt-1 space-y-1">
          <li>• Tamanho máximo: 5MB por arquivo</li>
          <li>• Formatos aceitos: JPG, PNG, GIF, WebP</li>
          <li>• Nome do arquivo: máximo 100 caracteres</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageFields.map(({ key, label }) => {
          const preview = imagePreviews[key];
          const hasError = preview?.error;
          
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className={hasError ? 'text-destructive' : ''}>
                {label}
                {hasError && <span className="ml-1">⚠️</span>}
              </Label>
              
              <div className={`border-2 border-dashed rounded-lg overflow-hidden bg-muted/20 relative ${
                hasError ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary/50 transition-colors duration-200'
              }`}>
                {preview && !hasError ? (
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
                ) : hasError ? (
                  <div className="p-4 text-center h-32 flex flex-col justify-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                    <p className="text-sm text-destructive font-medium mb-2">Erro na Imagem</p>
                    <p className="text-xs text-destructive">{preview.error}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        // Limpar erro e permitir nova tentativa
                        setImagePreviews(prev => {
                          const newPreviews = { ...prev };
                          delete newPreviews[key];
                          return newPreviews;
                        });
                        // Reset input
                        const input = document.getElementById(key) as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                    >
                      Tentar Novamente
                    </Button>
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
              
              {/* Erro específico do campo */}
              {hasError && (
                <p className="text-xs text-destructive mt-1">
                  {preview.error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
