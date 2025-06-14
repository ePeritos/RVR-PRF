import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useCAIPForm } from '@/hooks/useCAIPForm';
import { useCAIPCalculations } from '@/hooks/useCAIPCalculations';
import { UNIDADES_GESTORAS, ESTADOS_CONSERVACAO } from '@/constants/caipConstants';
import { BasicInformationSection } from './BasicInformationSection';
import { ImagesSection } from './ImagesSection';
import { LocationPropertySection } from './LocationPropertySection';
import { TechnicalDataSection } from './TechnicalDataSection';
import { InfrastructureSection } from './InfrastructureSection';
import { EnvironmentsSection } from './EnvironmentsSection';
import { SystemsSection } from './SystemsSection';
import { SecuritySection } from './SecuritySection';
import { NotesEvaluationSection } from './NotesEvaluationSection';
import { EnvironmentMaintenanceEvaluation } from './EnvironmentMaintenanceEvaluation';
import { ProgressActionsSection } from './ProgressActionsSection';

type DadosCAIP = Tables<'dados_caip'>;

interface CAIPFormDialogProps {
  editingItem?: DadosCAIP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CAIPFormDialog = ({ editingItem, open, onOpenChange, onSuccess }: CAIPFormDialogProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watchedValues,
    errors,
    isLoading,
    percentualPreenchimento,
    onSubmit,
    handleNew
  } = useCAIPForm({ editingItem, open, onOpenChange, onSuccess });

  // Use calculations hook
  useCAIPCalculations({ watchedValues, setValue });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingItem ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingItem ? 'Editar Registro CAIP' : 'Novo Registro CAIP'}
          </DialogTitle>
          {editingItem && (
            <Badge variant="outline">Editando ID: {editingItem.id}</Badge>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <BasicInformationSection 
            register={register}
            setValue={setValue}
            errors={errors}
            unidadesGestoras={UNIDADES_GESTORAS}
            estadosConservacao={ESTADOS_CONSERVACAO}
          />

          <ImagesSection register={register} />

          <LocationPropertySection 
            register={register}
            setValue={setValue}
            estadosConservacao={ESTADOS_CONSERVACAO}
          />

          <TechnicalDataSection register={register} />

          <InfrastructureSection register={register} setValue={setValue} watchedValues={watchedValues} />

          <EnvironmentsSection 
            register={register} 
            setValue={setValue} 
            watchedValues={watchedValues}
          />

          <SystemsSection register={register} setValue={setValue} watchedValues={watchedValues} />

          <SecuritySection register={register} setValue={setValue} watchedValues={watchedValues} />

          <NotesEvaluationSection 
            register={register}
            setValue={setValue}
            watchedValues={watchedValues}
          />

          <EnvironmentMaintenanceEvaluation 
            imovelData={watchedValues}
            onNotaManutencaoChange={(nota) => setValue('nota_para_manutencao', nota.toString())}
          />

          <ProgressActionsSection
            register={register}
            percentualPreenchimento={percentualPreenchimento}
            isLoading={isLoading}
            editingId={editingItem?.id}
            handleNew={handleNew}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};