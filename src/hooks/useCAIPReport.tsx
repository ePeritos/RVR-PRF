import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { pdfService } from '@/utils/pdf/pdfService';
import { supabase } from '@/integrations/supabase/client';

type DadosCAIP = Tables<'dados_caip'>;

interface CustomReportData {
  titulo: string;
  descricao?: string;
  campos_incluidos: string[];
  incluir_imagens: boolean;
  formato: string;
  dados: any[];
  total_imoveis: number;
  data_geracao: string;
  gerado_por: string;
}

export interface MaintenanceScore {
  nome_ambiente: string;
  score_conservacao: number;
  peso: number;
}

export const useCAIPReport = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchMaintenanceScores = async (imovelId: string): Promise<MaintenanceScore[]> => {
    try {
      const { data, error } = await supabase
        .from('manutencao_ambientes')
        .select('score_conservacao, ambiente_id, caderno_ambientes!inner(nome_ambiente, peso)')
        .eq('imovel_id', imovelId);

      if (error) {
        console.error('Erro ao buscar notas de manutenção:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        nome_ambiente: item.caderno_ambientes?.nome_ambiente || 'Desconhecido',
        score_conservacao: item.score_conservacao,
        peso: item.caderno_ambientes?.peso || 0,
      }));
    } catch (err) {
      console.error('Erro ao buscar manutenção:', err);
      return [];
    }
  };

  const generateReport = async (data: DadosCAIP | CustomReportData) => {
    setIsGenerating(true);
    try {
      const isCustomReport = 'titulo' in data && 'dados' in data;
      
      if (isCustomReport) {
        console.log('Iniciando geração de relatório customizado:', data.titulo);
        await pdfService.generateFromData({
          nome: `${data.titulo.replace(/[^a-zA-Z0-9\s]/g, '_')}`,
          ...data
        });
      } else {
        const caipData = data as DadosCAIP;
        console.log('Iniciando geração de relatório CAIP para:', caipData.nome_da_unidade);
        
        // Fetch maintenance scores
        const maintenanceScores = await fetchMaintenanceScores(caipData.id);
        console.log('Notas de manutenção carregadas:', maintenanceScores.length);
        
        await pdfService.generateFromData({
          nome: `${caipData.nome_da_unidade || 'Relatorio'}_${caipData.ano_caip || '2024'}`,
          maintenanceScores,
          ...caipData
        });
      }

      toast({
        title: "Sucesso",
        description: isCustomReport ? `Relatório "${(data as CustomReportData).titulo}" gerado com sucesso.` : "Relatório CAIP gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    isGenerating
  };
};
