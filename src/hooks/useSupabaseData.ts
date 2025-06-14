import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { queryCache } from '@/utils/performanceUtils';

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

  const transformData = (supabaseData: any[]): DataRow[] => {
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

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use cache for better performance
      const cacheKey = `supabase-data-${unidadeGestoraFilter || 'all'}`;
      const cachedData = queryCache.get(cacheKey);
      
      if (cachedData) {
        console.log('🚀 Using cached supabase data');
        setData(cachedData as DataRow[]);
        setLoading(false);
        return;
      }

      console.log('📊 Fetching supabase data optimized...');
      if (unidadeGestoraFilter) {
        console.log(`Aplicando filtro por unidade gestora: ${unidadeGestoraFilter}`);
      }

      // Optimized single query instead of batching
      let query = supabase
        .from('dados_caip')
        .select(`
          id, ano_caip, tipo_de_unidade, unidade_gestora, estado_de_conservacao,
          vida_util_estimada_anos, area_do_terreno_m2, area_construida_m2,
          nome_da_unidade, situacao_do_imovel, endereco, rip, matricula_do_imovel,
          processo_sei, idade_aparente_do_imovel, rvr
        `)
        .order('created_at', { ascending: false })
        .limit(2000); // Reasonable limit

      // Apply filter if provided
      if (unidadeGestoraFilter) {
        query = query.eq('unidade_gestora', unidadeGestoraFilter);
      }

      const { data: fetchedData, error } = await query;

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }

      if (fetchedData) {
        console.log(`✅ Data fetched successfully: ${fetchedData.length} records`);
        const transformedData = transformData(fetchedData);
        
        // Cache the results
        queryCache.set(cacheKey, transformedData);
        
        setData(transformedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [unidadeGestoraFilter]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return { data, loading, error, refetch: fetchAllData };
};
