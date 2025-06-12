import { UseFormRegister } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface ImagesSectionProps {
  register: UseFormRegister<DadosCAIP>;
}

export const ImagesSection = ({ register }: ImagesSectionProps) => {
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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5" />
        Imagens do Imóvel
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageFields.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-muted/20">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <Input
                type="file"
                accept="image/*"
                {...register(key as keyof DadosCAIP)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};