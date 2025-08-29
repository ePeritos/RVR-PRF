import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ValorCUB {
  id: string;
  uf: string;
  padrao_construtivo: string;
  valor_m2: number;
  data_referencia: string;
  fonte: string | null;
}

export const useValoresCUB = () => {
  const [valoresCUB, setValoresCUB] = useState<ValorCUB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchValoresCUB = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('valores_cub')
        .select('*')
        .order('uf, padrao_construtivo');

      if (supabaseError) {
        throw supabaseError;
      }

      setValoresCUB(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar valores CUB:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValoresCUB();
  }, []);

  const getValorCUB = (uf: string, padraoConstrutivo: string): ValorCUB | undefined => {
    return valoresCUB.find(
      v => v.uf === uf && v.padrao_construtivo === padraoConstrutivo
    );
  };

  const getUfsDisponiveis = (): string[] => {
    const ufs = [...new Set(valoresCUB.map(v => v.uf))];
    return ufs.sort();
  };

  const getPadroesDisponiveis = (uf?: string): string[] => {
    let padroes: string[];
    if (uf) {
      padroes = valoresCUB.filter(v => v.uf === uf).map(v => v.padrao_construtivo);
    } else {
      padroes = valoresCUB.map(v => v.padrao_construtivo);
    }
    return [...new Set(padroes)].sort();
  };

  return {
    valoresCUB,
    loading,
    error,
    getValorCUB,
    getUfsDisponiveis,
    getPadroesDisponiveis,
    refetch: fetchValoresCUB
  };
};