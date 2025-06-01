
import { ThemeProvider } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { StepContent } from '@/components/StepContent';
import { NavigationButtons } from '@/components/NavigationButtons';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ExportOptions } from '@/components/ExportOptions';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRVRApplication } from '@/hooks/useRVRApplication';
import { PDFHandler } from '@/components/PDFHandler';
import { AppStateHandler } from '@/components/AppStateHandler';

const Index = () => {
  const { data: supabaseData, loading, error, refetch } = useSupabaseData();
  const {
    currentStep,
    uploadedFile,
    selectedItems,
    filteredData,
    results,
    currentParameters,
    isProcessing,
    processedItems,
    setSelectedItems,
    fetchUserProfile,
    handleFileUpload,
    handleFilterChange,
    handleParameterSubmit,
    canProceed,
    nextStep,
    prevStep,
    handleNewEvaluation
  } = useRVRApplication();

  const { handleViewPDF, handleDownloadPDF } = PDFHandler({ 
    results, 
    fetchUserProfile 
  });

  const handleDataLoaded = async () => {
    console.log('Dados carregados, atualizando lista...');
    await refetch();
  };

  const stepLabels = [
    'Upload dos Dados',
    'Seleção de Imóveis', 
    'Parâmetros RVR',
    'Relatório Final'
  ];

  return (
    <AppStateHandler loading={loading} error={error}>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <Header />
          
          <main className="container mx-auto px-4 py-4">
            <div className="mb-6">
              <ProgressIndicator 
                currentStep={currentStep}
                totalSteps={4}
                processedItems={currentStep === 3 && isProcessing ? processedItems : undefined}
                totalItems={currentStep === 3 && isProcessing ? selectedItems.length : undefined}
                isProcessing={isProcessing}
                stepLabels={stepLabels}
              />
            </div>

            <StepContent
              currentStep={currentStep}
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
              onDataLoaded={handleDataLoaded}
              filteredData={filteredData.length > 0 ? filteredData : supabaseData}
              onFilterChange={(filters) => handleFilterChange(filters, supabaseData)}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onParameterSubmit={(parameters) => handleParameterSubmit(parameters, supabaseData)}
              results={results}
              onViewPDF={handleViewPDF}
              onDownloadPDF={handleDownloadPDF}
              currentParameters={currentParameters}
              canProceed={canProceed()}
              onNextStep={nextStep}
              onPrevStep={prevStep}
              onNewEvaluation={handleNewEvaluation}
            />

            {currentStep === 4 && results.length > 0 && (
              <div className="mt-6 flex justify-center">
                <ExportOptions data={results} fileName="relatorio_rvr_completo" />
              </div>
            )}

            <NavigationButtons
              currentStep={currentStep}
              canProceed={canProceed()}
              onNextStep={nextStep}
              onPrevStep={prevStep}
              onNewEvaluation={handleNewEvaluation}
            />
          </main>
        </div>
      </ThemeProvider>
    </AppStateHandler>
  );
};

export default Index;
