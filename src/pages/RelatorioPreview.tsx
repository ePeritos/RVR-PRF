import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Eye, Bug, EyeOff } from 'lucide-react';
import { useCAIPReport } from '@/hooks/useCAIPReport';
import { useToast } from '@/hooks/use-toast';
import { ReportContent } from '@/components/reports/ReportContent';

const RelatorioPreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generateReport, isGenerating } = useCAIPReport();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  
  const reportData = location.state?.reportData;

  console.log('=== DEBUG RelatorioPreview COMPLETO ===');
  console.log('Location object completo:', location);
  console.log('Location state:', location.state);
  console.log('Report data:', reportData);
  console.log('Report data type:', typeof reportData);
  
  if (reportData) {
    console.log('=== ESTRUTURA DOS DADOS ===');
    console.log('Título:', reportData.titulo);
    console.log('Campos incluídos:', reportData.campos_incluidos);
    console.log('Incluir imagens:', reportData.incluir_imagens);
    console.log('Total imóveis:', reportData.total_imoveis);
    console.log('Dados length:', reportData.dados?.length);
    console.log('Primeiro imóvel:', reportData.dados?.[0]);
    
    if (reportData.dados && reportData.dados.length > 0) {
      const primeiro = reportData.dados[0];
      console.log('=== CAMPOS DO PRIMEIRO IMÓVEL ===');
      console.log('ID:', primeiro.id);
      console.log('Nome:', primeiro.nome_da_unidade);
      console.log('Tipo:', primeiro.tipo_de_unidade);
      console.log('Alojamento feminino:', primeiro.alojamento_feminino);
      console.log('Alojamento masculino:', primeiro.alojamento_masculino);
      console.log('Área construída:', primeiro.area_construida_m2);
      console.log('Estado conservação:', primeiro.estado_de_conservacao);
      console.log('Imagem geral:', primeiro.imagem_geral);
      console.log('Imagem fachada:', primeiro.imagem_fachada);
      console.log('Todas as chaves:', Object.keys(primeiro));
    }
  }

  if (!reportData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro</h1>
          <p className="text-muted-foreground mb-4">
            Dados do relatório não encontrados. Tente gerar o relatório novamente.
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
      console.log('Iniciando geração de PDF com dados:', reportData);
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
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? <EyeOff className="w-4 h-4 mr-2" /> : <Bug className="w-4 h-4 mr-2" />}
            {showDebug ? 'Ocultar Debug' : 'Mostrar Debug'}
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
      {showDebug && (
        <div className="mb-6 p-4 bg-muted border border-border rounded-lg">
          <h3 className="font-semibold mb-2 text-foreground">Debug - Informações do Relatório:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Título:</strong> {reportData.titulo}</p>
            <p><strong>Total de imóveis:</strong> {reportData.total_imoveis}</p>
            <p><strong>Incluir imagens:</strong> {reportData.incluir_imagens ? 'Sim' : 'Não'}</p>
            <p><strong>Campos selecionados:</strong> {reportData.campos_incluidos?.length || 0}</p>
            <p><strong>Dados disponíveis:</strong> {reportData.dados?.length || 0} registros</p>
          </div>
          
          <details className="mt-3">
            <summary className="cursor-pointer font-medium text-foreground">Ver campos selecionados</summary>
            <div className="mt-2 text-xs bg-card p-2 rounded border border-border">
              {reportData.campos_incluidos?.join(', ') || 'Nenhum campo selecionado'}
            </div>
          </details>

          <details className="mt-2">
            <summary className="cursor-pointer font-medium text-foreground">Ver primeiro registro (dados brutos)</summary>
            <div className="mt-2 text-xs bg-card p-2 rounded border border-border max-h-40 overflow-auto">
              <pre className="text-foreground">{JSON.stringify(reportData.dados?.[0] || {}, null, 2)}</pre>
            </div>
          </details>
        </div>
      )}

      {/* Preview Container */}
      <div className="mb-4 text-center text-sm text-gray-600 border-b pb-4">
        <strong>Preview do Relatório - Exatamente como aparecerá no PDF</strong>
      </div>
      
      <ReportContent data={reportData} />
    </div>
  );
};

export default RelatorioPreview;