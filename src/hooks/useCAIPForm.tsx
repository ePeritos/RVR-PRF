import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { validateAnoCAIP, processFormData } from '@/utils/caipValidations';

type DadosCAIP = Tables<'dados_caip'>;

interface UseCAIPFormProps {
  editingItem?: DadosCAIP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const useCAIPForm = ({ editingItem, open, onOpenChange, onSuccess }: UseCAIPFormProps) => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [percentualPreenchimento, setPercentualPreenchimento] = useState(0);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DadosCAIP>();
  const watchedValues = watch();

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
    }
  }, [watchedValues]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Validações obrigatórias
      if (!data.unidade_gestora) {
        toast({
          title: "Campo obrigatório",
          description: "Por favor, selecione a Unidade Gestora.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data.tipo_de_unidade) {
        toast({
          title: "Campo obrigatório", 
          description: "Por favor, selecione o Tipo de Unidade.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validar notas de manutenção para ambientes selecionados
      const ambientesSelecionados = [];
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

      environmentFields.forEach(campo => {
        if (data[campo] === 'Sim') {
          ambientesSelecionados.push(campo);
        }
      });

      // Validação simplificada - a validação detalhada está no CAIPFormDialog
      console.log('useCAIPForm: Validação básica dos campos obrigatórios');

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

      const processedData = await processFormData(data);
      console.log('Dados processados para salvamento:', processedData);

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

  return {
    register,
    handleSubmit,
    reset,
    setValue,
    watchedValues,
    errors,
    isLoading,
    percentualPreenchimento,
    onSubmit,
    handleNew
  };
};