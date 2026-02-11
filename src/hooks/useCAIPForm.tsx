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
  const [imageErrors, setImageErrors] = useState<{[key: string]: string}>({});

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DadosCAIP>();
  const watchedValues = watch();

  useEffect(() => {
    if (!editingItem && profile && open) {
      console.log('🆕 Preenchendo campos automáticos para novo registro');
      setValue('cadastrador', profile.nome_completo);
      setValue('alterador', profile.nome_completo);
      setValue('ultima_alteracao', new Date().toISOString().split('T')[0]);
      if (profile.unidade_lotacao) {
        setValue('unidade_gestora', profile.unidade_lotacao);
      }
    }
  }, [profile, editingItem, setValue, open]);

  useEffect(() => {
    console.log('🔄 === useCAIPForm: Effect de carregamento ===');
    console.log('editingItem:', editingItem);
    console.log('open:', open);
    
    if (!open) {
      console.log('❌ Dialog não está aberto, resetando formulário');
      reset();
      return;
    }

    if (editingItem) {
      console.log('✅ Carregando dados para edição:', editingItem.id);
      console.log('📋 Dados do item:', {
        id: editingItem.id,
        nome_da_unidade: editingItem.nome_da_unidade,
        ano_caip: editingItem.ano_caip,
        endereco: editingItem.endereco,
        unidade_gestora: editingItem.unidade_gestora,
        tipo_de_unidade: editingItem.tipo_de_unidade
      });
      
      // Carregar todos os campos do editingItem
      Object.entries(editingItem).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          console.log(`📝 Definindo campo ${key}:`, value);
          setValue(key as keyof DadosCAIP, value);
        }
      });
      
      console.log('✅ Carregamento de dados concluído');
    } else {
      console.log('🆕 Novo registro - campos serão preenchidos pelo useEffect de campos automáticos');
    }
  }, [editingItem, open, setValue, reset]);

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

  // Função para validar imagens antes do submit
  const validateImages = (): boolean => {
    const imageFields = [
      'imagem_geral', 'imagem_fachada', 'imagem_lateral_1', 'imagem_lateral_2', 
      'imagem_fundos', 'imagem_sala_cofre', 'imagem_cofre', 
      'imagem_interna_alojamento_masculino', 'imagem_interna_alojamento_feminino', 
      'imagem_interna_plantao_uop'
    ];

    const errors: {[key: string]: string} = {};
    let hasErrors = false;

    imageFields.forEach(field => {
      const imageUrl = watchedValues[field as keyof DadosCAIP];
      
      // Se há uma URL de imagem, verificar se é válida
      if (imageUrl && typeof imageUrl === 'string') {
        // Verificar se não é uma URL temporária (blob) que indica upload em andamento
        if (imageUrl.startsWith('blob:')) {
          errors[field] = 'Upload em andamento. Aguarde a conclusão.';
          hasErrors = true;
        }
        // Verificar se é uma URL válida de imagem
        else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('https')) {
          errors[field] = 'URL de imagem inválida.';
          hasErrors = true;
        }
      }
    });

    setImageErrors(errors);

    if (hasErrors) {
      const errorCount = Object.keys(errors).length;
      toast({
        title: "Erro nas Imagens",
        description: `${errorCount === 1 
          ? 'Uma imagem possui erro' 
          : `${errorCount} imagens possuem erros`
        }. Corrija antes de salvar.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const onSubmit = async (data: any) => {
    console.log('🚀 === INICIANDO SUBMIT ===');
    console.log('Dados do formulário:', data);
    console.log('É edição?', !!editingItem);
    
    setIsLoading(true);
    
    try {
      // Validar imagens primeiro
      if (!validateImages()) {
        setIsLoading(false);
        return;
      }

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

      // Validação simplificada para ambientes (detalhada no CAIPFormDialog)
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
        console.log('📝 Atualizando registro existente:', editingItem.id);
        
        // Atualizar registro existente - processFormData already removes id/created_at/updated_at
        const { error } = await supabase
          .from('dados_caip')
          .update({
            ...processedData,
            updated_at: new Date().toISOString(),
            ultima_alteracao: new Date().toISOString().split('T')[0],
            alterador: profile?.nome_completo || processedData.alterador,
          })
          .eq('id', editingItem.id);

        if (error) {
          console.error('❌ Erro ao atualizar:', error);
          throw error;
        }

        console.log('✅ Registro atualizado com sucesso');
        
        toast({
          title: "Sucesso",
          description: "Registro atualizado com sucesso.",
        });
      } else {
        console.log('🆕 Criando novo registro');
        
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

        if (error) {
          console.error('❌ Erro ao criar:', error);
          throw error;
        }

        console.log('✅ Novo registro criado:', newRecord);

        if (newRecord && avaliacoesLocais && Object.keys(avaliacoesLocais).length > 0) {
          console.log('Salvando avaliações para novo registro...');
          await salvarAvaliacoesAmbientes(newRecord.id, processedData.tipo_de_unidade, avaliacoesLocais);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
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
      setImageErrors({}); // Limpar erros de imagem
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      
      // Verificar se é erro relacionado a imagem
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      if (errorMessage.toLowerCase().includes('image') || errorMessage.toLowerCase().includes('storage')) {
        toast({
          title: "Erro nas Imagens",
          description: "Erro ao processar imagens. Verifique se todas as imagens foram carregadas corretamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao salvar os dados.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = () => {
    reset();
    setImageErrors({}); // Limpar erros de imagem
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
    watch,
    watchedValues,
    errors,
    isLoading,
    percentualPreenchimento,
    onSubmit,
    handleNew,
    imageErrors // Exportar erros de imagem para componente pai se necessário
  };
};
