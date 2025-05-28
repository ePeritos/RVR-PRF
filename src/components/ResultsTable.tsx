
import { useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RVRReportViewer } from './reports/RVRReportViewer';

interface ResultRow {
  id: string;
  nome: string;
  categoria: string;
  valorOriginal: number;
  valorAvaliado: number;
  diferenca: number;
  percentual: number;
  areaImovel?: number;
  situacaoImovel?: string;
  unidadeGestora?: string;
  anoCAIP?: string;
  parametros?: {
    cub: number;
    valorM2: number;
    bdi: number;
  };
}

interface ResultsTableProps {
  results: ResultRow[];
  onViewPDF: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  parametros?: {
    cub: number;
    valorM2: number;
    bdi: number;
  };
}

export function ResultsTable({ results, onViewPDF, onDownloadPDF, parametros }: ResultsTableProps) {
  const [selectedReport, setSelectedReport] = useState<ResultRow | null>(null);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);

  const totalOriginal = results.reduce((sum, item) => sum + item.valorOriginal, 0);
  const totalAvaliado = results.reduce((sum, item) => sum + item.valorAvaliado, 0);
  const totalDiferenca = totalAvaliado - totalOriginal;
  const totalPercentual = totalOriginal > 0 ? (totalDiferenca / totalOriginal) * 100 : 0;

  const getDiferencaColor = (valor: number) => {
    if (valor > 0) return 'text-green-600 dark:text-green-400';
    if (valor < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const handleViewReport = (result: ResultRow) => {
    const reportData = {
      ...result,
      parametros
    };
    setSelectedReport(reportData);
    setIsReportViewerOpen(true);
  };

  const handleDownloadReport = (result: ResultRow) => {
    onDownloadPDF(result.id);
  };

  const handleCloseReportViewer = () => {
    setIsReportViewerOpen(false);
    setSelectedReport(null);
  };

  return (
    <>
      <Card className="overflow-hidden bg-card border border-border">
        <div className="p-6 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Resultados da Avaliação</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {results.length} item(s) avaliado(s)
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-foreground">Nome</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Categoria</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Valor Original</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Valor Avaliado</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Diferença</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">%</th>
                <th className="p-4 text-left text-sm font-medium text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`border-b border-border hover:bg-muted/20 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <td className="p-4 text-sm font-medium text-foreground">{row.nome}</td>
                  <td className="p-4 text-sm text-muted-foreground">{row.categoria}</td>
                  <td className="p-4 text-sm text-foreground">
                    {row.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-sm font-medium text-foreground">
                    {row.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className={`p-4 text-sm font-medium ${getDiferencaColor(row.diferenca)}`}>
                    {row.diferenca > 0 ? '+' : ''}{row.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className={`p-4 text-sm font-medium ${getDiferencaColor(row.diferenca)}`}>
                    {row.percentual > 0 ? '+' : ''}{row.percentual.toFixed(2)}%
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewReport(row)}
                        className="hover-scale"
                        title="Visualizar Relatório RVR"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(row)}
                        className="hover-scale"
                        title="Baixar Relatório RVR"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/50 border-t-2 border-border">
              <tr>
                <td colSpan={2} className="p-4 text-sm font-semibold text-foreground">TOTAL</td>
                <td className="p-4 text-sm font-semibold text-foreground">
                  {totalOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="p-4 text-sm font-semibold text-foreground">
                  {totalAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className={`p-4 text-sm font-semibold ${getDiferencaColor(totalDiferenca)}`}>
                  {totalDiferenca > 0 ? '+' : ''}{totalDiferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className={`p-4 text-sm font-semibold ${getDiferencaColor(totalDiferenca)}`}>
                  {totalPercentual > 0 ? '+' : ''}{totalPercentual.toFixed(2)}%
                </td>
                <td className="p-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {results.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum resultado disponível
          </div>
        )}
      </Card>

      {/* Visualizador do Relatório */}
      {selectedReport && (
        <RVRReportViewer
          data={selectedReport}
          isOpen={isReportViewerOpen}
          onClose={handleCloseReportViewer}
        />
      )}
    </>
  );
}
