
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnidadesGestoras = () => {
  const [unidadesGestoras, setUnidadesGestoras] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnidadesGestoras();
  }, []);

  const fetchUnidadesGestoras = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dados_caip')
        .select('unidade_gestora')
        .not('unidade_gestora', 'is', null)
        .order('unidade_gestora');

      if (error) throw error;

      // Extrair valores únicos e filtrar vazios
      const unidadesUnicas = [...new Set(
        data
          .map(item => item.unidade_gestora)
          .filter(unidade => unidade && unidade.trim() !== '')
      )].sort();

      setUnidadesGestoras(unidadesUnicas);
    } catch (error: any) {
      console.error('Erro ao carregar unidades gestoras:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    unidadesGestoras,
    loading
  };
};
