import { useState } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { StepContent } from '@/components/StepContent';
import { NavigationButtons } from '@/components/NavigationButtons';
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, DataRow } from '@/hooks/useSupabaseData';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [results, setResults] = useState<any[]>([]);
  const [currentParameters, setCurrentParameters] = useState<any>(null);
  const { toast } = useToast();

  // Use real Supabase data
  const { data: supabaseData, loading, error, refetch } = useSupabaseData();

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    console.log('File uploaded:', file.name);
  };

  const handleDataLoaded = async () => {
    console.log('Dados carregados, atualizando lista...');
    await refetch();
  };

  const handleFilterChange = (filters: any) => {
    setCurrentFilters(filters);
    
    let filtered = supabaseData;
    
    // Apply filters sequentially
    if (filters.anoCAIP) {
      filtered = filtered.filter(item => item['ano_caip'] === filters.anoCAIP);
    }
    
    if (filters.unidadeGestora) {
      filtered = filtered.filter(item => item['unidade_gestora'] === filters.unidadeGestora);
    }
    
    if (filters.tipoUnidade) {
      filtered = filtered.filter(item => item['tipo_de_unidade'] === filters.tipoUnidade);
    }
    
    setFilteredData(filtered);
    console.log('Filters applied:', filters);
    console.log('Filtered data:', filtered);
  };

  const handleParameterSubmit = (parameters: any) => {
    setCurrentParameters(parameters);
    
    // RVR calculation - using real estate evaluation parameters
    const calculatedResults = filteredData
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        // Area calculations
        const areaConstruida = item['area_construida_m2'] || 0;
        const areaTerreno = item['area_do_terreno_m2'] || 0;
        
        // Benfeitoria calculation using CUB
        const valorBenfeitoria = parameters.cubM2 * areaConstruida;
        
        // Terreno calculation
        const valorTerreno = parameters.valorM2 * areaTerreno;
        
        // Total value before depreciation
        const valorTotal = valorBenfeitoria + valorTerreno;
        
        // Depreciation calculation (assuming 2% per year based on building age)
        const idadeAparente = parseInt(item['idade_aparente_do_imovel']) || 0;
        const taxaDepreciacao = Math.min(idadeAparente * 0.02, 0.6); // Max 60% depreciation
        const valorDepreciacao = valorBenfeitoria * taxaDepreciacao;
        
        // Final RVR calculation
        const fatorLocalizacao = 1.1;
        const fatorMercado = 1.05;
        const valorDepreciado = valorTotal - valorDepreciacao;
        const valorRvr = valorDepreciado * fatorLocalizacao * fatorMercado * (1 + parameters.bdi / 100);
        
        // Since we don't have previous RVR value in the new structure, we'll use 0 as baseline
        const valorOriginal = 0;
        const diferenca = valorRvr - valorOriginal;
        const percentual = valorOriginal ? (diferenca / valorOriginal) * 100 : 0;
        
        return {
          id: item.id,
          nome: item['nome_da_unidade'] || 'Nome não informado',
          tipo: item['tipo_de_unidade'] || 'Tipo não informado',
          categoria: item['tipo_de_unidade'],
          areaConstruida,
          areaTerreno,
          valorBenfeitoria,
          valorTerreno,
          valorTotal,
          taxaDepreciacao: taxaDepreciacao * 100, // Convert to percentage
          valorDepreciacao,
          valorDepreciado,
          valorOriginal,
          valorAvaliado: valorRvr,
          diferenca,
          percentual,
          areaImovel: areaConstruida,
          situacaoImovel: item['situacao_do_imovel'] || '',
          unidadeGestora: item['unidade_gestora'],
          anoCAIP: item['ano_caip'],
          parametros: parameters
        };
      });
    
    setResults(calculatedResults);
    setCurrentStep(4);
    console.log('RVR Parameters submitted:', parameters);
  };

  const handleViewPDF = (id: string) => {
    console.log('View RVR PDF for property:', id);
    // In real app, this would open RVR PDF viewer
  };

  const handleDownloadPDF = async (id: string) => {
    console.log('Download RVR PDF for property:', id);
    
    try {
      const resultData = results.find(result => result.id === id);
      if (resultData) {
        await generatePDF(resultData);
        toast({
          title: "PDF Gerado",
          description: "O relatório RVR foi baixado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true; // Always allow proceeding from step 1
      case 2: return selectedItems.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleNewEvaluation = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setSelectedItems([]);
    setResults([]);
  };

  // Show loading state
  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Carregando dados...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Show error state
  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg">Erro ao carregar dados: {error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifique se a tabela dados_caip foi criada corretamente no Supabase.
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <StepIndicator currentStep={currentStep} totalSteps={4} />

          <StepContent
            currentStep={currentStep}
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            onDataLoaded={handleDataLoaded}
            filteredData={filteredData.length > 0 ? filteredData : supabaseData}
            onFilterChange={handleFilterChange}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onParameterSubmit={handleParameterSubmit}
            results={results}
            onViewPDF={handleViewPDF}
            onDownloadPDF={handleDownloadPDF}
            currentParameters={currentParameters}
          />

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
  );
};

export default Index;
