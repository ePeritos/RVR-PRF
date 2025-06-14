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
}

interface AmbienteExistente {
  ambiente: {
    id: string;
    nome_ambiente: string;
    peso: number;
  };
  avaliacao?: ManutencaoAmbientes;
}

export const EnvironmentsSection = ({ register, setValue, watchedValues, onAvaliacoesChange }: EnvironmentsSectionProps) => {
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

  // Carregar avaliações existentes quando há ID do registro
  useEffect(() => {
    if (watchedValues?.id) {
      console.log('Carregando avaliações para ID:', watchedValues.id);
      carregarAvaliacoesExistentes();
    }
  }, [watchedValues?.id]);

  // Notificar mudanças nas avaliações para o componente pai
  useEffect(() => {
    if (onAvaliacoesChange) {
      onAvaliacoesChange(avaliacoesLocais);
    }
  }, [avaliacoesLocais, onAvaliacoesChange]);

  // Recalcular nota quando avaliações carregadas mudarem (para registros existentes)
  useEffect(() => {
    if (watchedValues?.id && Object.keys(avaliacoesLocais).length > 0) {
      // Para registros existentes, usar a função do banco que já considera ambientes selecionados
      const recalcularNota = async () => {
        try {
          const { data: notaData, error } = await supabase
            .rpc('calcular_nota_manutencao', { p_imovel_id: watchedValues.id });

          if (error) throw error;

          setValue('nota_para_manutencao', (notaData?.toFixed(2) || '0.00') as any);
          
          // Calcular e atualizar nota global
          const notaAdequacao = parseFloat(watchedValues?.nota_para_adequacao || '0');
          const notaGlobal = (notaAdequacao * 0.6) + ((notaData || 0) * 0.4);
          setValue('nota_global', notaGlobal.toFixed(2) as any);
          
          console.log('Nota de manutenção recalculada (banco):', notaData?.toFixed(2));
        } catch (error) {
          console.error('Erro ao recalcular nota de manutenção:', error);
        }
      };
      
      recalcularNota();
    }
  }, [avaliacoesLocais, watchedValues?.id, setValue]);

  const carregarAvaliacoesExistentes = async () => {
    if (!watchedValues?.id) return;

    console.log('=== CARREGANDO AVALIAÇÕES EXISTENTES ===');
    console.log('ID do imóvel:', watchedValues.id);

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
        .eq('imovel_id', watchedValues.id);

      if (error) throw error;

      console.log('Avaliações encontradas:', avaliacoes);

      // Limpar avaliações locais primeiro
      const avaliacoesMap: {[key: string]: number} = {};
      
      avaliacoes?.forEach(avaliacao => {
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

      console.log('Mapa de avaliações carregado:', avaliacoesMap);
      setAvaliacoesLocais(avaliacoesMap);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      setAvaliacoesLocais({});
    }
  };

  const handleAvaliacaoChange = (campo: string, rating: number) => {
    console.log(`=== AVALIAÇÃO CHANGED ===`);
    console.log(`Campo: ${campo}, Rating: ${rating}`);
    
    // Atualizar estado local
    const novasAvaliacoes = {
      ...avaliacoesLocais,
      [campo]: rating
    };
    
    console.log('Novas avaliações locais:', novasAvaliacoes);
    setAvaliacoesLocais(novasAvaliacoes);

    // Se o registro já existe (editando), salvar no banco imediatamente
    if (watchedValues?.id) {
      console.log('Registro existente - salvando no banco...');
      salvarAvaliacaoNoBanco(campo, rating);
    } else {
      console.log('Novo registro - calculando nota local');
      // Para novos registros, calcular a nota de manutenção local
      calcularNotaManutencaoLocal(novasAvaliacoes);
    }
  };

  const calcularNotaManutencaoLocal = async (avaliacoes: {[key: string]: number}) => {
    if (!watchedValues?.tipo_de_unidade) return;

    try {
      // Buscar os pesos corretos do banco de dados
      const { data: ambientesPesos, error } = await supabase
        .from('caderno_ambientes')
        .select(`
          nome_ambiente,
          peso,
          tipos_imoveis!inner(nome_tipo)
        `)
        .eq('tipos_imoveis.nome_tipo', watchedValues.tipo_de_unidade);

      if (error) throw error;

      let potencialMaximo = 0;
      let scoreEfetivo = 0;

      // Mapear ambientes do banco para campos do formulário
      const mapeamentoAmbientes: {[key: string]: string} = {
        'Almoxarifado': 'almoxarifado',
        'Alojamento': 'alojamento_masculino', // Será tratado especialmente
        'Área de serviço': 'area_de_servico',
        'Área de uso compartilhado': 'area_de_uso_compartilhado_com_outros_orgaos',
        'Arquivo': 'arquivo',
        'Auditório': 'auditorio',
        'Banheiro para servidores': 'banheiro_masculino_para_servidores', // Será tratado especialmente
        'Banheiro para zeladoria': 'banheiro_para_zeladoria',
        'Box com chuveiro externo': 'box_com_chuveiro_externo',
        'Box para lavagem de veículos': 'box_para_lavagem_de_veiculos',
        'Canil': 'canil',
        'Casa de máquinas': 'casa_de_maquinas',
        'Central de gás': 'central_de_gas',
        'Cobertura para aglomeração de usuários': 'cobertura_para_aglomeracao_de_usuarios',
        'Cobertura para fiscalização de veículos': 'cobertura_para_fiscalizacao_de_veiculos',
        'Copa e cozinha': 'copa_e_cozinha',
        'Depósito de lixo': 'deposito_de_lixo',
        'Depósito de materiais de descarte e baixa': 'deposito_de_materiais_de_descarte_e_baixa',
        'Depósito de material de limpeza': 'deposito_de_material_de_limpeza',
        'Depósito de material operacional': 'deposito_de_material_operacional',
        'Estacionamento para usuários': 'estacionamento_para_usuarios',
        'Garagem para servidores': 'garagem_para_servidores',
        'Garagem para viaturas': 'garagem_para_viaturas',
        'Lavabo para servidores sem box para chuveiro': 'lavabo_para_servidores_sem_box_para_chuveiro',
        'Local para custódia temporária de detidos': 'local_para_custodia_temporaria_de_detidos',
        'Local para guarda provisória de animais': 'local_para_guarda_provisoria_de_animais',
        'Pátio de retenção de veículos': 'patio_de_retencao_de_veiculos',
        'Plataforma para fiscalização da parte superior dos veículos': 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos',
        'Ponto de pouso para aeronaves': 'ponto_de_pouso_para_aeronaves',
        'Rampa de fiscalização de veículos': 'rampa_de_fiscalizacao_de_veiculos',
        'Recepção': 'recepcao',
        'Sala administrativa / Escritório': 'sala_administrativa_escritorio',
        'Sala de assepsia': 'sala_de_assepsia',
        'Sala de aula': 'sala_de_aula',
        'Sala de reunião': 'sala_de_reuniao',
        'Sala de revista pessoal': 'sala_de_revista_pessoal',
        'Sala operacional / Observatório': 'sala_operacional_observatorio',
        'Sala técnica': 'sala_tecnica',
        'Sanitário público': 'sanitario_publico',
        'Telefone público': 'telefone_publico',
        'Torre de telecomunicações': 'torre_de_telecomunicacoes',
        'Vestiário para não-policiais': 'vestiario_para_nao_policiais',
        'Vestiário para policiais': 'vestiario_para_policiais'
      };

      // Calcular apenas para ambientes selecionados (com "Sim") e avaliados
      ambientesPesos?.forEach(ambiente => {
        if (ambiente.peso === 0) return; // Ignorar ambientes com peso 0

        let isSelected = false;
        let avaliacao = 0;

        // Verificar se o ambiente está selecionado e tem avaliação
        if (ambiente.nome_ambiente === 'Alojamento') {
          // Tratamento especial para alojamento (múltiplos campos)
          isSelected = watchedValues.alojamento_masculino === 'Sim' || 
                      watchedValues.alojamento_feminino === 'Sim' || 
                      watchedValues.alojamento_misto === 'Sim';
          
          // Pegar a maior avaliação entre os alojamentos
          const avaliacaoMasc = avaliacoes['alojamento_masculino'] || 0;
          const avaliacaoFem = avaliacoes['alojamento_feminino'] || 0;
          const avaliacaoMisto = avaliacoes['alojamento_misto'] || 0;
          avaliacao = Math.max(avaliacaoMasc, avaliacaoFem, avaliacaoMisto);
        } else if (ambiente.nome_ambiente === 'Banheiro para servidores') {
          // Tratamento especial para banheiros (múltiplos campos)
          isSelected = watchedValues.banheiro_masculino_para_servidores === 'Sim' || 
                      watchedValues.banheiro_feminino_para_servidoras === 'Sim' || 
                      watchedValues.banheiro_misto_para_servidores === 'Sim';
          
          // Pegar a maior avaliação entre os banheiros
          const avaliacaoMasc = avaliacoes['banheiro_masculino_para_servidores'] || 0;
          const avaliacaoFem = avaliacoes['banheiro_feminino_para_servidoras'] || 0;
          const avaliacaoMisto = avaliacoes['banheiro_misto_para_servidores'] || 0;
          avaliacao = Math.max(avaliacaoMasc, avaliacaoFem, avaliacaoMisto);
        } else {
          // Tratamento normal para outros ambientes
          const campo = mapeamentoAmbientes[ambiente.nome_ambiente];
          if (campo) {
            isSelected = watchedValues[campo as keyof typeof watchedValues] === 'Sim';
            avaliacao = avaliacoes[campo] || 0;
          }
        }

        if (isSelected && avaliacao > 0) {
          potencialMaximo += ambiente.peso * 5; // Máximo é peso * 5
          scoreEfetivo += ambiente.peso * avaliacao;
        }
      });

      // Calcular a nota final
      let notaFinal = 0;
      if (potencialMaximo > 0) {
        notaFinal = (scoreEfetivo / potencialMaximo) * 100;
      }

      // Garantir que não ultrapasse 100
      notaFinal = Math.min(notaFinal, 100);
      
      // Atualizar o formulário
      setValue('nota_para_manutencao', notaFinal.toFixed(2) as any);
      
      // Calcular e atualizar nota global
      const notaAdequacao = parseFloat(watchedValues?.nota_para_adequacao || '0');
      const notaGlobal = (notaAdequacao * 0.6) + (notaFinal * 0.4);
      setValue('nota_global', notaGlobal.toFixed(2) as any);
      
      console.log('Nota de manutenção calculada (local):', notaFinal.toFixed(2));
      console.log('Nota global calculada (local):', notaGlobal.toFixed(2));
    } catch (error) {
      console.error('Erro ao calcular nota de manutenção local:', error);
    }
  };

  const salvarAvaliacaoNoBanco = async (campo: string, scoreConservacao: number) => {
    if (!watchedValues?.id || !watchedValues?.tipo_de_unidade) {
      console.log('❌ ID do imóvel ou tipo de unidade não disponível');
      return;
    }

    console.log('=== SALVANDO AVALIAÇÃO NO BANCO ===');
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

      // Atualizar os campos no formulário
      if (dadosAtualizados.nota_para_manutencao !== null) {
        setValue('nota_para_manutencao', parseFloat(dadosAtualizados.nota_para_manutencao.toString()).toFixed(2) as any);
      }
      if (dadosAtualizados.nota_global !== null) {
        setValue('nota_global', parseFloat(dadosAtualizados.nota_global.toString()).toFixed(2) as any);
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