
import { ImageMigrationTool } from '@/components/caip/ImageMigrationTool';
import { Database, Upload } from 'lucide-react';

const ImageMigration = () => {
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 w-full mx-auto max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Migração de Imagens CAIP</h1>
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Upload de Imagens Históricas
        </h2>
        <p className="text-muted-foreground">
          Ferramenta para migrar imagens locais dos imóveis CAIP para o Supabase Storage
        </p>
      </div>

      <ImageMigrationTool />
    </div>
  );
};

export default ImageMigration;
