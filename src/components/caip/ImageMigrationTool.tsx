
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, AlertCircle, CheckCircle, X, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploadService } from '@/utils/imageUpload';
import { supabase } from '@/integrations/supabase/client';

interface UploadProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
  success: string[];
}

export const ImageMigrationTool = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    total: 0,
    completed: 0,
    current: '',
    errors: [],
    success: []
  });
  const { toast } = useToast();

  const parseFileName = (fileName: string) => {
    // Exemplos de padrões suportados:
    // "ID123_geral.jpg" -> { idCaip: "123", tipoImagem: "geral" }
    // "456_fachada.png" -> { idCaip: "456", tipoImagem: "fachada" }
    // "ID789_lateral_1.jpg" -> { idCaip: "789", tipoImagem: "lateral_1" }
    
    const name = fileName.toLowerCase().replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    
    // Padrão: ID123_tipo ou 123_tipo
    const match = name.match(/^(?:id)?(\d+)_(.+)$/);
    
    if (!match) {
      return null;
    }
    
    const idCaip = match[1];
    const tipoImagem = match[2];
    
    // Mapear tipos de imagem para campos da tabela
    const tipoMap: { [key: string]: string } = {
      'geral': 'imagem_geral',
      'fachada': 'imagem_fachada',
      'lateral_1': 'imagem_lateral_1',
      'lateral1': 'imagem_lateral_1',
      'lateral_2': 'imagem_lateral_2',
      'lateral2': 'imagem_lateral_2',
      'fundos': 'imagem_fundos',
      'sala_cofre': 'imagem_sala_cofre',
      'cofre': 'imagem_cofre',
      'alojamento_masculino': 'imagem_interna_alojamento_masculino',
      'alojamento_feminino': 'imagem_interna_alojamento_feminino',
      'plantao_uop': 'imagem_interna_plantao_uop'
    };
    
    const campoImagem = tipoMap[tipoImagem];
    
    if (!campoImagem) {
      return null;
    }
    
    return { idCaip, campoImagem, tipoImagem };
  };

  const validateFiles = (fileList: FileList) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} - não é uma imagem`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} - maior que 5MB`);
        return;
      }
      
      const parsed = parseFileName(file.name);
      if (!parsed) {
        invalidFiles.push(`${file.name} - nome não segue o padrão ID123_tipo.jpg`);
        return;
      }
      
      validFiles.push(file);
    });
    
    return { validFiles, invalidFiles };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const { validFiles, invalidFiles } = validateFiles(selectedFiles);
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Arquivos inválidos encontrados",
        description: `${invalidFiles.length} arquivos não seguem o padrão. Verifique os nomes.`,
        variant: "destructive",
      });
      
      setProgress(prev => ({
        ...prev,
        errors: invalidFiles
      }));
    }
    
    if (validFiles.length > 0) {
      // Criar novo FileList apenas com arquivos válidos
      const dt = new DataTransfer();
      validFiles.forEach(file => dt.items.add(file));
      setFiles(dt.files);
      
      toast({
        title: "Arquivos validados",
        description: `${validFiles.length} arquivos prontos para upload.`,
      });
    }
  };

  const uploadImages = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione as imagens primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setProgress({
      total: files.length,
      completed: 0,
      current: '',
      errors: [],
      success: []
    });
    
    console.log(`Iniciando upload de ${files.length} imagens...`);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const parsed = parseFileName(file.name);
      
      if (!parsed) {
        console.log(`Arquivo ignorado: ${file.name}`);
        continue;
      }
      
      setProgress(prev => ({
        ...prev,
        current: `Processando ${file.name}...`,
        completed: i
      }));
      
      try {
        console.log(`Processando: ${file.name} -> ID CAIP ${parsed.idCaip}, Campo: ${parsed.campoImagem}`);
        
        // 1. Verificar se o registro CAIP existe
        const { data: caipData, error: caipError } = await supabase
          .from('dados_caip')
          .select('id, nome_da_unidade')
          .eq('id_caip', parsed.idCaip)
          .single();
        
        if (caipError || !caipData) {
          const errorMsg = `ID CAIP ${parsed.idCaip} não encontrado na base de dados`;
          console.error(errorMsg);
          setProgress(prev => ({
            ...prev,
            errors: [...prev.errors, `${file.name}: ${errorMsg}`]
          }));
          continue;
        }
        
        console.log(`✅ Registro CAIP encontrado: ${caipData.nome_da_unidade}`);
        
        // 2. Upload da imagem
        const uploadedUrl = await ImageUploadService.uploadImage(
          file, 
          `imovel-${caipData.id}/historico`
        );
        
        if (!uploadedUrl) {
          const errorMsg = `Falha no upload da imagem`;
          console.error(errorMsg);
          setProgress(prev => ({
            ...prev,
            errors: [...prev.errors, `${file.name}: ${errorMsg}`]
          }));
          continue;
        }
        
        console.log(`✅ Upload concluído: ${uploadedUrl}`);
        
        // 3. Atualizar registro na base
        const { error: updateError } = await supabase
          .from('dados_caip')
          .update({ [parsed.campoImagem]: uploadedUrl })
          .eq('id', caipData.id);
        
        if (updateError) {
          console.error('Erro ao atualizar registro:', updateError);
          setProgress(prev => ({
            ...prev,
            errors: [...prev.errors, `${file.name}: Erro ao atualizar base de dados`]
          }));
          continue;
        }
        
        console.log(`✅ Base de dados atualizada para ${caipData.nome_da_unidade}`);
        
        setProgress(prev => ({
          ...prev,
          success: [...prev.success, `${file.name} -> ${caipData.nome_da_unidade} (${parsed.tipoImagem})`]
        }));
        
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        setProgress(prev => ({
          ...prev,
          errors: [...prev.errors, `${file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]
        }));
      }
    }
    
    setProgress(prev => ({ ...prev, completed: files.length, current: 'Concluído!' }));
    setIsUploading(false);
    
    toast({
      title: "Upload concluído",
      description: `${progress.success.length} imagens enviadas com sucesso, ${progress.errors.length} erros.`,
    });
  };

  const resetUpload = () => {
    setFiles(null);
    setProgress({
      total: 0,
      completed: 0,
      current: '',
      errors: [],
      success: []
    });
    
    // Limpar input
    const input = document.getElementById('image-files') as HTMLInputElement;
    if (input) input.value = '';
  };

  const progressPercentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Migração de Imagens CAIP
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload em lote de imagens históricas organizadas por ID CAIP
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Padrão de nomenclatura:</strong> ID123_tipo.jpg<br/>
            <strong>Tipos aceitos:</strong> geral, fachada, lateral_1, lateral_2, fundos, sala_cofre, cofre, alojamento_masculino, alojamento_feminino, plantao_uop<br/>
            <strong>Exemplo:</strong> ID123_geral.jpg, 456_fachada.png, ID789_lateral_1.jpg
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image-files">Selecionar imagens (máximo 5MB cada)</Label>
            <Input
              id="image-files"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="mt-1"
            />
          </div>

          {files && files.length > 0 && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                {files.length} arquivos selecionados
              </p>
              <div className="text-xs text-muted-foreground">
                {Array.from(files).slice(0, 5).map((file, idx) => (
                  <div key={idx}>{file.name}</div>
                ))}
                {files.length > 5 && <div>... e mais {files.length - 5} arquivos</div>}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={uploadImages}
              disabled={!files || files.length === 0 || isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Enviando...' : 'Iniciar Upload'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetUpload}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {(isUploading || progress.completed > 0) && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{progress.completed}/{progress.total} ({progressPercentage}%)</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            {progress.current && (
              <p className="text-sm text-muted-foreground">{progress.current}</p>
            )}
          </div>
        )}

        {progress.success.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Sucessos ({progress.success.length})
            </h4>
            <div className="bg-green-50 p-3 rounded-md max-h-32 overflow-y-auto">
              {progress.success.map((msg, idx) => (
                <div key={idx} className="text-xs text-green-700">{msg}</div>
              ))}
            </div>
          </div>
        )}

        {progress.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Erros ({progress.errors.length})
            </h4>
            <div className="bg-red-50 p-3 rounded-md max-h-32 overflow-y-auto">
              {progress.errors.map((error, idx) => (
                <div key={idx} className="text-xs text-red-700">{error}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
