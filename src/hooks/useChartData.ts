
import { useMemo } from 'react';
import { DataRow } from '@/hooks/useSupabaseData';

export interface ChartField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
}

export interface ChartConfig {
  id: string;
  name: string;
  type: 'bar' | 'pie' | 'line' | 'area' | 'scatter';
  xField: string;
  yField: string;
  groupField?: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
  colors?: string[];
}

// Campos disponíveis dos dados CAIP
export const CHART_FIELDS: ChartField[] = [
  { key: 'unidade_gestora', label: 'Unidade Gestora', type: 'string' },
  { key: 'tipo_de_unidade', label: 'Tipo de Unidade', type: 'string' },
  { key: 'estado_de_conservacao', label: 'Estado de Conservação', type: 'string' },
  { key: 'ano_caip', label: 'Ano CAIP', type: 'string' },
  { key: 'area_construida_m2', label: 'Área Construída (m²)', type: 'number' },
  { key: 'area_do_terreno_m2', label: 'Área do Terreno (m²)', type: 'number' },
  { key: 'idade_aparente_do_imovel', label: 'Idade Aparente (anos)', type: 'number' },
  { key: 'vida_util_estimada_anos', label: 'Vida Útil Estimada (anos)', type: 'number' },
  { key: 'rvr', label: 'RVR (R$)', type: 'number' },
  { key: 'nota_global', label: 'Nota Global', type: 'number' },
];

export const useChartData = (data: DataRow[], config: ChartConfig) => {
  return useMemo(() => {
    if (!data.length || !config.xField || !config.yField) {
      return [];
    }

    // Agrupar dados por campo X
    const groupedData = data.reduce((acc, item) => {
      const xValue = item[config.xField] || 'Não informado';
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
        value: Math.round(aggregatedValue * 100) / 100, // Arredondar para 2 casas decimais
        [config.xField]: key,
        [config.yField]: aggregatedValue,
      };
    });

    // Ordenar por valor (maior para menor)
    return processedData.sort((a, b) => b.value - a.value);
  }, [data, config]);
};
