
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

export interface DataRow {
  id: string;
  'Nome da unidade': string;
  'Tipo de unidade': string;
  'RVR': number;
  'Ano CAIP': string;
  'Situação do imóvel': string;
  'Área construída (m²)'?: number;
  'Unidade Gestora': string;
}

export const useSupabaseData = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformData = (supabaseData: DadosCAIP[]): DataRow[] => {
    return supabaseData.map(item => ({
      id: item.id,
      'Nome da unidade': item.nome_da_unidade || '',
      'Tipo de unidade': item.tipo_de_unidade || '',
      'RVR': Number(item.rvr) || 0,
      'Ano CAIP': item.ano_caip || '',
      'Situação do imóvel': item.situacao_do_imovel || '',
      'Área construída (m²)': item.area_construida_m2 ? Number(item.area_construida_m2) : undefined,
      'Unidade Gestora': item.unidade_gestora || '',
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
