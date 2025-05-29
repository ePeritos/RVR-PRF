
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
  'vida_util_estimada_anos': string;
  'area_do_terreno_m2': number;
  'area_construida_m2': number;
  'nome_da_unidade': string;
  'situacao_do_imovel': string;
  'endereco': string;
  'rip': string;
  'matricula_do_imovel': string;
  'processo_sei': string;
  'idade_aparente_do_imovel': string;
  'rvr': number;
}

export const useSupabaseData = () => {
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
      'vida_util_estimada_anos': item.vida_util_estimada_anos || '',
      'area_do_terreno_m2': item.area_do_terreno_m2 ? Number(item.area_do_terreno_m2) : 0,
      'area_construida_m2': item.area_construida_m2 ? Number(item.area_construida_m2) : 0,
      'nome_da_unidade': item.nome_da_unidade || '',
      'situacao_do_imovel': item.situacao_do_imovel || '',
      'endereco': item.endereco || '',
      'rip': item.rip || '',
      'matricula_do_imovel': item.matricula_do_imovel || '',
      'processo_sei': item.processo_sei || '',
      'idade_aparente_do_imovel': item.idade_aparente_do_imovel || '',
      'rvr': item.rvr ? Number(item.rvr) : 0,
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: supabaseData, error } = await supabase
        .from('dados_caip')
        .select('*');

      if (error) throw error;

      const transformedData = transformData(supabaseData || []);
      setData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
