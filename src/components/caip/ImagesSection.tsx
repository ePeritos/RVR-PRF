import { useState } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Image } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

type DadosCAIP = Tables<'dados_caip'>;

interface ImagesSectionProps {
  register: UseFormRegister<DadosCAIP>;
}

interface ImagePreview {
  file: File;
  url: string;
}

export const ImagesSection = ({ register }: ImagesSectionProps) => {
  const [imagePreviews, setImagePreviews] = useState<{[key: string]: ImagePreview}>({});

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

  const handleImageChange = (fieldKey: string, files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      
      setImagePreviews(prev => ({
        ...prev,
        [fieldKey]: { file, url }
      }));
    }
  };

  const removeImage = (fieldKey: string) => {
    if (imagePreviews[fieldKey]) {
      URL.revokeObjectURL(imagePreviews[fieldKey].url);
    }
    
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldKey];
      return newPreviews;
    });
    
    // Reset the file input
    const input = document.getElementById(fieldKey) as HTMLInputElement;
    if (input) {
      input.value = '';
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
              <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/20">
                {preview ? (
                  <div className="relative">
                    <img 
                      src={preview.url} 
                      alt={label}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(key)}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                    <div className="p-2 bg-background">
                      <p className="text-xs text-muted-foreground truncate">
                        {preview.file.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Clique para selecionar uma imagem
                    </p>
                  </div>
                )}
                
                <Input
                  id={key}
                  type="file"
                  accept="image/*"
                  {...register(key as keyof DadosCAIP)}
                  onChange={(e) => handleImageChange(key, e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};