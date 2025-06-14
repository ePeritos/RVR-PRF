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
          <Label htmlFor="nota_para_manutencao">Nota para MANUTENÇÃO (1-10)</Label>
          <Select onValueChange={(value) => setValue('nota_para_manutencao', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a nota de manutenção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Péssimo Estado</SelectItem>
              <SelectItem value="2">2 - Muito Ruim</SelectItem>
              <SelectItem value="3">3 - Ruim</SelectItem>
              <SelectItem value="4">4 - Regular Inferior</SelectItem>
              <SelectItem value="5">5 - Regular</SelectItem>
              <SelectItem value="6">6 - Regular Superior</SelectItem>
              <SelectItem value="7">7 - Bom</SelectItem>
              <SelectItem value="8">8 - Muito Bom</SelectItem>
              <SelectItem value="9">9 - Excelente</SelectItem>
              <SelectItem value="10">10 - Novo/Perfeito</SelectItem>
            </SelectContent>
          </Select>
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