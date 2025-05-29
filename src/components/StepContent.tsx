
import { FileUpload } from '@/components/FileUpload';
import { DataFilter } from '@/components/DataFilter';
import { DataTable } from '@/components/DataTable';
import { ParameterForm } from '@/components/ParameterForm';
import { ResultsTable } from '@/components/ResultsTable';
import { DataRow } from '@/hooks/useSupabaseData';

interface StepContentProps {
  currentStep: number;
  uploadedFile: File | null;
  onFileUpload: (file: File) => void;
  onDataLoaded?: () => void;
  filteredData: DataRow[];
  onFilterChange: (filters: any) => void;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  onParameterSubmit: (parameters: any) => void;
  results: any[];
  onViewPDF: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  currentParameters: any;
}

export const StepContent = ({
  currentStep,
  uploadedFile,
  onFileUpload,
  onDataLoaded,
  filteredData,
  onFilterChange,
  selectedItems,
  onSelectionChange,
  onParameterSubmit,
  results,
  onViewPDF,
  onDownloadPDF,
  currentParameters
}: StepContentProps) => {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Etapa 1: Upload da Base de Dados CAIP
              </h2>
              <p className="text-muted-foreground">
                Faça o upload da planilha XLSX contendo os dados CAIP que serão importados para o banco de dados
              </p>
            </div>
            <FileUpload 
              onFileUpload={onFileUpload} 
              uploadedFile={uploadedFile}
              onDataLoaded={onDataLoaded}
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Etapa 2: Seleção de Imóveis
              </h2>
              <p className="text-muted-foreground">
                Filtre e selecione os imóveis do banco de dados que serão incluídos no Relatório de Valor Referencial
              </p>
            </div>
            <DataFilter onFilterChange={onFilterChange} />
            <DataTable 
              data={filteredData} 
              selectedItems={selectedItems}
              onSelectionChange={onSelectionChange}
            />
          </div>
        );
      
      case 3:
        const selectedData = filteredData.filter(item => selectedItems.includes(item.id));
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Etapa 3: Parâmetros RVR
              </h2>
              <p className="text-muted-foreground">
                Configure os parâmetros técnicos para geração do Relatório de Valor Referencial
              </p>
            </div>
            <ParameterForm 
              onSubmit={onParameterSubmit} 
              selectedData={selectedData}
            />
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Etapa 4: Relatório RVR
              </h2>
              <p className="text-muted-foreground">
                Visualize os resultados da avaliação e gere os Relatórios de Valor Referencial em PDF
              </p>
            </div>
            <ResultsTable 
              results={results}
              onViewPDF={onViewPDF}
              onDownloadPDF={onDownloadPDF}
              parametros={currentParameters}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      {renderStep()}
    </div>
  );
};
