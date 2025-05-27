
import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
}

export function FileUpload({ onFileUpload, uploadedFile }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

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
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
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
        {uploadedFile ? (
          <div className="animate-fade-in">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Arquivo Carregado com Sucesso!
            </h3>
            <p className="text-muted-foreground mb-4">
              {uploadedFile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Agora você pode continuar para a próxima etapa.
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-16 w-16 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Faça o Upload da Planilha
            </h3>
            <p className="text-muted-foreground mb-4">
              Arraste e solte sua planilha aqui ou clique para selecionar
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Button asChild className="hover-scale">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Selecionar Arquivo
                </label>
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Formatos suportados: .xlsx, .xls, .csv
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
