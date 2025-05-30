
import { FileUpload } from '@/components/FileUpload';
import { DataFilter } from '@/components/DataFilter';
import { DataTable } from '@/components/DataTable';
import { ParameterForm } from '@/components/ParameterForm';
import { ResultsTable } from '@/components/ResultsTable';
import { DataRow } from '@/hooks/useSupabaseData';

interface StepContentProps {
  currentStep: number;
  uploadedData: any[];
  setUploadedData: (data: any[]) => void;
  filteredData: any[];
  setFilteredData: (data: any[]) => void;
  parameters: any;
  setParameters: (params: any) => void;
  results: any[];
  setResults: (results: any[]) => void;
  supabaseData: DataRow[] | undefined;
  supabaseLoading: boolean;
}

export const StepContent = ({
  currentStep,
  uploadedData,
  setUploadedData,
  filteredData,
  setFilteredData,
  parameters,
  setParameters,
  results,
  setResults,
  supabaseData,
  supabaseLoading
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
              onFileUpload={(file: File) => {/* Handle file upload */}} 
              uploadedFile={null}
              onDataLoaded={() => {/* Handle data loaded */}}
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
            <DataFilter onFilterChange={(filters) => {/* Handle filter change */}} />
            <DataTable 
              data={filteredData} 
              selectedItems={[]}
              onSelectionChange={(items) => {/* Handle selection change */}}
            />
          </div>
        );
      
      case 3:
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
            <ParameterForm 
              onSubmit={(params) => setParameters(params)} 
              selectedData={filteredData}
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
              onViewPDF={(id) => {/* Handle view PDF */}}
              onDownloadPDF={(id) => {/* Handle download PDF */}}
              parametros={parameters}
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
