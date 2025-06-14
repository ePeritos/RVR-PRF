import { useState, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;
type CadernoAmbientes = Tables<'caderno_ambientes'>;
type ManutencaoAmbientes = Tables<'manutencao_ambientes'>;

interface EnvironmentsSectionProps {
  register: UseFormRegister<DadosCAIP>;
  setValue: UseFormSetValue<DadosCAIP>;
  watchedValues?: any;
  onAvaliacoesChange?: (avaliacoes: {[key: string]: number}) => void;
  editingItem?: DadosCAIP | null;
}

interface AmbienteExistente {
  ambiente: {
    id: string;
    nome_ambiente: string;
    peso: number;
  };
  avaliacao?: ManutencaoAmbientes;
}

export const EnvironmentsSection = ({ register, setValue, watchedValues, onAvaliacoesChange, editingItem }: EnvironmentsSectionProps) => {
  const [avaliacoesLocais, setAvaliacoesLocais] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  const environmentFields = [
    { key: 'almoxarifado', label: 'Almoxarifado' },
    { key: 'alojamento_feminino', label: 'Alojamento Feminino' },
    { key: 'alojamento_masculino', label: 'Alojamento Masculino' },
    { key: 'alojamento_misto', label: 'Alojamento Misto' },
    { key: 'area_de_servico', label: 'Área de Serviço' },
    { key: 'area_de_uso_compartilhado_com_outros_orgaos', label: 'Área de Uso Compartilhado com Outros Órgãos' },
    { key: 'arquivo', label: 'Arquivo' },
    { key: 'auditorio', label: 'Auditório' },
    { key: 'banheiro_para_zeladoria', label: 'Banheiro para Zeladoria' },
    { key: 'banheiro_feminino_para_servidoras', label: 'Banheiro Feminino para Servidoras' },
    { key: 'banheiro_masculino_para_servidores', label: 'Banheiro Masculino para Servidores' },
    { key: 'banheiro_misto_para_servidores', label: 'Banheiro Misto para Servidores' },
    { key: 'box_com_chuveiro_externo', label: 'Box com Chuveiro Externo' },
    { key: 'box_para_lavagem_de_veiculos', label: 'Box para Lavagem de Veículos' },
    { key: 'canil', label: 'Canil' },
    { key: 'casa_de_maquinas', label: 'Casa de Máquinas' },
    { key: 'central_de_gas', label: 'Central de Gás' },
    { key: 'cobertura_para_aglomeracao_de_usuarios', label: 'Cobertura para Aglomeração de Usuários' },
    { key: 'cobertura_para_fiscalizacao_de_veiculos', label: 'Cobertura para Fiscalização de Veículos' },
    { key: 'copa_e_cozinha', label: 'Copa e Cozinha' },
    { key: 'deposito_de_lixo', label: 'Depósito de Lixo' },
    { key: 'deposito_de_materiais_de_descarte_e_baixa', label: 'Depósito de Materiais de Descarte e Baixa' },
    { key: 'deposito_de_material_de_limpeza', label: 'Depósito de Material de Limpeza' },
    { key: 'deposito_de_material_operacional', label: 'Depósito de Material Operacional' },
    { key: 'estacionamento_para_usuarios', label: 'Estacionamento para Usuários' },
    { key: 'garagem_para_servidores', label: 'Garagem para Servidores' },
    { key: 'garagem_para_viaturas', label: 'Garagem para Viaturas' },
    { key: 'lavabo_para_servidores_sem_box_para_chuveiro', label: 'Lavabo para Servidores (sem box para chuveiro)' },
    { key: 'local_para_custodia_temporaria_de_detidos', label: 'Local para Custódia Temporária de Detidos' },
    { key: 'local_para_guarda_provisoria_de_animais', label: 'Local para Guarda Provisória de Animais' },
    { key: 'patio_de_retencao_de_veiculos', label: 'Pátio de Retenção de Veículos' },
    { key: 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos', label: 'Plataforma para Fiscalização da Parte Superior dos Veículos' },
    { key: 'ponto_de_pouso_para_aeronaves', label: 'Ponto de Pouso para Aeronaves' },
    { key: 'rampa_de_fiscalizacao_de_veiculos', label: 'Rampa de Fiscalização de Veículos' },
    { key: 'recepcao', label: 'Recepção' },
    { key: 'sala_administrativa_escritorio', label: 'Sala Administrativa / Escritório' },
    { key: 'sala_de_assepsia', label: 'Sala de Assepsia' },
    { key: 'sala_de_aula', label: 'Sala de Aula' },
    { key: 'sala_de_reuniao', label: 'Sala de Reunião' },
    { key: 'sala_de_revista_pessoal', label: 'Sala de Revista Pessoal' },
    { key: 'sala_operacional_observatorio', label: 'Sala Operacional / Observatório' },
    { key: 'sala_tecnica', label: 'Sala Técnica' },
    { key: 'sanitario_publico', label: 'Sanitário Público' },
    { key: 'telefone_publico', label: 'Telefone Público' },
    { key: 'torre_de_telecomunicacoes', label: 'Torre de Telecomunicações' },
    { key: 'vestiario_para_nao_policiais', label: 'Vestiário para Não-Policiais' },
    { key: 'vestiario_para_policiais', label: 'Vestiário para Policiais' }
  ];

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
    { campo: 'lavabo_para_servidores_sem_box_para_chuveiro', nomeAmbiente: 'Lavabo para servidores' },
    { campo: 'local_para_custodia_temporaria_de_detidos', nomeAmbiente: 'Local para custódia temporária de detidos' },
    { campo: 'local_para_guarda_provisoria_de_animais', nomeAmbiente: 'Local para guarda provisória de animais' },
    { campo: 'patio_de_retencao_de_veiculos', nomeAmbiente: 'Pátio de retenção de veículos' },
    { campo: 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos', nomeAmbiente: 'Plataforma para fiscalização de veículos' },
    { campo: 'ponto_de_pouso_para_aeronaves', nomeAmbiente: 'Ponto de pouso para aeronaves' },
    { campo: 'rampa_de_fiscalizacao_de_veiculos', nomeAmbiente: 'Rampa de fiscalização de veículos' },
    { campo: 'recepcao', nomeAmbiente: 'Recepção' },
    { campo: 'sala_administrativa_escritorio', nomeAmbiente: 'Sala administrativa / Escritório' },
    { campo: 'sala_de_assepsia', nomeAmbiente: 'Sala de assepsia' },
    { campo: 'sala_de_aula', nomeAmbiente: 'Sala de aula' },
    { campo: 'sala_de_reuniao', nomeAmbiente: 'Sala de reunião' },
    { campo: 'sala_de_revista_pessoal', nomeAmbiente: 'Sala de revista pessoal' },
    { campo: 'sala_operacional_observatorio', nomeAmbiente: 'Sala operacional / Observatório' },
    { campo: 'sala_tecnica', nomeAmbiente: 'Sala técnica' },
    { campo: 'sanitario_publico', nomeAmbiente: 'Sanitário público' },
    { campo: 'telefone_publico', nomeAmbiente: 'Telefone público' },
    { campo: 'torre_de_telecomunicacoes', nomeAmbiente: 'Torre de telecomunicações' },
    { campo: 'vestiario_para_nao_policiais', nomeAmbiente: 'Vestiário para não-policiais' },
    { campo: 'vestiario_para_policiais', nomeAmbiente: 'Vestiário para policiais' }
  ];

  // Carregar avaliações existentes quando há editingItem
  useEffect(() => {
    if (editingItem?.id) {
      console.log('🔄 Carregando avaliações para ID:', editingItem.id);
      // Aguardar um pouco para garantir que o formulário seja populado primeiro
      const timer = setTimeout(() => {
        carregarAvaliacoesExistentes();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Limpar avaliações quando não há ID (novo registro)
      console.log('🧹 Limpando avaliações para novo registro');
      setAvaliacoesLocais({});
    }
  }, [editingItem?.id]);

  // Notificar mudanças nas avaliações para o componente pai
  useEffect(() => {
    if (onAvaliacoesChange) {
      onAvaliacoesChange(avaliacoesLocais);
    }
  }, [avaliacoesLocais, onAvaliacoesChange]);

  // O cálculo da nota agora é feito pelo hook useCAIPCalculations

  const carregarAvaliacoesExistentes = async () => {
    const imovelId = editingItem?.id || watchedValues?.id;
    if (!imovelId) return;

    console.log('=== CARREGANDO AVALIAÇÕES EXISTENTES ===');
    console.log('ID do imóvel:', imovelId);

    try {
      const { data: avaliacoes, error } = await supabase
        .from('manutencao_ambientes')
        .select(`
          score_conservacao,
          caderno_ambientes!inner(
            nome_ambiente,
            tipos_imoveis!inner(nome_tipo)
          )
        `)
        .eq('imovel_id', imovelId);

      if (error) throw error;

      console.log('Avaliações encontradas:', avaliacoes);

      // Construir mapa de avaliações
      const avaliacoesMap: {[key: string]: number} = {};
      
      if (avaliacoes && avaliacoes.length > 0) {
        avaliacoes.forEach(avaliacao => {
          const nomeAmbiente = avaliacao.caderno_ambientes?.nome_ambiente;
          
          // Encontrar o campo correspondente pelo nome do ambiente
          const campoCorrespondente = camposAmbientes.find(c => 
            c.nomeAmbiente === nomeAmbiente
          );
          
          if (campoCorrespondente) {
            avaliacoesMap[campoCorrespondente.campo] = avaliacao.score_conservacao;
            console.log(`✅ Carregada avaliação para ${campoCorrespondente.campo}: ${avaliacao.score_conservacao}`);
          }
        });
      }

      console.log('Mapa de avaliações carregado:', avaliacoesMap);
      console.log('Estado atual avaliacoesLocais antes da atualização:', avaliacoesLocais);
      
      // Forçar atualização do estado
      setAvaliacoesLocais(prevState => {
        console.log('🔄 Atualizando estado de avaliacoesLocais');
        console.log('Estado anterior:', prevState);
        console.log('Novo estado:', avaliacoesMap);
        return { ...avaliacoesMap };
      });
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      setAvaliacoesLocais({});
    }
  };

  const handleAvaliacaoChange = (campo: string, rating: number) => {
    console.log(`🌟 === AVALIAÇÃO CHANGED === 🌟`);
    console.log(`Campo: ${campo}, Rating: ${rating}`);
    console.log('ID do registro:', watchedValues?.id);
    console.log('Tipo de unidade:', watchedValues?.tipo_de_unidade);
    console.log('Estado atual watchedValues:', {
      id: watchedValues?.id,
      tipo_de_unidade: watchedValues?.tipo_de_unidade,
      nota_para_adequacao: watchedValues?.nota_para_adequacao,
      nota_para_manutencao: watchedValues?.nota_para_manutencao
    });
    
    // Atualizar estado local
    const novasAvaliacoes = {
      ...avaliacoesLocais,
      [campo]: rating
    };
    
    console.log('📊 Novas avaliações locais:', novasAvaliacoes);
    setAvaliacoesLocais(novasAvaliacoes);

    // Se o registro já existe (editando), salvar no banco imediatamente
    if (watchedValues?.id) {
      console.log('🏢 Registro existente - salvando no banco...');
      salvarAvaliacaoNoBanco(campo, rating);
    }
    // O cálculo da nota agora é feito automaticamente pelo hook useCAIPCalculations
  };

  // Função removida - o cálculo agora é feito pelo hook useCAIPCalculations

  const salvarAvaliacaoNoBanco = async (campo: string, scoreConservacao: number) => {
    if (!watchedValues?.id || !watchedValues?.tipo_de_unidade) {
      console.log('❌ ERRO: ID do imóvel ou tipo de unidade não disponível');
      console.log('watchedValues?.id:', watchedValues?.id);
      console.log('watchedValues?.tipo_de_unidade:', watchedValues?.tipo_de_unidade);
      return;
    }

    console.log('🔥 === SALVANDO AVALIAÇÃO NO BANCO === 🔥');
    console.log('Campo:', campo);
    console.log('Score:', scoreConservacao);
    console.log('ID do imóvel:', watchedValues.id);
    console.log('Tipo de unidade:', watchedValues.tipo_de_unidade);

    try {
      // Encontrar o ambiente_id baseado no campo e tipo de unidade
      const { data: cadernoAmbientes, error: errorCaderno } = await supabase
        .from('caderno_ambientes')
        .select(`
          id,
          nome_ambiente,
          tipos_imoveis!inner(nome_tipo)
        `)
        .eq('tipos_imoveis.nome_tipo', watchedValues.tipo_de_unidade);

      if (errorCaderno) {
        console.error('Erro ao buscar caderno:', errorCaderno);
        throw errorCaderno;
      }

      console.log('Caderno de ambientes encontrado:', cadernoAmbientes);

      const campoCorrespondente = camposAmbientes.find(c => c.campo === campo);
      if (!campoCorrespondente) {
        console.log('❌ Campo correspondente não encontrado para:', campo);
        return;
      }

      console.log('Campo correspondente:', campoCorrespondente);

      const ambiente = cadernoAmbientes?.find(a => a.nome_ambiente === campoCorrespondente.nomeAmbiente);
      if (!ambiente) {
        console.log('❌ Ambiente não encontrado para:', campoCorrespondente.nomeAmbiente);
        return;
      }

      console.log('Ambiente encontrado:', ambiente);

      // Se score for 0, deletar a avaliação
      if (scoreConservacao === 0) {
        const { error: deleteError } = await supabase
          .from('manutencao_ambientes')
          .delete()
          .eq('imovel_id', watchedValues.id)
          .eq('ambiente_id', ambiente.id);

        if (deleteError) {
          console.error('Erro ao deletar avaliação:', deleteError);
          throw deleteError;
        }

        console.log('✅ Avaliação deletada com sucesso');
      } else {
        // Inserir ou atualizar a avaliação
        const { error } = await supabase
          .from('manutencao_ambientes')
          .upsert({
            imovel_id: watchedValues.id,
            ambiente_id: ambiente.id,
            score_conservacao: scoreConservacao,
            observacoes: null
          });

        if (error) {
          console.error('Erro ao salvar avaliação:', error);
          throw error;
        }

        console.log('✅ Avaliação salva com sucesso');
      }

      // Aguardar para garantir que o trigger processou
      await new Promise(resolve => setTimeout(resolve, 300));

      // Buscar a nota atualizada diretamente do banco
      const { data: dadosAtualizados, error: errorBusca } = await supabase
        .from('dados_caip')
        .select('nota_para_manutencao, nota_global')
        .eq('id', watchedValues.id)
        .single();

      if (errorBusca) {
        console.error('Erro ao buscar dados atualizados:', errorBusca);
        throw errorBusca;
      }

      console.log('Dados atualizados do banco:', dadosAtualizados);

      // Atualizar os campos no formulário com conversão correta de tipos
      if (dadosAtualizados.nota_para_manutencao !== null) {
        const notaManutencao = Number(dadosAtualizados.nota_para_manutencao).toFixed(2);
        setValue('nota_para_manutencao', notaManutencao as any);
        console.log('✅ Nota de manutenção atualizada:', notaManutencao);
      }
      if (dadosAtualizados.nota_global !== null) {
        const notaGlobal = Number(dadosAtualizados.nota_global).toFixed(2);
        setValue('nota_global', notaGlobal as any);
        console.log('✅ Nota global atualizada:', notaGlobal);
      }

      toast({
        title: "Avaliação salva",
        description: `Avaliação para ${campoCorrespondente.nomeAmbiente} foi salva com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a avaliação.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    environmentFields.forEach(({ key }) => {
      setValue(key as keyof DadosCAIP, checked ? 'Sim' : 'Não');
    });
  };

  const getAvaliacaoLocal = (campo: string) => {
    return avaliacoesLocais[campo] || 0;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ambientes e Espaços</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            onCheckedChange={handleSelectAll}
            id="select-all-environments"
          />
          <Label htmlFor="select-all-environments" className="text-sm font-medium">
            Marcar todos
          </Label>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Marque quais ambientes existem no imóvel e avalie o estado de conservação (1 = Péssimo, 5 = Ótimo).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {environmentFields.map(({ key, label }) => {
          const isSelected = watchedValues?.[key as keyof DadosCAIP] === 'Sim';
          const avaliacaoAtual = getAvaliacaoLocal(key);
          
          return (
            <div key={key} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  {...register(key as keyof DadosCAIP)}
                  checked={isSelected}
                  onCheckedChange={(checked) => setValue(key as keyof DadosCAIP, checked ? 'Sim' : 'Não')}
                />
                <Label className="text-sm font-medium">{label}</Label>
              </div>
              
              {isSelected && (
                <div className="ml-6 space-y-2 bg-muted/50 p-3 rounded-md">
                  <Label className="text-xs font-medium text-foreground">Estado de conservação (obrigatório):</Label>
                  <StarRating
                    value={avaliacaoAtual}
                    onChange={(rating) => handleAvaliacaoChange(key, rating)}
                    size={18}
                  />
                   {avaliacaoAtual === 0 && (
                     <p className="text-xs text-destructive font-medium">⚠️ Obrigatório: Avalie o estado de conservação</p>
                   )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};