
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { StepContent } from '@/components/StepContent';
import { NavigationButtons } from '@/components/NavigationButtons';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { ResponsaveisTecnicos } from '@/components/ResponsaveisTecnicos';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [parameters, setParameters] = useState({
    cub: 2100,
    valorM2: 150,
    bdi: 25
  });
  const [results, setResults] = useState<any[]>([]);

  const { data: supabaseData, loading: supabaseLoading } = useSupabaseData();

  const steps = [
    'Upload de Arquivo',
    'Filtros e Seleção',
    'Parâmetros',
    'Resultados',
    'Responsáveis Técnicos'
  ];

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return filteredData.length > 0 || uploadedData.length > 0;
      case 2:
        return filteredData.length > 0;
      case 3:
        return parameters.cub > 0 && parameters.valorM2 > 0 && parameters.bdi > 0;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canGoPrevious = () => {
    return currentStep > 1;
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <StepIndicator 
            currentStep={currentStep} 
            onStepClick={setCurrentStep}
          />
          
          <div className="mt-8">
            <StepContent
              currentStep={currentStep}
              uploadedData={uploadedData}
              setUploadedData={setUploadedData}
              filteredData={filteredData}
              setFilteredData={setFilteredData}
              parameters={parameters}
              setParameters={setParameters}
              results={results}
              setResults={setResults}
              supabaseData={supabaseData}
              supabaseLoading={supabaseLoading}
            />
          </div>

          {/* Mostrar Responsáveis Técnicos apenas no step 5 */}
          {currentStep === 5 && (
            <div className="mt-8">
              <ResponsaveisTecnicos />
            </div>
          )}
          
          <NavigationButtons
            currentStep={currentStep}
            canGoNext={canGoNext()}
            canGoPrevious={canGoPrevious()}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
