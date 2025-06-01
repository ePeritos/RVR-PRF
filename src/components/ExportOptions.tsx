
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, FileSpreadsheet, FileText, FileImage } from 'lucide-react';
import { exportToExcel, exportToWord, exportToPDF } from '@/utils/exportHelpers';
import { useToast } from '@/hooks/use-toast';

interface ExportOptionsProps {
  data: any[];
  fileName?: string;
}

export function ExportOptions({ data, fileName = 'relatorio_rvr' }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customFileName, setCustomFileName] = useState(fileName);
  const [assinaturaDigital, setAssinaturaDigital] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'excel' | 'word' | 'pdf') => {
    if (data.length === 0) {
      toast({
        title: "Erro",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      switch (format) {
        case 'excel':
          await exportToExcel(data, customFileName);
          break;
        case 'word':
          await exportToWord(data, customFileName);
          break;
        case 'pdf':
          await exportToPDF(data, customFileName, assinaturaDigital || undefined);
          break;
      }

      toast({
        title: "Sucesso",
        description: `Arquivo ${format.toUpperCase()} exportado com sucesso`,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao exportar arquivo ${format.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Opções de Exportação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Arquivo</label>
            <Input
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="nome_do_arquivo"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Assinatura Digital (PDF)</label>
            <Textarea
              value={assinaturaDigital}
              onChange={(e) => setAssinaturaDigital(e.target.value)}
              placeholder="Ex: João Silva - Engenheiro Civil - CREA/SP 123456"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Formatos Disponíveis</label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className="justify-start"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Excel (.xlsx)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('word')}
                disabled={isExporting}
                className="justify-start"
              >
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                Word (.doc)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="justify-start"
              >
                <FileImage className="h-4 w-4 mr-2 text-red-600" />
                PDF (.pdf)
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p><strong>Excel:</strong> Dados em planilha com formatação</p>
            <p><strong>Word:</strong> Relatório formatado para edição</p>
            <p><strong>PDF:</strong> Documento final com assinatura digital</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
