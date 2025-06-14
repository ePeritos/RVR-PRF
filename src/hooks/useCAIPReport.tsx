import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { pdfService } from '@/utils/pdf/pdfService';

type DadosCAIP = Tables<'dados_caip'>;

export const useCAIPReport = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (data: DadosCAIP) => {
    setIsGenerating(true);
    try {
      console.log('Iniciando geração de relatório CAIP para:', data.nome_da_unidade);
      
      // Usar o serviço de PDF existente
      await pdfService.generateFromData({
        nome: `CAIP_${data.nome_da_unidade || 'Relatorio'}_${data.ano_caip || '2024'}`,
        ...data
      });

      toast({
        title: "Sucesso",
        description: "Relatório CAIP gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório CAIP:', error);
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