
import { useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RVRReportViewer } from './reports/RVRReportViewer';
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ResultRow {
  id: string;
  nome: string;
  tipo: string;
  categoria: string;
  areaConstruida: number;
  areaTerreno: number;
  valorBenfeitoria: number;
  valorTerreno: number;
  valorTotal: number;
  taxaDepreciacao: number;
  valorDepreciacao: number;
  valorDepreciado: number;
  valorOriginal: number;
  valorAvaliado: number;
  diferenca: number;
  percentual: number;
  areaImovel?: number;
  situacaoImovel?: string;
  unidadeGestora?: string;
  anoCAIP?: string;
  endereco?: string;
  rip?: string;
  matriculaImovel?: string;
  estadoConservacao?: string;
  idadeAparente?: number | null;
  padraoConstrutivo?: string;
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
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ResultRow | null>(null);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  const fetchUserProfile = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  const getDiferencaColor = (valor: number) => {
    if (valor > 0) return 'text-green-600 dark:text-green-400';
    if (valor < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const handleViewReport = async (result: ResultRow) => {
    const profile = await fetchUserProfile();
    
    const reportData = {
      ...result,
      parametros,
      responsavelTecnico: profile ? {
        nome_completo: profile.nome_completo,
        cargo: profile.cargo,
        matricula: profile.matricula,
        unidade_lotacao: profile.unidade_lotacao
      } : undefined
    };
    
    setSelectedReport(reportData);
    setUserProfile(profile);
    setIsReportViewerOpen(true);
  };

  const handleDownloadReport = async (result: ResultRow) => {
    setIsDownloadingPDF(result.id);
    
    try {
      const profile = await fetchUserProfile();
      
      const reportData = {
        ...result,
        parametros,
        responsavelTecnico: profile ? {
          nome_completo: profile.nome_completo,
          cargo: profile.cargo,
          matricula: profile.matricula,
          unidade_lotacao: profile.unidade_lotacao
        } : undefined
      };
      
      console.log('Iniciando download direto do PDF para:', reportData.nome);
      console.log('Dados do relatório:', reportData);
      
      // Usa o novo serviço de PDF que não depende de elementos no DOM
      await generatePDF(reportData);
      
      toast({
        title: "PDF Gerado",
        description: "O relatório RVR foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPDF(null);
    }
  };

  const handleCloseReportViewer = () => {
    setIsReportViewerOpen(false);
    setSelectedReport(null);
    setUserProfile(null);
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
                <th className="p-3 text-left text-xs font-medium text-foreground">Nome</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Tipo</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Área Const.</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Área Terreno</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Idade Aparente</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Estado de Conservação</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Padrão Construtivo</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Valor Benfeitoria</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Valor Terreno</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Depreciação</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">RVR Final</th>
                <th className="p-3 text-left text-xs font-medium text-foreground">Ações</th>
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
                  <td className="p-3 text-xs font-medium text-foreground max-w-32">
                    <div className="truncate" title={row.nome}>{row.nome}</div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground max-w-24">
                    <div className="truncate" title={row.tipo}>{row.tipo}</div>
                  </td>
                  <td className="p-3 text-xs text-foreground text-center">
                    {row.areaConstruida.toFixed(0)} m²
                  </td>
                  <td className="p-3 text-xs text-foreground text-center">
                    {row.areaTerreno.toFixed(0)} m²
                  </td>
                  <td className="p-3 text-xs text-foreground text-center">
                    {row.idadeAparente !== null && row.idadeAparente !== undefined ? `${row.idadeAparente} anos` : '-'}
                  </td>
                  <td className="p-3 text-xs text-foreground">
                    {row.estadoConservacao || '-'}
                  </td>
                  <td className="p-3 text-xs text-foreground">
                    {row.padraoConstrutivo || '-'}
                  </td>
                  <td className="p-3 text-xs text-foreground">
                    {row.valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                  </td>
                  <td className="p-3 text-xs text-foreground">
                    {row.valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                  </td>
                  <td className="p-3 text-xs text-orange-600">
                    -{row.taxaDepreciacao.toFixed(1)}%<br/>
                    <span className="text-xs">
                      {row.valorDepreciacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className="p-3 text-xs font-bold text-green-600">
                    {row.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewReport(row)}
                        className="hover-scale h-8 w-8 p-0"
                        title="Visualizar Relatório RVR"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(row)}
                        disabled={isDownloadingPDF === row.id}
                        className="hover-scale h-8 w-8 p-0"
                        title="Baixar Relatório RVR"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum resultado disponível
          </div>
        )}
      </Card>

      {/* Visualizador do Relatório */}
      {selectedReport && isReportViewerOpen && (
        <RVRReportViewer
          data={selectedReport}
          isOpen={isReportViewerOpen}
          onClose={handleCloseReportViewer}
        />
      )}
    </>
  );
}
