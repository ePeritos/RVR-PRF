import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { BasicInformationSection } from './BasicInformationSection';
import { ImagesSection } from './ImagesSection';
import { LocationPropertySection } from './LocationPropertySection';
import { TechnicalDataSection } from './TechnicalDataSection';
import { InfrastructureSection } from './InfrastructureSection';
import { EnvironmentsSection } from './EnvironmentsSection';
import { SystemsSection } from './SystemsSection';
import { SecuritySection } from './SecuritySection';
import { NotesEvaluationSection } from './NotesEvaluationSection';
import { ProgressActionsSection } from './ProgressActionsSection';

type DadosCAIP = Tables<'dados_caip'>;

interface CAIPFormDialogProps {
  editingItem?: DadosCAIP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CAIPFormDialog = ({ editingItem, open, onOpenChange, onSuccess }: CAIPFormDialogProps) => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [percentualPreenchimento, setPercentualPreenchimento] = useState(0);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DadosCAIP>();
  const watchedValues = watch();

  // Lista de unidades gestoras baseada no perfil do usuário
  const unidadesGestoras = [
    'SPRF/AC', 'SPRF/AL', 'SPRF/AP', 'SPRF/AM', 'SPRF/BA', 'SPRF/CE',
    'SPRF/DF', 'SPRF/ES', 'SPRF/GO', 'SPRF/MA', 'SPRF/MT', 'SPRF/MS',
    'SPRF/MG', 'SPRF/PA', 'SPRF/PB', 'SPRF/PR', 'SPRF/PE', 'SPRF/PI',
    'SPRF/RJ', 'SPRF/RN', 'SPRF/RS', 'SPRF/RO', 'SPRF/RR', 'SPRF/SC',
    'SPRF/SP', 'SPRF/SE', 'SPRF/TO', 'SEDE NACIONAL', 'UNIPRF'
  ];

  // Estados de conservação
  const estadosConservacao = [
    { value: 'A', label: 'A - Novo' },
    { value: 'B', label: 'B - Entre novo e regular' },
    { value: 'C', label: 'C - Regular' },
    { value: 'D', label: 'D - Entre regular e reparos simples' },
    { value: 'E', label: 'E - Reparos simples' },
    { value: 'F', label: 'F - Entre reparos simples e importantes' },
    { value: 'G', label: 'G - Reparos importantes' },
    { value: 'H', label: 'H - Entre reparos importantes e sem valor' }
  ];

  // Preencher campos automáticos
  useEffect(() => {
    if (profile && !editingItem) {
      setValue('cadastrador', profile.nome_completo);
      setValue('alterador', profile.nome_completo);
      setValue('ultima_alteracao', new Date().toISOString().split('T')[0]);
      if (profile.unidade_lotacao) {
        setValue('unidade_gestora', profile.unidade_lotacao);
      }
    }
  }, [profile, editingItem, setValue, open]);

  // Preencher formulário com dados existentes quando editar
  useEffect(() => {
    if (editingItem && open) {
      Object.keys(editingItem).forEach(key => {
        setValue(key as keyof DadosCAIP, editingItem[key as keyof DadosCAIP]);
      });
    } else if (!editingItem && open) {
      reset();
    }
  }, [editingItem, open, setValue, reset]);

  // Calcular percentual de preenchimento
  useEffect(() => {
    if (watchedValues) {
      const campos = Object.keys(watchedValues);
      const camposPreenchidos = campos.filter(campo => {
        const valor = watchedValues[campo as keyof DadosCAIP];
        return valor !== null && valor !== undefined && valor !== '';
      });
      
      const percentual = Math.round((camposPreenchidos.length / campos.length) * 100);
      setPercentualPreenchimento(percentual);
      setValue('percentual_preenchimento', percentual.toString());
      setValue('preenchido', percentual > 70 ? 'Sim' : 'Não');
      setValue('data_alteracao_preenchida', new Date().toISOString().split('T')[0]);
    }
  }, [watchedValues, setValue]);

  const validateAnoCAIP = (value: string) => {
    const year = parseInt(value);
    if (isNaN(year) || year % 2 === 0) {
      return 'O Ano CAIP deve ser um número ímpar.';
    }
    return true;
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Validate Ano CAIP
      if (data.ano_caip) {
        const validation = validateAnoCAIP(data.ano_caip);
        if (validation !== true) {
          toast({
            title: "Erro de Validação",
            description: validation,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      if (editingItem) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('dados_caip')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Registro atualizado com sucesso.",
        });
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('dados_caip')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Novo registro criado com sucesso.",
        });
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = () => {
    reset();
  };

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
            unidadesGestoras={unidadesGestoras}
            estadosConservacao={estadosConservacao}
          />

          <ImagesSection register={register} />

          <LocationPropertySection 
            register={register}
            setValue={setValue}
            estadosConservacao={estadosConservacao}
          />

          <TechnicalDataSection register={register} />

          <InfrastructureSection register={register} setValue={setValue} />

          <EnvironmentsSection register={register} setValue={setValue} />

          <SystemsSection register={register} setValue={setValue} />

          <SecuritySection register={register} setValue={setValue} />

          <NotesEvaluationSection 
            register={register}
            setValue={setValue}
            watchedValues={watchedValues}
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