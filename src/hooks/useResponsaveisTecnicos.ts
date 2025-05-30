
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResponsavelTecnico {
  id: string;
  nome_completo: string;
  formacao: string;
  conselho: string;
  numero_registro: string;
  uf: string;
}

export const useResponsaveisTecnicos = () => {
  const [responsaveisTecnicos, setResponsaveisTecnicos] = useState<ResponsavelTecnico[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResponsaveisTecnicos();
  }, []);

  const fetchResponsaveisTecnicos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('responsaveis_tecnicos')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo');

      if (error) throw error;
      setResponsaveisTecnicos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar responsáveis técnicos:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    responsaveisTecnicos,
    loading
  };
};
