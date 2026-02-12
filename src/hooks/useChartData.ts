
import { useMemo } from 'react';
import { DataRow } from '@/hooks/useSupabaseData';

export interface ChartField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  category?: string;
}

export interface ChartConfig {
  id: string;
  name: string;
  type: 'bar' | 'pie' | 'line' | 'area' | 'scatter' | 'table' | 'comparison';
  xField: string;
  yField: string;
  groupField?: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
  colors?: string[];
  comparisonFields?: string[]; // Para modo comparativo
}

// Campos disponíveis dos dados CAIP
export const CHART_FIELDS: ChartField[] = [
  // Campos básicos
  { key: 'unidade_gestora', label: 'Unidade Gestora', type: 'string', category: 'Básico' },
  { key: 'tipo_de_unidade', label: 'Tipo de Unidade', type: 'string', category: 'Básico' },
  { key: 'estado_de_conservacao', label: 'Estado de Conservação', type: 'string', category: 'Básico' },
  { key: 'ano_caip', label: 'Ano CAIP', type: 'string', category: 'Básico' },
  { key: 'implantacao_da_unidade', label: 'Implantação da Unidade', type: 'string', category: 'Básico' },
  { key: 'situacao_do_imovel', label: 'Situação do Imóvel', type: 'string', category: 'Básico' },
  { key: 'zona', label: 'Zona', type: 'string', category: 'Básico' },

  // Campos numéricos
  { key: 'area_construida_m2', label: 'Área Construída (m²)', type: 'number', category: 'Numérico' },
  { key: 'area_do_terreno_m2', label: 'Área do Terreno (m²)', type: 'number', category: 'Numérico' },
  { key: 'idade_aparente_do_imovel', label: 'Idade Aparente (anos)', type: 'number', category: 'Numérico' },
  { key: 'vida_util_estimada_anos', label: 'Vida Útil Estimada (anos)', type: 'number', category: 'Numérico' },
  { key: 'rvr', label: 'RVR (R$)', type: 'number', category: 'Numérico' },
  { key: 'nota_global', label: 'Nota Global', type: 'number', category: 'Numérico' },

  // Campos de ambientes (Sim/Não)
  { key: 'almoxarifado', label: 'Almoxarifado', type: 'boolean', category: 'Ambientes' },
  { key: 'alojamento_feminino', label: 'Alojamento Feminino', type: 'boolean', category: 'Ambientes' },
  { key: 'alojamento_masculino', label: 'Alojamento Masculino', type: 'boolean', category: 'Ambientes' },
  { key: 'alojamento_misto', label: 'Alojamento Misto', type: 'boolean', category: 'Ambientes' },
  { key: 'area_de_servico', label: 'Área de Serviço', type: 'boolean', category: 'Ambientes' },
  { key: 'area_de_uso_compartilhado_com_outros_orgaos', label: 'Área de Uso Compartilhado', type: 'boolean', category: 'Ambientes' },
  { key: 'arquivo', label: 'Arquivo', type: 'boolean', category: 'Ambientes' },
  { key: 'auditorio', label: 'Auditório', type: 'boolean', category: 'Ambientes' },
  { key: 'banheiro_feminino_para_servidoras', label: 'Banheiro Feminino', type: 'boolean', category: 'Ambientes' },
  { key: 'banheiro_masculino_para_servidores', label: 'Banheiro Masculino', type: 'boolean', category: 'Ambientes' },
  { key: 'banheiro_misto_para_servidores', label: 'Banheiro Misto', type: 'boolean', category: 'Ambientes' },
  { key: 'banheiro_para_zeladoria', label: 'Banheiro Zeladoria', type: 'boolean', category: 'Ambientes' },
  { key: 'box_com_chuveiro_externo', label: 'Box Chuveiro Externo', type: 'boolean', category: 'Ambientes' },
  { key: 'box_para_lavagem_de_veiculos', label: 'Box Lavagem Veículos', type: 'boolean', category: 'Ambientes' },
  { key: 'canil', label: 'Canil', type: 'boolean', category: 'Ambientes' },
  { key: 'casa_de_maquinas', label: 'Casa de Máquinas', type: 'boolean', category: 'Ambientes' },
  { key: 'central_de_gas', label: 'Central de Gás', type: 'boolean', category: 'Ambientes' },
  { key: 'cobertura_para_aglomeracao_de_usuarios', label: 'Cobertura Aglomeração', type: 'boolean', category: 'Ambientes' },
  { key: 'cobertura_para_fiscalizacao_de_veiculos', label: 'Cobertura Fiscalização', type: 'boolean', category: 'Ambientes' },
  { key: 'copa_e_cozinha', label: 'Copa e Cozinha', type: 'boolean', category: 'Ambientes' },
  { key: 'deposito_de_lixo', label: 'Depósito de Lixo', type: 'boolean', category: 'Ambientes' },
  { key: 'deposito_de_materiais_de_descarte_e_baixa', label: 'Depósito Descarte/Baixa', type: 'boolean', category: 'Ambientes' },
  { key: 'deposito_de_material_de_limpeza', label: 'Depósito Limpeza', type: 'boolean', category: 'Ambientes' },
  { key: 'deposito_de_material_operacional', label: 'Depósito Material Operacional', type: 'boolean', category: 'Ambientes' },
  { key: 'estacionamento_para_usuarios', label: 'Estacionamento Usuários', type: 'boolean', category: 'Ambientes' },
  { key: 'garagem_para_servidores', label: 'Garagem Servidores', type: 'boolean', category: 'Ambientes' },
  { key: 'garagem_para_viaturas', label: 'Garagem Viaturas', type: 'boolean', category: 'Ambientes' },
  { key: 'lavabo_para_servidores_sem_box_para_chuveiro', label: 'Lavabo Servidores', type: 'boolean', category: 'Ambientes' },
  { key: 'local_para_custodia_temporaria_de_detidos', label: 'Custódia Temporária', type: 'boolean', category: 'Ambientes' },
  { key: 'local_para_guarda_provisoria_de_animais', label: 'Guarda Animais', type: 'boolean', category: 'Ambientes' },
  { key: 'patio_de_retencao_de_veiculos', label: 'Pátio Retenção Veículos', type: 'boolean', category: 'Ambientes' },
  { key: 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos', label: 'Plataforma Fiscalização', type: 'boolean', category: 'Ambientes' },
  { key: 'ponto_de_pouso_para_aeronaves', label: 'Ponto Pouso Aeronaves', type: 'boolean', category: 'Ambientes' },
  { key: 'rampa_de_fiscalizacao_de_veiculos', label: 'Rampa Fiscalização', type: 'boolean', category: 'Ambientes' },
  { key: 'recepcao', label: 'Recepção', type: 'boolean', category: 'Ambientes' },
  { key: 'sala_administrativa_escritorio', label: 'Sala Administrativa', type: 'boolean', category: 'Ambientes' },
  { key: 'sala_de_assepsia', label: 'Sala de Assepsia', type: 'boolean', category: 'Ambientes' },
  { key: 'sala_de_aula', label: 'Sala de Aula', type: 'boolean', category: 'Ambientes' },
  { key: 'sala_de_reuniao', label: 'Sala de Reunião', type: 'boolean', category: 'Ambientes' },
  { key: 'sala_de_revista_pessoal', label: 'Sala Revista Pessoal', type: 'boolean', category: 'Ambientes' },
  { key: 'sala_operacional_observatorio', label: 'Sala Operacional', type: 'boolean', category: 'Ambientes' },
  { key: 'sala_tecnica', label: 'Sala Técnica', type: 'boolean', category: 'Ambientes' },
  { key: 'sanitario_publico', label: 'Sanitário Público', type: 'boolean', category: 'Ambientes' },
  { key: 'telefone_publico', label: 'Telefone Público', type: 'boolean', category: 'Ambientes' },
  { key: 'torre_de_telecomunicacoes', label: 'Torre Telecomunicações', type: 'boolean', category: 'Ambientes' },
  { key: 'vestiario_para_nao_policiais', label: 'Vestiário Não-Policiais', type: 'boolean', category: 'Ambientes' },
  { key: 'vestiario_para_policiais', label: 'Vestiário Policiais', type: 'boolean', category: 'Ambientes' },
  { key: 'sala_cofre', label: 'Sala Cofre', type: 'boolean', category: 'Ambientes' },

  // Campos de Infraestrutura (Sim/Não)
  { key: 'fornecimento_de_agua', label: 'Fornecimento de Água', type: 'boolean', category: 'Infraestrutura' },
  { key: 'fornecimento_de_energia_eletrica', label: 'Fornecimento de Energia', type: 'boolean', category: 'Infraestrutura' },
  { key: 'esgotamento_sanitario', label: 'Esgotamento Sanitário', type: 'boolean', category: 'Infraestrutura' },
  { key: 'conexao_de_internet', label: 'Conexão de Internet', type: 'boolean', category: 'Infraestrutura' },
  { key: 'possui_wireless_wifi', label: 'Wi-Fi', type: 'boolean', category: 'Infraestrutura' },
  { key: 'climatizacao_de_ambientes', label: 'Climatização', type: 'boolean', category: 'Infraestrutura' },
  { key: 'abastecimento_de_agua', label: 'Abastecimento de Água', type: 'boolean', category: 'Infraestrutura' },
  { key: 'coleta_de_lixo', label: 'Coleta de Lixo', type: 'boolean', category: 'Infraestrutura' },
  { key: 'energia_eletrica_de_emergencia', label: 'Energia Emergência', type: 'boolean', category: 'Infraestrutura' },
  { key: 'energia_solar', label: 'Energia Solar', type: 'boolean', category: 'Infraestrutura' },
  { key: 'aproveitamento_da_agua_da_chuva', label: 'Aproveitamento Água Chuva', type: 'boolean', category: 'Infraestrutura' },
  { key: 'iluminacao_externa', label: 'Iluminação Externa', type: 'boolean', category: 'Infraestrutura' },
  { key: 'cabeamento_estruturado', label: 'Cabeamento Estruturado', type: 'boolean', category: 'Infraestrutura' },
  { key: 'radiocomunicacao', label: 'Radiocomunicação', type: 'boolean', category: 'Infraestrutura' },
  { key: 'aterramento_e_protecao_contra_descargas_atmosfericas', label: 'Aterramento/SPDA', type: 'boolean', category: 'Infraestrutura' },
  { key: 'identidade_visual', label: 'Identidade Visual', type: 'boolean', category: 'Infraestrutura' },
  { key: 'acessibilidade', label: 'Acessibilidade', type: 'boolean', category: 'Infraestrutura' },
  { key: 'sustentabilidade', label: 'Sustentabilidade', type: 'boolean', category: 'Infraestrutura' },

  // Campos de Segurança (Sim/Não)
  { key: 'blindagem', label: 'Blindagem', type: 'boolean', category: 'Segurança' },
  { key: 'concertina', label: 'Concertina', type: 'boolean', category: 'Segurança' },
  { key: 'muro_ou_alambrado', label: 'Muro ou Alambrado', type: 'boolean', category: 'Segurança' },
  { key: 'protecao_contra_incendios', label: 'Proteção Contra Incêndios', type: 'boolean', category: 'Segurança' },
  { key: 'protecao_contra_intrusao', label: 'Proteção Contra Intrusão', type: 'boolean', category: 'Segurança' },
  { key: 'claviculario', label: 'Claviculário', type: 'boolean', category: 'Segurança' },

  // Campos de Manutenção (Sim/Não)
  { key: 'ha_contrato_de_manutencao_predial', label: 'Contrato Manutenção', type: 'boolean', category: 'Manutenção' },
  { key: 'ha_plano_de_manutencao_do_imovel', label: 'Plano Manutenção', type: 'boolean', category: 'Manutenção' },
  { key: 'o_trecho_e_concessionado', label: 'Trecho Concessionado', type: 'boolean', category: 'Manutenção' },
];

// Helper para normalizar Sim/Não
const normalizeSimNao = (value: any): string => {
  if (!value || value === '' || value === null || value === undefined) return 'Não informado';
  const lower = String(value).toLowerCase().trim();
  if (['sim', 'on', 'true', 'yes', '1'].includes(lower)) return 'Sim';
  if (['não', 'nao', 'off', 'false', 'no', '0'].includes(lower)) return 'Não';
  return String(value);
};

// Gerar dados para o modo comparativo
export const useComparisonData = (data: DataRow[], fields: string[], groupField?: string) => {
  return useMemo(() => {
    if (!data || !data.length || !fields.length) return [];

    if (groupField) {
      // Agrupar por um campo (ex: unidade_gestora)
      const groups = new Map<string, Map<string, { sim: number; nao: number }>>();
      
      data.forEach(item => {
        const group = String(item[groupField] || 'Não informado');
        if (!groups.has(group)) {
          groups.set(group, new Map());
        }
        const fieldMap = groups.get(group)!;
        
        fields.forEach(fieldKey => {
          if (!fieldMap.has(fieldKey)) {
            fieldMap.set(fieldKey, { sim: 0, nao: 0 });
          }
          const normalized = normalizeSimNao(item[fieldKey]);
          const counts = fieldMap.get(fieldKey)!;
          if (normalized === 'Sim') counts.sim++;
          else if (normalized === 'Não') counts.nao++;
        });
      });

      // Retornar dados agrupados por campo
      return fields.map(fieldKey => {
        const fieldInfo = CHART_FIELDS.find(f => f.key === fieldKey);
        const result: Record<string, any> = { name: fieldInfo?.label || fieldKey };
        
        groups.forEach((fieldMap, group) => {
          const counts = fieldMap.get(fieldKey);
          result[`${group} (Sim)`] = counts?.sim || 0;
          result[`${group} (Não)`] = counts?.nao || 0;
        });
        
        return result;
      });
    }

    // Sem agrupamento: contar Sim/Não por campo
    return fields.map(fieldKey => {
      const fieldInfo = CHART_FIELDS.find(f => f.key === fieldKey);
      let sim = 0;
      let nao = 0;
      let naoInformado = 0;

      data.forEach(item => {
        const normalized = normalizeSimNao(item[fieldKey]);
        if (normalized === 'Sim') sim++;
        else if (normalized === 'Não') nao++;
        else naoInformado++;
      });

      return {
        name: fieldInfo?.label || fieldKey,
        Sim: sim,
        Não: nao,
        'Não informado': naoInformado,
        total: data.length,
        percentSim: Math.round((sim / data.length) * 100),
      };
    }).sort((a, b) => b.Sim - a.Sim);
  }, [data, fields, groupField]);
};

export const useChartData = (data: DataRow[], config: ChartConfig) => {
  return useMemo(() => {
    if (!data || !data.length || !config.xField || !config.yField) {
      return [];
    }

    try {
      // Para tabelas, processar de forma diferente
      if (config.type === 'table') {
        const tableData: Record<string, Record<string, number>> = {};
        
        data.forEach(item => {
          const xField = CHART_FIELDS.find(f => f.key === config.xField);
          const yField = CHART_FIELDS.find(f => f.key === config.yField);
          
          const rawX = item[config.xField];
          const rawY = item[config.yField];
          
          const rowKey = xField?.type === 'boolean' ? normalizeSimNao(rawX) : String(rawX || 'Não informado');
          const colKey = yField?.type === 'boolean' ? normalizeSimNao(rawY) : String(rawY || 'Não informado');
          
          if (!tableData[rowKey]) {
            tableData[rowKey] = {};
          }
          
          if (!tableData[rowKey][colKey]) {
            tableData[rowKey][colKey] = 0;
          }
          
          tableData[rowKey][colKey]++;
        });
        
        return Object.entries(tableData).map(([row, cols]) => ({
          row,
          ...cols,
          total: Object.values(cols).reduce((sum, val) => sum + val, 0)
        }));
      }
      
      // Para gráficos, processar normalmente
      const xFieldInfo = CHART_FIELDS.find(f => f.key === config.xField);
      const isBooleanX = xFieldInfo?.type === 'boolean';
      
      const groupedData = data.reduce((acc, item) => {
        const rawX = item[config.xField];
        const xValue = isBooleanX ? normalizeSimNao(rawX) : String(rawX || 'Não informado');
        const yValue = Number(item[config.yField]) || 0;
        
        if (!acc[xValue]) {
          acc[xValue] = [];
        }
        acc[xValue].push(yValue);
        
        return acc;
      }, {} as Record<string, number[]>);

      // Aplicar agregação
      const processedData = Object.entries(groupedData).map(([key, values]) => {
        let aggregatedValue: number;
        
        switch (config.aggregation) {
          case 'count':
            aggregatedValue = values.length;
            break;
          case 'sum':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0);
            break;
          case 'avg':
            aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
            break;
          case 'min':
            aggregatedValue = Math.min(...values);
            break;
          case 'max':
            aggregatedValue = Math.max(...values);
            break;
          default:
            aggregatedValue = values.length;
        }

        return {
          name: key,
          value: Math.round(aggregatedValue * 100) / 100,
          [config.xField]: key,
          [config.yField]: aggregatedValue,
        };
      });

      return processedData.sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Erro ao processar dados do gráfico:', error);
      return [];
    }
  }, [data, config]);
};
