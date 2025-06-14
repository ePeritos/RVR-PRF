import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface NotesEvaluationSectionProps {
  register: UseFormRegister<DadosCAIP>;
  setValue: UseFormSetValue<DadosCAIP>;
  watchedValues?: any;
}

export const NotesEvaluationSection = ({ register, setValue, watchedValues }: NotesEvaluationSectionProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Notas e Avaliações</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nota_para_adequacao">Nota para ADEQUAÇÃO (Calculada Automaticamente)</Label>
          <Input 
            {...register('nota_para_adequacao')}
            disabled
            placeholder="Será calculada automaticamente"
            className="bg-muted text-muted-foreground cursor-not-allowed"
            value={watchedValues?.nota_para_adequacao || ''}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Esta nota é calculada automaticamente com base nos ambientes existentes no imóvel.
          </p>
        </div>
        <div>
          <Label htmlFor="nota_para_manutencao">Nota para MANUTENÇÃO (Calculada Automaticamente)</Label>
          <Input 
            {...register('nota_para_manutencao')}
            disabled
            placeholder="Será calculada automaticamente"
            className="bg-muted text-muted-foreground cursor-not-allowed"
            value={watchedValues?.nota_para_manutencao || ''}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Esta nota é calculada automaticamente com base na avaliação dos ambientes existentes no imóvel.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="precisaria_de_qual_intervencao">Precisaria de qual intervenção?</Label>
        <Textarea {...register('precisaria_de_qual_intervencao')} placeholder="Descreva as intervenções necessárias" />
      </div>
      <div className="mt-4">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea {...register('observacoes')} placeholder="Outras observações relevantes" />
      </div>
    </Card>
  );
};