
import { FileUpload } from '@/components/FileUpload';
import { DataFilter } from '@/components/DataFilter';
import { DataTable } from '@/components/DataTable';
import { EnhancedParameterForm } from '@/components/EnhancedParameterForm';
import { ResultsTable } from '@/components/ResultsTable';
import { DataRow } from '@/hooks/useSupabaseData';
import { NavigationButtons } from '@/components/NavigationButtons';

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
  canProceed: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onNewEvaluation: () => void;
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
  currentParameters,
  canProceed,
  onNextStep,
  onPrevStep,
  onNewEvaluation
}: StepContentProps) => {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Etapa 1: Upload da Base de Dados CAIP
              </h2>
              <p className="text-sm text-muted-foreground">
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
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Etapa 2: Seleção de Imóveis
              </h2>
              <p className="text-sm text-muted-foreground">
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
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Etapa 3: Parâmetros RVR
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure os parâmetros técnicos para geração do Relatório de Valor Referencial
              </p>
            </div>
            <EnhancedParameterForm 
              onParametersChange={onParameterSubmit}
              initialParameters={currentParameters}
            />
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-foreground mb-1">
                Etapa 4: Relatório RVR
              </h2>
              <p className="text-sm text-muted-foreground">
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
      {/* Botões de navegação no topo */}
      <div className="mb-4">
        <NavigationButtons
          currentStep={currentStep}
          canProceed={canProceed}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          onNewEvaluation={onNewEvaluation}
        />
      </div>

      {/* Conteúdo da etapa */}
      {renderStep()}
    </div>
  );
};
