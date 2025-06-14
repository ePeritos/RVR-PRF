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

  // Calcular nota de adequação em tempo real
  useEffect(() => {
    if (watchedValues && watchedValues.tipo_de_unidade) {
      const tipoUnidade = watchedValues.tipo_de_unidade;
      let pesoTotalPossivel = 0;
      let pesoAlcancado = 0;

      // Definir peso total possível baseado no tipo de unidade
      if (tipoUnidade === 'UOP') {
        pesoTotalPossivel = 192;
      } else if (tipoUnidade === 'Delegacia') {
        pesoTotalPossivel = 154;
      } else {
        setValue('nota_para_adequacao', '0');
        return;
      }

      // Regra especial para "Alojamento" (peso UOP: 10, DEL: 0)
      if (tipoUnidade === 'UOP') {
        const alojamentoMasculino = watchedValues.alojamento_masculino === 'Sim';
        const alojamentoFeminino = watchedValues.alojamento_feminino === 'Sim';
        const alojamentoMisto = watchedValues.alojamento_misto === 'Sim';

        if (alojamentoMasculino && alojamentoFeminino) {
          pesoAlcancado += 10; // Pontuação integral
        } else if (alojamentoMasculino || alojamentoFeminino || alojamentoMisto) {
          pesoAlcancado += 5; // Meia pontuação
        }
      }

      // Regra especial para "Banheiro para servidores" (peso UOP: 10, DEL: 10)
      const banheiroMasculino = watchedValues.banheiro_masculino_para_servidores === 'Sim';
      const banheiroFeminino = watchedValues.banheiro_feminino_para_servidoras === 'Sim';
      const banheiroMisto = watchedValues.banheiro_misto_para_servidores === 'Sim';

      if (banheiroMasculino && banheiroFeminino) {
        pesoAlcancado += 10; // Pontuação integral
      } else if (banheiroMasculino || banheiroFeminino || banheiroMisto) {
        pesoAlcancado += 5; // Meia pontuação
      }

      // Demais ambientes - aplicar peso baseado no tipo de unidade (EXCLUINDO alojamentos e banheiros já calculados)
      const ambientesUOP = {
        almoxarifado: 6, area_de_servico: 6, area_de_uso_compartilhado_com_outros_orgaos: 0,
        arquivo: 6, auditorio: 0, banheiro_para_zeladoria: 0, box_com_chuveiro_externo: 0,
        box_para_lavagem_de_veiculos: 3, canil: 0, casa_de_maquinas: 6, central_de_gas: 6,
        cobertura_para_aglomeracao_de_usuarios: 6, cobertura_para_fiscalizacao_de_veiculos: 6,
        copa_e_cozinha: 6, deposito_de_lixo: 0, deposito_de_materiais_de_descarte_e_baixa: 3,
        deposito_de_material_de_limpeza: 6, deposito_de_material_operacional: 6,
        estacionamento_para_usuarios: 6, garagem_para_servidores: 3, garagem_para_viaturas: 6,
        lavabo_para_servidores_sem_box_para_chuveiro: 3, local_para_custodia_temporaria_de_detidos: 6,
        local_para_guarda_provisoria_de_animais: 0, patio_de_retencao_de_veiculos: 10,
        plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos: 6, ponto_de_pouso_para_aeronaves: 3,
        rampa_de_fiscalizacao_de_veiculos: 10, recepcao: 3, sala_administrativa_escritorio: 6,
        sala_de_assepsia: 0, sala_de_aula: 3, sala_de_reuniao: 0, sala_de_revista_pessoal: 0,
        sala_operacional_observatorio: 10, sala_tecnica: 6, sanitario_publico: 10,
        telefone_publico: 3, torre_de_telecomunicacoes: 6, vestiario_para_nao_policiais: 3,
        vestiario_para_policiais: 6
      };

      const ambientesDelegacia = {
        almoxarifado: 10, area_de_servico: 6, area_de_uso_compartilhado_com_outros_orgaos: 0,
        arquivo: 0, auditorio: 3, banheiro_para_zeladoria: 3, box_com_chuveiro_externo: 3,
        box_para_lavagem_de_veiculos: 0, canil: 0, casa_de_maquinas: 6, central_de_gas: 6,
        cobertura_para_aglomeracao_de_usuarios: 0, cobertura_para_fiscalizacao_de_veiculos: 0,
        copa_e_cozinha: 6, deposito_de_lixo: 6, deposito_de_materiais_de_descarte_e_baixa: 0,
        deposito_de_material_de_limpeza: 3, deposito_de_material_operacional: 3,
        estacionamento_para_usuarios: 6, garagem_para_servidores: 6, garagem_para_viaturas: 10,
        lavabo_para_servidores_sem_box_para_chuveiro: 0, local_para_custodia_temporaria_de_detidos: 0,
        local_para_guarda_provisoria_de_animais: 0, patio_de_retencao_de_veiculos: 0,
        plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos: 0, ponto_de_pouso_para_aeronaves: 0,
        rampa_de_fiscalizacao_de_veiculos: 0, recepcao: 10, sala_administrativa_escritorio: 10,
        sala_de_assepsia: 0, sala_de_aula: 3, sala_de_reuniao: 6, sala_de_revista_pessoal: 0,
        sala_operacional_observatorio: 0, sala_tecnica: 6, sanitario_publico: 10,
        telefone_publico: 3, torre_de_telecomunicacoes: 10, vestiario_para_nao_policiais: 6,
        vestiario_para_policiais: 6
      };

      const ambientes = tipoUnidade === 'UOP' ? ambientesUOP : ambientesDelegacia;

      // Campos já calculados nas regras especiais - não somar novamente
      const camposJaCalculados = [
        'alojamento_masculino', 'alojamento_feminino', 'alojamento_misto',
        'banheiro_masculino_para_servidores', 'banheiro_feminino_para_servidoras', 'banheiro_misto_para_servidores'
      ];

      Object.keys(ambientes).forEach(ambiente => {
        if (!camposJaCalculados.includes(ambiente) && watchedValues[ambiente as keyof DadosCAIP] === 'Sim') {
          pesoAlcancado += ambientes[ambiente as keyof typeof ambientes];
        }
      });

      // Calcular nota final garantindo que não ultrapasse 100
      const notaFinal = Math.min(100, Math.round((pesoAlcancado / pesoTotalPossivel) * 100 * 100) / 100);
      setValue('nota_para_adequacao', notaFinal.toString());
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

      // Garantir que as notas não ultrapassem 100
      const processedData = {
        ...data,
        nota_para_adequacao: data.nota_para_adequacao ? Math.min(100, parseFloat(data.nota_para_adequacao)).toString() : data.nota_para_adequacao,
        nota_para_manutencao: data.nota_para_manutencao ? Math.min(100, parseFloat(data.nota_para_manutencao)).toString() : data.nota_para_manutencao,
      };

      if (editingItem) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('dados_caip')
          .update({
            ...processedData,
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
            ...processedData,
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

          <InfrastructureSection register={register} setValue={setValue} watchedValues={watchedValues} />

          <EnvironmentsSection register={register} setValue={setValue} watchedValues={watchedValues} />

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