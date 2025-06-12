import { UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface ProgressActionsSectionProps {
  register: UseFormRegister<DadosCAIP>;
  percentualPreenchimento: number;
  isLoading: boolean;
  editingId: string | null;
  handleNew: () => void;
}

export const ProgressActionsSection = ({ 
  register, 
  percentualPreenchimento, 
  isLoading, 
  editingId, 
  handleNew 
}: ProgressActionsSectionProps) => {
  return (
    <>
      {/* Campos calculados ocultos */}
      <input type="hidden" {...register('preenchido')} />
      <input type="hidden" {...register('percentual_preenchimento')} />
      <input type="hidden" {...register('gatilho')} />
      <input type="hidden" {...register('data_alteracao_preenchida')} />
      <input type="hidden" {...register('id_caip')} />

      {/* Mostrar percentual de preenchimento */}
      <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Progresso do preenchimento:</p>
          <p className="text-2xl font-bold text-primary">{percentualPreenchimento}%</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}
        </Button>
        {editingId && (
          <Button type="button" variant="outline" onClick={handleNew}>
            Cancelar Edição
          </Button>
        )}
      </div>
    </>
  );
};