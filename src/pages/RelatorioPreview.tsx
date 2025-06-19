import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { CustomReportPDFTemplate } from '@/components/reports/CustomReportPDFTemplate';
import { useCAIPReport } from '@/hooks/useCAIPReport';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
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

const RelatorioPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateReport, isGenerating } = useCAIPReport();
  const { toast } = useToast();
  
  const reportData = location.state?.reportData as ReportData;

  console.log('=== DEBUG RelatorioPreview ===');
  console.log('Report data recebido:', reportData);

  if (!reportData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os dados do relatório.
          </p>
          <Button onClick={() => navigate('/relatorios')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Relatórios
          </Button>
        </div>
      </div>
    );
  }

  const handleGeneratePDF = async () => {
    try {
      console.log('Gerando PDF com dados:', reportData);
      await generateReport(reportData);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o PDF. Verifique os logs do console.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/relatorios')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Preview do Relatório</h1>
            <p className="text-muted-foreground">
              Verifique os dados antes de gerar o PDF
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar Impressão
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Informações de Debug:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Título:</strong> {reportData.titulo}
          </div>
          <div>
            <strong>Total de imóveis:</strong> {reportData.total_imoveis}
          </div>
          <div>
            <strong>Incluir imagens:</strong> {reportData.incluir_imagens ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Campos selecionados:</strong> {reportData.campos_incluidos.length}
          </div>
        </div>
        
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">Ver campos selecionados</summary>
          <div className="mt-2 text-xs bg-background p-2 rounded border">
            {reportData.campos_incluidos.join(', ')}
          </div>
        </details>

        <details className="mt-2">
          <summary className="cursor-pointer font-medium">Ver dados completos (JSON)</summary>
          <div className="mt-2 text-xs bg-background p-2 rounded border max-h-40 overflow-auto">
            <pre>{JSON.stringify(reportData.dados, null, 2)}</pre>
          </div>
        </details>
      </div>

      {/* Preview Container */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="mb-4 text-center text-sm text-muted-foreground">
          Preview do Relatório - Este é exatamente como aparecerá no PDF
        </div>
        
        {/* Template Preview */}
        <div id="report-preview" className="print:shadow-none">
          <CustomReportPDFTemplate 
            data={reportData}
            className="print:p-0 print:max-w-none print:mx-0"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Se os dados ou imagens não estiverem corretos no preview acima, 
          eles também não aparecerão no PDF. Verifique os dados antes de gerar.
        </p>
      </div>
    </div>
  );
};

export default RelatorioPreview;