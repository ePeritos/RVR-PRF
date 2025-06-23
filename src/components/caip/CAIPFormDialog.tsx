
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
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

import { ProgressActionsSection } from './ProgressActionsSection';

type DadosCAIP = Tables<'dados_caip'>;

interface CAIPFormDialogProps {
  editingItem?: DadosCAIP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CAIPFormDialog = ({ editingItem, open, onOpenChange, onSuccess }: CAIPFormDialogProps) => {
  const [avaliacoesLocais, setAvaliacoesLocais] = useState<{[key: string]: number}>({});
  const { toast } = useToast();
  
  // Debug log to check if editingItem is being received correctly
  console.log('=== CAIPFormDialog ===');
  console.log('editingItem recebido:', editingItem);
  console.log('dialog open:', open);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    watchedValues,
    errors,
    isLoading,
    percentualPreenchimento,
    onSubmit: originalOnSubmit,
    handleNew
  } = useCAIPForm({ editingItem, open, onOpenChange, onSuccess, avaliacoesLocais });

  // Use calculations hook with maintenance evaluations
  useCAIPCalculations({ watchedValues, setValue, avaliacoesManutencao: avaliacoesLocais });

  // Custom onSubmit with validation
  const onSubmit = async (data: any) => {
    console.log('=== DEBUGGING FORM SUBMISSION ===');
    console.log('Dados do formulário:', data);
    console.log('Avaliações locais state:', avaliacoesLocais);
    console.log('É novo registro?', !editingItem);
    
    // Validate environment evaluations for new records only if environments are selected
    if (!editingItem) {
      const environmentFields = [
        'almoxarifado', 'alojamento_feminino', 'alojamento_masculino', 'alojamento_misto',
        'area_de_servico', 'area_de_uso_compartilhado_com_outros_orgaos', 'arquivo', 'auditorio',
        'banheiro_para_zeladoria', 'banheiro_feminino_para_servidoras', 'banheiro_masculino_para_servidores',
        'banheiro_misto_para_servidores', 'box_com_chuveiro_externo', 'box_para_lavagem_de_veiculos',
        'canil', 'casa_de_maquinas', 'central_de_gas', 'cobertura_para_aglomeracao_de_usuarios',
        'cobertura_para_fiscalizacao_de_veiculos', 'copa_e_cozinha', 'deposito_de_lixo',
        'deposito_de_materiais_de_descarte_e_baixa', 'deposito_de_material_de_limpeza',
        'deposito_de_material_operacional', 'estacionamento_para_usuarios', 'garagem_para_servidores',
        'garagem_para_viaturas', 'lavabo_para_servidores_sem_box_para_chuveiro',
        'local_para_custodia_temporaria_de_detidos', 'local_para_guarda_provisoria_de_animais',
        'patio_de_retencao_de_veiculos', 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos',
        'ponto_de_pouso_para_aeronaves', 'rampa_de_fiscalizacao_de_veiculos', 'recepcao',
        'sala_administrativa_escritorio', 'sala_de_assepsia', 'sala_de_aula', 'sala_de_reuniao',
        'sala_de_revista_pessoal', 'sala_operacional_observatorio', 'sala_tecnica',
        'sanitario_publico', 'telefone_publico', 'torre_de_telecomunicacoes',
        'vestiario_para_nao_policiais', 'vestiario_para_policiais'
      ];

      const ambientesSelecionados = environmentFields.filter(campo => data[campo] === 'Sim');
      console.log('Ambientes selecionados:', ambientesSelecionados);

      // Só validar se há ambientes selecionados
      if (ambientesSelecionados.length > 0) {
        console.log('Verificando avaliações para ambientes selecionados...');
        
        // Verificar cada ambiente selecionado
        const ambientesSemAvaliacao = [];
        ambientesSelecionados.forEach(ambiente => {
          const nota = avaliacoesLocais[ambiente];
          console.log(`Ambiente ${ambiente}: nota = ${nota}`);
          if (!nota || nota === 0) {
            ambientesSemAvaliacao.push(ambiente);
          }
        });

        console.log('Ambientes sem avaliação:', ambientesSemAvaliacao);

        if (ambientesSemAvaliacao.length > 0) {
          toast({
            title: "Avaliações de manutenção obrigatórias",
            description: `Por favor, avalie o estado de conservação dos ${ambientesSemAvaliacao.length} ambientes ainda não avaliados: ${ambientesSemAvaliacao.join(', ')}`,
            variant: "destructive",
          });
          return;
        }
        
        console.log('✅ Todas as avaliações estão completas');
      } else {
        console.log('Nenhum ambiente selecionado, prosseguindo...');
      }
    }

    // Proceed with original submit
    console.log('Prosseguindo para o salvamento original...');
    await originalOnSubmit(data);
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
            watch={watch}
            errors={errors}
          />

          <ImagesSection 
            setValue={setValue} 
            watchedValues={watchedValues} 
          />

          <LocationPropertySection 
            register={register}
            setValue={setValue}
            estadosConservacao={ESTADOS_CONSERVACAO}
            watchedValues={watchedValues}
          />

          <TechnicalDataSection register={register} />

          <InfrastructureSection register={register} setValue={setValue} watchedValues={watchedValues} />

          <EnvironmentsSection 
            register={register} 
            setValue={setValue} 
            watchedValues={watchedValues}
            onAvaliacoesChange={setAvaliacoesLocais}
            editingItem={editingItem}
          />

          <SystemsSection register={register} setValue={setValue} watchedValues={watchedValues} />

          <SecuritySection register={register} setValue={setValue} watchedValues={watchedValues} />

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
