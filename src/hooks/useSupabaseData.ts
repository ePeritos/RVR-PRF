import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

export interface DataRow {
  id: string;
  'ano_caip': string;
  'tipo_de_unidade': string;
  'unidade_gestora': string;
  'estado_de_conservacao': string;
  'vida_util_estimada_anos': number;  // Alterado de string para number
  'area_do_terreno_m2': number;
  'area_construida_m2': number;
  'nome_da_unidade': string;
  'situacao_do_imovel': string;
  'endereco': string;
  'rip': string;
  'matricula_do_imovel': string;
  'processo_sei': string;
  'idade_aparente_do_imovel': number;  // Alterado de string para number
  'rvr': number;
}

export const useSupabaseData = (unidadeGestoraFilter?: string) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformData = (supabaseData: DadosCAIP[]): DataRow[] => {
    return supabaseData.map(item => ({
      id: item.id,
      'ano_caip': item.ano_caip || '',
      'tipo_de_unidade': item.tipo_de_unidade || '',
      'unidade_gestora': item.unidade_gestora || '',
      'estado_de_conservacao': item.estado_de_conservacao || '',
      'vida_util_estimada_anos': item.vida_util_estimada_anos ? Number(item.vida_util_estimada_anos) : 0,
      'area_do_terreno_m2': item.area_do_terreno_m2 ? Number(item.area_do_terreno_m2) : 0,
      'area_construida_m2': item.area_construida_m2 ? Number(item.area_construida_m2) : 0,
      'nome_da_unidade': item.nome_da_unidade || '',
      'situacao_do_imovel': item.situacao_do_imovel || '',
      'endereco': item.endereco || '',
      'rip': item.rip || '',
      'matricula_do_imovel': item.matricula_do_imovel || '',
      'processo_sei': item.processo_sei || '',
      'idade_aparente_do_imovel': item.idade_aparente_do_imovel ? Number(item.idade_aparente_do_imovel) : 15,
      'rvr': item.rvr ? Number(item.rvr) : 0,
    }));
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      let allData: DadosCAIP[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      console.log('Iniciando busca de dados da tabela dados_caip...');
      if (unidadeGestoraFilter) {
        console.log(`Aplicando filtro por unidade gestora: ${unidadeGestoraFilter}`);
      }

      while (hasMore) {
        let query = supabase
          .from('dados_caip')
          .select('*', { count: 'exact' });

        // Aplicar filtro por unidade gestora se fornecido
        if (unidadeGestoraFilter) {
          query = query.eq('unidade_gestora', unidadeGestoraFilter);
        }

        const { data: batchData, error, count } = await query
          .range(from, from + batchSize - 1);

        if (error) {
          console.error('Erro na consulta:', error);
          throw error;
        }

        if (batchData) {
          allData = [...allData, ...batchData];
          console.log(`Carregados ${batchData.length} registros (total: ${allData.length})`);
          
          if (batchData.length < batchSize) {
            hasMore = false;
          } else {
            from += batchSize;
          }
        } else {
          hasMore = false;
        }

        if (from === 0 && count !== null) {
          console.log(`Total de registros na tabela: ${count}`);
        }
      }

      console.log(`Busca finalizada. Total de registros carregados: ${allData.length}`);
      
      const transformedData = transformData(allData);
      setData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [unidadeGestoraFilter]);

  return { data, loading, error, refetch: fetchAllData };
};
