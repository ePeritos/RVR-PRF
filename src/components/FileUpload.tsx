
import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { processExcelFile } from '@/utils/excelProcessor';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  onDataLoaded?: () => void;
}

export function FileUpload({ onFileUpload, uploadedFile, onDataLoaded }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<{updated: number, inserted: number} | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    console.log('Arquivo selecionado:', file.name, file.type);
    
    // Verificar se é um arquivo Excel
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
        variant: "destructive",
      });
      return;
    }
    
    onFileUpload(file);
    setIsProcessing(true);
    setProcessingResult(null);
    
    try {
      console.log('Iniciando processamento da planilha...');
      const result = await processExcelFile(file);
      
      if (result.success) {
        // Extrair números atualizados/inseridos da mensagem
        const updatedMatch = result.message.match(/(\d+) registros atualizados/);
        const insertedMatch = result.message.match(/(\d+) registros inseridos/);
        
        const updated = updatedMatch ? parseInt(updatedMatch[1]) : 0;
        const inserted = insertedMatch ? parseInt(insertedMatch[1]) : 0;
        
        setProcessingResult({ updated, inserted });
        
        toast({
          title: "Upload concluído!",
          description: result.message,
        });
        console.log('Upload realizado com sucesso:', result.message);
        onDataLoaded?.();
      } else {
        console.error('Erro no processamento:', result.message);
        toast({
          title: "Erro no upload",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro inesperado no processamento:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar a planilha",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-200">
      <div
        className={`text-center space-y-4 ${isDragOver ? 'opacity-75' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="animate-fade-in">
            <Loader2 className="mx-auto h-16 w-16 text-primary mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Processando Planilha...
            </h3>
            <p className="text-muted-foreground mb-4">
              Verificando e atualizando registros no banco de dados. Aguarde...
            </p>
          </div>
        ) : uploadedFile ? (
          <div className="animate-fade-in">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Planilha Carregada com Sucesso!
            </h3>
            <p className="text-muted-foreground mb-2">
              {uploadedFile.name}
            </p>
            {processingResult && (
              <div className="mt-2 mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-sm font-medium">Resultado do processamento:</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-center">
                    <p className="text-xl font-bold text-amber-600">{processingResult.updated}</p>
                    <p className="text-xs text-muted-foreground">registros atualizados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{processingResult.inserted}</p>
                    <p className="text-xs text-muted-foreground">registros inseridos</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Os dados foram importados para o banco de dados. Agora você pode continuar para a próxima etapa.
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Faça o Upload da Planilha CAIP
            </h3>
            <p className="text-muted-foreground mb-4">
              Arraste e solte sua planilha XLSX aqui ou clique para selecionar
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Button asChild className="hover-scale">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Selecionar Arquivo Excel
                </label>
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Formatos suportados: .xlsx, .xls
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
