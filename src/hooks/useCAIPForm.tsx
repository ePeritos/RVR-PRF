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
  avaliacoesLocais?: {[key: string]: number};
}

export const useCAIPForm = ({ editingItem, open, onOpenChange, onSuccess, avaliacoesLocais }: UseCAIPFormProps) => {
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
    console.log('=== DEBUGGING FORM LOADING ===');
    console.log('editingItem:', editingItem);
    console.log('open:', open);
    console.log('editingItem && open:', editingItem && open);
    
    if (editingItem && open) {
      console.log('Preenchendo formulário com dados existentes...');
      console.log('Dados a serem carregados:', editingItem);
      
      // Load each field from the editing item
      Object.keys(editingItem).forEach(key => {
        const value = editingItem[key as keyof DadosCAIP];
        if (value !== null && value !== undefined) {
          console.log(`Setting ${key}:`, value);
          setValue(key as keyof DadosCAIP, value);
        }
      });
    } else if (!editingItem && open) {
      console.log('Novo registro - resetando formulário...');
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
        const { data: newRecord, error } = await supabase
          .from('dados_caip')
          .insert([{
            ...processedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (error) throw error;

        // Salvar as avaliações de ambientes se existirem
        if (newRecord && avaliacoesLocais && Object.keys(avaliacoesLocais).length > 0) {
          console.log('Salvando avaliações para novo registro...');
          await salvarAvaliacoesAmbientes(newRecord.id, processedData.tipo_de_unidade, avaliacoesLocais);
          
          // Aguardar um pouco para o trigger processar
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Buscar as notas atualizadas
          const { data: notasAtualizadas } = await supabase
            .from('dados_caip')
            .select('nota_para_manutencao, nota_global')
            .eq('id', newRecord.id)
            .single();
            
          console.log('Notas após salvamento:', notasAtualizadas);
        }

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

  const salvarAvaliacoesAmbientes = async (imovelId: string, tipoUnidade: string, avaliacoes: {[key: string]: number}) => {
    console.log('=== SALVANDO AVALIAÇÕES DE AMBIENTES ===');
    console.log('Imóvel ID:', imovelId);
    console.log('Tipo de Unidade:', tipoUnidade);
    console.log('Avaliações:', avaliacoes);

    try {
      // Mapear campos do formulário para nomes de ambientes
      const camposAmbientes = [
        { campo: 'almoxarifado', nomeAmbiente: 'Almoxarifado' },
        { campo: 'alojamento_feminino', nomeAmbiente: 'Alojamento' },
        { campo: 'alojamento_masculino', nomeAmbiente: 'Alojamento' },
        { campo: 'alojamento_misto', nomeAmbiente: 'Alojamento' },
        { campo: 'area_de_servico', nomeAmbiente: 'Área de serviço' },
        { campo: 'area_de_uso_compartilhado_com_outros_orgaos', nomeAmbiente: 'Área de uso compartilhado' },
        { campo: 'arquivo', nomeAmbiente: 'Arquivo' },
        { campo: 'auditorio', nomeAmbiente: 'Auditório' },
        { campo: 'banheiro_para_zeladoria', nomeAmbiente: 'Banheiro para zeladoria' },
        { campo: 'banheiro_feminino_para_servidoras', nomeAmbiente: 'Banheiro para servidores' },
        { campo: 'banheiro_masculino_para_servidores', nomeAmbiente: 'Banheiro para servidores' },
        { campo: 'banheiro_misto_para_servidores', nomeAmbiente: 'Banheiro para servidores' },
        { campo: 'box_com_chuveiro_externo', nomeAmbiente: 'Box com chuveiro externo' },
        { campo: 'box_para_lavagem_de_veiculos', nomeAmbiente: 'Box para lavagem de veículos' },
        { campo: 'canil', nomeAmbiente: 'Canil' },
        { campo: 'casa_de_maquinas', nomeAmbiente: 'Casa de máquinas' },
        { campo: 'central_de_gas', nomeAmbiente: 'Central de gás' },
        { campo: 'cobertura_para_aglomeracao_de_usuarios', nomeAmbiente: 'Cobertura para aglomeração de usuários' },
        { campo: 'cobertura_para_fiscalizacao_de_veiculos', nomeAmbiente: 'Cobertura para fiscalização de veículos' },
        { campo: 'copa_e_cozinha', nomeAmbiente: 'Copa e cozinha' },
        { campo: 'deposito_de_lixo', nomeAmbiente: 'Depósito de lixo' },
        { campo: 'deposito_de_materiais_de_descarte_e_baixa', nomeAmbiente: 'Depósito de materiais de descarte e baixa' },
        { campo: 'deposito_de_material_de_limpeza', nomeAmbiente: 'Depósito de material de limpeza' },
        { campo: 'deposito_de_material_operacional', nomeAmbiente: 'Depósito de material operacional' },
        { campo: 'estacionamento_para_usuarios', nomeAmbiente: 'Estacionamento para usuários' },
        { campo: 'garagem_para_servidores', nomeAmbiente: 'Garagem para servidores' },
        { campo: 'garagem_para_viaturas', nomeAmbiente: 'Garagem para viaturas' },
        { campo: 'lavabo_para_servidores_sem_box_para_chuveiro', nomeAmbiente: 'Lavabo para servidores sem box para chuveiro' },
        { campo: 'local_para_custodia_temporaria_de_detidos', nomeAmbiente: 'Local para custódia temporária de detidos' },
        { campo: 'local_para_guarda_provisoria_de_animais', nomeAmbiente: 'Local para guarda provisória de animais' },
        { campo: 'patio_de_retencao_de_veiculos', nomeAmbiente: 'Pátio de retenção de veículos' },
        { campo: 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos', nomeAmbiente: 'Plataforma para fiscalização da parte superior dos veículos' },
        { campo: 'ponto_de_pouso_para_aeronaves', nomeAmbiente: 'Ponto de pouso para aeronaves' },
        { campo: 'rampa_de_fiscalizacao_de_veiculos', nomeAmbiente: 'Rampa de fiscalização de veículos' },
        { campo: 'recepcao', nomeAmbiente: 'Recepção' },
        { campo: 'sala_administrativa_escritorio', nomeAmbiente: 'Sala administrativa/escritório' },
        { campo: 'sala_de_assepsia', nomeAmbiente: 'Sala de assepsia' },
        { campo: 'sala_de_aula', nomeAmbiente: 'Sala de aula' },
        { campo: 'sala_de_reuniao', nomeAmbiente: 'Sala de reunião' },
        { campo: 'sala_de_revista_pessoal', nomeAmbiente: 'Sala de revista pessoal' },
        { campo: 'sala_operacional_observatorio', nomeAmbiente: 'Sala operacional/observatório' },
        { campo: 'sala_tecnica', nomeAmbiente: 'Sala técnica' },
        { campo: 'sanitario_publico', nomeAmbiente: 'Sanitário público' },
        { campo: 'telefone_publico', nomeAmbiente: 'Telefone público' },
        { campo: 'torre_de_telecomunicacoes', nomeAmbiente: 'Torre de telecomunicações' },
        { campo: 'vestiario_para_nao_policiais', nomeAmbiente: 'Vestiário para não policiais' },
        { campo: 'vestiario_para_policiais', nomeAmbiente: 'Vestiário para policiais' }
      ];

      // Buscar ambientes do caderno baseado no tipo de unidade
      const { data: cadernoAmbientes, error: errorCaderno } = await supabase
        .from('caderno_ambientes')
        .select(`
          id,
          nome_ambiente,
          tipos_imoveis!inner(nome_tipo)
        `)
        .eq('tipos_imoveis.nome_tipo', tipoUnidade);

      if (errorCaderno) {
        console.error('Erro ao buscar caderno de ambientes:', errorCaderno);
        return;
      }

      console.log('Caderno de ambientes encontrado:', cadernoAmbientes);

      // Preparar dados para inserção
      const avaliacoesParaInserir = [];
      
      for (const [campo, score] of Object.entries(avaliacoes)) {
        if (score > 0) { // Só salvar avaliações válidas
          const campoCorrespondente = camposAmbientes.find(c => c.campo === campo);
          if (campoCorrespondente) {
            const ambiente = cadernoAmbientes?.find(a => a.nome_ambiente === campoCorrespondente.nomeAmbiente);
            if (ambiente) {
              avaliacoesParaInserir.push({
                imovel_id: imovelId,
                ambiente_id: ambiente.id,
                score_conservacao: score,
                observacoes: null
              });
              console.log(`✅ Preparada avaliação para ${campo}: ${score}`);
            } else {
              console.log(`❌ Ambiente não encontrado para ${campo} (${campoCorrespondente.nomeAmbiente})`);
            }
          }
        }
      }

      console.log('Avaliações para inserir:', avaliacoesParaInserir);

      // Inserir avaliações em lote
      if (avaliacoesParaInserir.length > 0) {
        const { error: errorInsert } = await supabase
          .from('manutencao_ambientes')
          .insert(avaliacoesParaInserir);

        if (errorInsert) {
          console.error('Erro ao inserir avaliações:', errorInsert);
          throw errorInsert;
        }

        console.log(`✅ ${avaliacoesParaInserir.length} avaliações salvas com sucesso`);
      }

    } catch (error) {
      console.error('Erro ao salvar avaliações de ambientes:', error);
      throw error;
    }
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