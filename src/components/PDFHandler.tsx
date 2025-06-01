
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface PDFHandlerProps {
  results: any[];
  fetchUserProfile: () => Promise<any>;
}

export const PDFHandler = ({ results, fetchUserProfile }: PDFHandlerProps) => {
  const { toast } = useToast();

  const handleViewPDF = (id: string) => {
    console.log('View RVR PDF for property:', id);
    // In real app, this would open RVR PDF viewer
  };

  const handleDownloadPDF = async (id: string) => {
    console.log('Download RVR PDF for property:', id);
    
    try {
      const resultData = results.find(result => result.id === id);
      if (resultData) {
        const profile = await fetchUserProfile();
        
        console.log('DADOS SENDO ENVIADOS PARA O PDF:', {
          resultData: resultData,
          parametros: resultData.parametros,
          valorM2: resultData.parametros?.valorM2,
          cubM2: resultData.parametros?.cubM2,
          bdi: resultData.parametros?.bdi
        });
        
        const reportData = {
          ...resultData,
          responsavelTecnico: profile ? {
            nome: profile.nome_completo,
            cargo: profile.cargo,
            matricula: profile.matricula,
            unidadeLotacao: profile.unidade_lotacao
          } : undefined
        };
        
        await generatePDF(reportData);
        toast({
          title: "PDF Gerado",
          description: "O relatório RVR foi baixado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    handleViewPDF,
    handleDownloadPDF
  };
};
