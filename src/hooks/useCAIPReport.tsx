import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { pdfService } from '@/utils/pdf/pdfService';

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

export const useCAIPReport = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (data: DadosCAIP | CustomReportData) => {
    setIsGenerating(true);
    try {
      // Detectar se é relatório customizado ou CAIP individual
      const isCustomReport = 'titulo' in data && 'dados' in data;
      
      if (isCustomReport) {
        console.log('Iniciando geração de relatório customizado:', data.titulo);
        
        // Para relatório customizado, usar dados como estão
        await pdfService.generateFromData({
          nome: `Custom_${data.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`,
          ...data
        });
      } else {
        console.log('Iniciando geração de relatório CAIP para:', (data as DadosCAIP).nome_da_unidade);
        
        // Para CAIP individual, usar formato antigo
        await pdfService.generateFromData({
          nome: `CAIP_${(data as DadosCAIP).nome_da_unidade || 'Relatorio'}_${(data as DadosCAIP).ano_caip || '2024'}`,
          ...data
        });
      }

      toast({
        title: "Sucesso",
        description: isCustomReport ? `Relatório "${data.titulo}" gerado com sucesso.` : "Relatório CAIP gerado com sucesso.",
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