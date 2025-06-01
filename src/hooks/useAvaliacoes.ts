
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AvaliacaoHistorico {
  id: string;
  nome_avaliacao: string;
  parametros: any;
  resultados: any;
  total_imoveis: number;
  valor_total_avaliado: number;
  created_at: string;
  updated_at: string;
}

export const useAvaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAvaliacoes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('avaliacoes_historico')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvaliacoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de avaliações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarAvaliacao = async (
    nomeAvaliacao: string,
    parametros: any,
    resultados: any,
    totalImoveis: number,
    valorTotalAvaliado: number
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('avaliacoes_historico')
        .insert({
          user_id: user.id,
          nome_avaliacao: nomeAvaliacao,
          parametros,
          resultados,
          total_imoveis: totalImoveis,
          valor_total_avaliado: valorTotalAvaliado,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Avaliação salva no histórico",
      });

      await fetchAvaliacoes();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar avaliação",
        variant: "destructive",
      });
    }
  };

  const excluirAvaliacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('avaliacoes_historico')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Avaliação excluída do histórico",
      });

      await fetchAvaliacoes();
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir avaliação",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAvaliacoes();
    }
  }, [user]);

  return {
    avaliacoes,
    loading,
    salvarAvaliacao,
    excluirAvaliacao,
    refetch: fetchAvaliacoes,
  };
};
