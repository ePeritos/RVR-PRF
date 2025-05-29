
import React, { useState } from 'react';
import { Download, Copy, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RVRReportTemplate } from './RVRReportTemplate';
import { generatePDF, copyReportToClipboard } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface RVRReportData {
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

interface RVRReportViewerProps {
  data: RVRReportData;
  isOpen: boolean;
  onClose: () => void;
}

export function RVRReportViewer({ data, isOpen, onClose }: RVRReportViewerProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Usa o novo serviço de PDF que não depende do elemento renderizado
      await generatePDF(data);
      toast({
        title: "PDF Gerado",
        description: "O relatório RVR foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyReport = async () => {
    setIsCopying(true);
    try {
      await copyReportToClipboard(data);
      toast({
        title: "Copiado",
        description: "O relatório foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Relatório RVR - {data.nome}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyReport}
                disabled={isCopying}
                className="hover-scale"
              >
                <Copy className="h-4 w-4 mr-2" />
                {isCopying ? 'Copiando...' : 'Copiar'}
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="hover-scale"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="hover-scale"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <RVRReportTemplate data={data} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
