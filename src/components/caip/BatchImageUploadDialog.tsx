import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, SkipForward, AlertTriangle, X, FileImage } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BatchImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadResults {
  uploaded: string[];
  skipped: string[];
  errors: { file: string; error: string }[];
}

const BATCH_SIZE = 20; // Files per request

export const BatchImageUploadDialog = ({ open, onOpenChange }: BatchImageUploadDialogProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResults | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter(f => 
      f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.jpg') || f.name.toLowerCase().endsWith('.jpeg') || f.name.toLowerCase().endsWith('.png')
    );
    setFiles(imageFiles);
    setResults(null);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(0);

    const allResults: UploadResults = { uploaded: [], skipped: [], errors: [] };
    const totalBatches = Math.ceil(files.length / BATCH_SIZE);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Erro", description: "Sessão expirada. Faça login novamente.", variant: "destructive" });
      setIsUploading(false);
      return;
    }

    for (let i = 0; i < totalBatches; i++) {
      const batch = files.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const formData = new FormData();
      batch.forEach(file => formData.append('files', file));

      try {
        const res = await fetch(
          `https://sbefwlhezngkwsxybrsj.supabase.co/functions/v1/batch-upload-images`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData,
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          batch.forEach(f => allResults.errors.push({ file: f.name, error: errText }));
        } else {
          const batchResult: UploadResults = await res.json();
          allResults.uploaded.push(...batchResult.uploaded);
          allResults.skipped.push(...batchResult.skipped);
          allResults.errors.push(...batchResult.errors);
        }
      } catch (err) {
        batch.forEach(f => allResults.errors.push({ file: f.name, error: String(err) }));
      }

      setProgress(Math.round(((i + 1) / totalBatches) * 100));
    }

    setResults(allResults);
    setIsUploading(false);

    toast({
      title: "Upload concluído",
      description: `${allResults.uploaded.length} enviadas, ${allResults.skipped.length} já existiam, ${allResults.errors.length} erros.`,
    });
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      setResults(null);
      setProgress(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload em Lote de Imagens CAIP
          </DialogTitle>
          <DialogDescription>
            Envie as imagens do sistema legado. Imagens que já existem no sistema novo <strong>não serão sobrescritas</strong>.
            Os arquivos devem seguir o padrão de nomenclatura do CAIP (ex: <code>id.Imagem Fachada.123456.jpg</code>).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File selector */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <FileImage className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <label className="cursor-pointer">
              <span className="text-sm text-primary font-medium hover:underline">
                Clique para selecionar imagens
              </span>
              <input
                type="file"
                multiple
                accept="image/*,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Selecione múltiplos arquivos de imagem (.jpg, .png)
            </p>
          </div>

          {/* Selected files info */}
          {files.length > 0 && !results && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-foreground">
                <strong>{files.length}</strong> imagens selecionadas
              </span>
              <Button onClick={handleUpload} disabled={isUploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {isUploading ? 'Enviando...' : 'Iniciar Upload'}
              </Button>
            </div>
          )}

          {/* Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso do upload</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Resultado do Upload</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">{results.uploaded.length}</p>
                    <p className="text-xs text-green-600 dark:text-green-500">Enviadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <SkipForward className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{results.skipped.length}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500">Já existiam</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">{results.errors.length}</p>
                    <p className="text-xs text-red-600 dark:text-red-500">Erros</p>
                  </div>
                </div>
              </div>

              {/* Error details */}
              {results.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-border rounded p-2 space-y-1">
                  <p className="text-xs font-medium text-destructive">Detalhes dos erros:</p>
                  {results.errors.slice(0, 50).map((e, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      <span className="font-medium">{e.file}</span>: {e.error}
                    </p>
                  ))}
                  {results.errors.length > 50 && (
                    <p className="text-xs text-muted-foreground">...e mais {results.errors.length - 50} erros</p>
                  )}
                </div>
              )}

              <Button onClick={handleClose} variant="outline" className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
