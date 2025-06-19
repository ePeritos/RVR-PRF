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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformData = (supabaseData: DadosCAIP[]): any[] => {
    // Retornar TODOS os campos sem transformação para não perder dados
    return supabaseData.map(item => ({
      ...item, // Manter todos os campos originais
      // Garantir que campos numéricos sejam números quando possível
      vida_util_estimada_anos: item.vida_util_estimada_anos ? Number(item.vida_util_estimada_anos) : null,
      area_do_terreno_m2: item.area_do_terreno_m2 ? Number(item.area_do_terreno_m2) : null,
      area_construida_m2: item.area_construida_m2 ? Number(item.area_construida_m2) : null,
      idade_aparente_do_imovel: item.idade_aparente_do_imovel ? Number(item.idade_aparente_do_imovel) : null,
      rvr: item.rvr ? Number(item.rvr) : null,
      // Garantir que strings vazias sejam null para melhor tratamento
      nome_da_unidade: item.nome_da_unidade || null,
      tipo_de_unidade: item.tipo_de_unidade || null,
      endereco: item.endereco || null,
      estado_de_conservacao: item.estado_de_conservacao || null,
      ano_caip: item.ano_caip || null,
    }));
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      let allData: DadosCAIP[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      console.log('🔍 Iniciando busca de TODOS os dados da tabela dados_caip...');
      if (unidadeGestoraFilter) {
        console.log(`🎯 Aplicando filtro por unidade gestora: ${unidadeGestoraFilter}`);
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

      console.log(`✅ Busca finalizada. Total de registros carregados: ${allData.length}`);
      
      if (allData.length > 0) {
        console.log('📋 Campos disponíveis no primeiro registro:', Object.keys(allData[0]));
        console.log('🎯 Exemplo de dados do primeiro registro:');
        const primeiro = allData[0];
        console.log(' - Nome:', primeiro.nome_da_unidade);
        console.log(' - Tipo:', primeiro.tipo_de_unidade);
        console.log(' - Alojamento feminino:', primeiro.alojamento_feminino);
        console.log(' - Alojamento masculino:', primeiro.alojamento_masculino);
        console.log(' - Imagem geral:', primeiro.imagem_geral);
        console.log(' - Imagem fachada:', primeiro.imagem_fachada);
      }
      
      const transformedData = transformData(allData);
      console.log('🔄 Dados transformados. Total:', transformedData.length);
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
