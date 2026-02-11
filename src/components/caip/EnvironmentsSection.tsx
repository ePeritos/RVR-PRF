
import { useState, useEffect, useCallback } from 'react';
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

export const EnvironmentsSection = ({ register, setValue, watchedValues, onAvaliacoesChange, editingItem }: EnvironmentsSectionProps) => {
  const [avaliacoesLocais, setAvaliacoesLocais] = useState<{[key: string]: number}>({});
  const [isLoadingAvaliacoes, setIsLoadingAvaliacoes] = useState(false);
  const [lastLoadedItemId, setLastLoadedItemId] = useState<string | null>(null);
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

  // Mapeamento corrigido e verificado
  const camposAmbientes = {
    'almoxarifado': 'Almoxarifado',
    'alojamento_feminino': 'Alojamento',
    'alojamento_masculino': 'Alojamento',
    'alojamento_misto': 'Alojamento',
    'area_de_servico': 'Área de serviço',
    'area_de_uso_compartilhado_com_outros_orgaos': 'Área de uso compartilhado',
    'arquivo': 'Arquivo',
    'auditorio': 'Auditório',
    'banheiro_para_zeladoria': 'Banheiro para zeladoria',
    'banheiro_feminino_para_servidoras': 'Banheiro para servidores',
    'banheiro_masculino_para_servidores': 'Banheiro para servidores',
    'banheiro_misto_para_servidores': 'Banheiro para servidores',
    'box_com_chuveiro_externo': 'Box com chuveiro externo',
    'box_para_lavagem_de_veiculos': 'Box para lavagem de veículos',
    'canil': 'Canil',
    'casa_de_maquinas': 'Casa de máquinas',
    'central_de_gas': 'Central de gás',
    'cobertura_para_aglomeracao_de_usuarios': 'Cobertura para aglomeração de usuários',
    'cobertura_para_fiscalizacao_de_veiculos': 'Cobertura para fiscalização de veículos',
    'copa_e_cozinha': 'Copa e cozinha',
    'deposito_de_lixo': 'Depósito de lixo',
    'deposito_de_materiais_de_descarte_e_baixa': 'Depósito de materiais de descarte e baixa',
    'deposito_de_material_de_limpeza': 'Depósito de material de limpeza',
    'deposito_de_material_operacional': 'Depósito de material operacional',
    'estacionamento_para_usuarios': 'Estacionamento para usuários',
    'garagem_para_servidores': 'Garagem para servidores',
    'garagem_para_viaturas': 'Garagem para viaturas',
    'lavabo_para_servidores_sem_box_para_chuveiro': 'Lavabo para servidores',
    'local_para_custodia_temporaria_de_detidos': 'Local para custódia temporária de detidos',
    'local_para_guarda_provisoria_de_animais': 'Local para guarda provisória de animais',
    'patio_de_retencao_de_veiculos': 'Pátio de retenção de veículos',
    'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos': 'Plataforma para fiscalização de veículos',
    'ponto_de_pouso_para_aeronaves': 'Ponto de pouso para aeronaves',
    'rampa_de_fiscalizacao_de_veiculos': 'Rampa de fiscalização de veículos',
    'recepcao': 'Recepção',
    'sala_administrativa_escritorio': 'Sala administrativa / Escritório',
    'sala_de_assepsia': 'Sala de assepsia',
    'sala_de_aula': 'Sala de aula',
    'sala_de_reuniao': 'Sala de reunião',
    'sala_de_revista_pessoal': 'Sala de revista pessoal',
    'sala_operacional_observatorio': 'Sala operacional / Observatório',
    'sala_tecnica': 'Sala técnica',
    'sanitario_publico': 'Sanitário público',
    'telefone_publico': 'Telefone público',
    'torre_de_telecomunicacoes': 'Torre de telecomunicações',
    'vestiario_para_nao_policiais': 'Vestiário para não-policiais',
    'vestiario_para_policiais': 'Vestiário para policiais'
  };

  // Função para carregar avaliações existentes com debug detalhado
  const carregarAvaliacoesExistentes = useCallback(async (imovelId: string) => {
    console.log('🔄 === CARREGANDO AVALIAÇÕES EXISTENTES ===');
    console.log('ID do imóvel:', imovelId);
    
    setIsLoadingAvaliacoes(true);

    try {
      // Buscar todas as avaliações do imóvel com join para pegar nome do ambiente
      const { data: avaliacoes, error } = await supabase
        .from('manutencao_ambientes')
        .select(`
          score_conservacao,
          caderno_ambientes!inner(
            nome_ambiente
          )
        `)
        .eq('imovel_id', imovelId);

      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }

      console.log('✅ Avaliações encontradas no banco:', avaliacoes);

      // Construir mapa de avaliações
      const avaliacoesMap: {[key: string]: number} = {};
      
      if (avaliacoes && avaliacoes.length > 0) {
        avaliacoes.forEach(avaliacao => {
          const nomeAmbiente = avaliacao.caderno_ambientes?.nome_ambiente;
          
          // Find ALL matching fields (not just the first) for shared environment names
          const camposCorrespondentes = Object.keys(camposAmbientes).filter(campo => 
            camposAmbientes[campo as keyof typeof camposAmbientes] === nomeAmbiente
          );
          
          camposCorrespondentes.forEach(campo => {
            avaliacoesMap[campo] = avaliacao.score_conservacao;
            console.log(`✅ Mapeado: ${campo} = ${avaliacao.score_conservacao}`);
          });
        });
      }

      console.log('🎯 Mapa final de avaliações:', avaliacoesMap);
      
      // Atualizar estado
      setAvaliacoesLocais(avaliacoesMap);
      setLastLoadedItemId(imovelId);
      
    } catch (error) {
      console.error('❌ Erro ao carregar avaliações:', error);
      setAvaliacoesLocais({});
    } finally {
      setIsLoadingAvaliacoes(false);
    }
  }, []);

  // Effect para carregar avaliações quando necessário
  useEffect(() => {
    const currentItemId = editingItem?.id;
    
    console.log('🔥 Effect principal executado');
    console.log('currentItemId:', currentItemId);
    console.log('lastLoadedItemId:', lastLoadedItemId);

    // Se há um item para editar e ainda não carregamos suas avaliações
    if (currentItemId && currentItemId !== lastLoadedItemId) {
      console.log('📦 Carregando avaliações para:', currentItemId);
      carregarAvaliacoesExistentes(currentItemId);
    } else if (!currentItemId && lastLoadedItemId) {
      // Novo registro - limpar avaliações
      console.log('🆕 Novo registro - limpando avaliações');
      setAvaliacoesLocais({});
      setLastLoadedItemId(null);
    }
  }, [editingItem?.id, lastLoadedItemId, carregarAvaliacoesExistentes]);

  // Notificar mudanças nas avaliações
  useEffect(() => {
    if (onAvaliacoesChange) {
      console.log('📢 Notificando mudanças nas avaliações:', avaliacoesLocais);
      onAvaliacoesChange(avaliacoesLocais);
    }
  }, [avaliacoesLocais, onAvaliacoesChange]);

  const handleAvaliacaoChange = (campo: string, rating: number) => {
    console.log(`⭐ Mudança de avaliação - Campo: ${campo}, Rating: ${rating}`);
    
    // Atualizar estado local
    const novasAvaliacoes = {
      ...avaliacoesLocais,
      [campo]: rating
    };
    
    setAvaliacoesLocais(novasAvaliacoes);

    // Se o registro já existe (editando), salvar no banco imediatamente
    if (watchedValues?.id) {
      console.log('💾 Salvando no banco para registro existente:', watchedValues.id);
      salvarAvaliacaoNoBanco(campo, rating);
    }
  };

  const salvarAvaliacaoNoBanco = async (campo: string, scoreConservacao: number) => {
    if (!watchedValues?.id || !watchedValues?.tipo_de_unidade) {
      console.log('❌ ID do imóvel ou tipo de unidade não disponível');
      return;
    }

    console.log('💾 === SALVANDO AVALIAÇÃO NO BANCO ===');
    console.log('Campo:', campo);
    console.log('Score:', scoreConservacao);
    console.log('ID do imóvel:', watchedValues.id);
    console.log('Tipo de unidade:', watchedValues.tipo_de_unidade);

    try {
      // Buscar ambiente_id baseado no campo e tipo de unidade
      const nomeAmbiente = camposAmbientes[campo as keyof typeof camposAmbientes];
      if (!nomeAmbiente) {
        console.log('❌ Nome do ambiente não encontrado para campo:', campo);
        return;
      }

      const { data: cadernoAmbientes, error: errorCaderno } = await supabase
        .from('caderno_ambientes')
        .select(`
          id,
          nome_ambiente,
          tipos_imoveis!inner(nome_tipo)
        `)
        .eq('tipos_imoveis.nome_tipo', watchedValues.tipo_de_unidade)
        .eq('nome_ambiente', nomeAmbiente);

      if (errorCaderno) {
        console.error('Erro ao buscar caderno:', errorCaderno);
        throw errorCaderno;
      }

      if (!cadernoAmbientes || cadernoAmbientes.length === 0) {
        console.log('❌ Ambiente não encontrado no caderno:', nomeAmbiente);
        return;
      }

      const ambiente = cadernoAmbientes[0];

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
          }, { onConflict: 'imovel_id,ambiente_id' });

        if (error) {
          console.error('Erro ao salvar avaliação:', error);
          throw error;
        }

        console.log('✅ Avaliação salva com sucesso');
      }

      // Aguardar processamento e atualizar notas
      await new Promise(resolve => setTimeout(resolve, 300));

      const { data: dadosAtualizados, error: errorBusca } = await supabase
        .from('dados_caip')
        .select('nota_para_manutencao, nota_global')
        .eq('id', watchedValues.id)
        .single();

      if (errorBusca) {
        console.error('Erro ao buscar dados atualizados:', errorBusca);
        throw errorBusca;
      }

      // Atualizar formulário
      if (dadosAtualizados.nota_para_manutencao !== null) {
        const notaManutencao = Number(dadosAtualizados.nota_para_manutencao).toFixed(2);
        setValue('nota_para_manutencao', notaManutencao as any);
      }
      if (dadosAtualizados.nota_global !== null) {
        const notaGlobal = Number(dadosAtualizados.nota_global).toFixed(2);
        setValue('nota_global', notaGlobal as any);
      }

      toast({
        title: "Avaliação salva",
        description: `Avaliação para ${nomeAmbiente} foi salva com sucesso.`,
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
    const avaliacao = avaliacoesLocais[campo] || 0;
    console.log(`🔍 getAvaliacaoLocal para ${campo}:`, avaliacao);
    return avaliacao;
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
        {isLoadingAvaliacoes && " Carregando avaliações..."}
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
                    disabled={isLoadingAvaliacoes}
                  />
                   {avaliacaoAtual === 0 && !isLoadingAvaliacoes && (
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
