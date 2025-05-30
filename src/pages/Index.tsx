
import { useState } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { StepContent } from '@/components/StepContent';
import { NavigationButtons } from '@/components/NavigationButtons';
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, DataRow } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
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
    
    // Apply nome da unidade filter (partial match, case insensitive)
    if (filters.nomeUnidade) {
      filtered = filtered.filter(item => 
        item['nome_da_unidade'] && 
        item['nome_da_unidade'].toLowerCase().includes(filters.nomeUnidade.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
    console.log('Filters applied:', filters);
    console.log('Filtered data:', filtered);
  };

  const handleParameterSubmit = (parameters: any) => {
    setCurrentParameters(parameters);
    
    // RVR calculation using real data from dados_caip and Ross-Heidecke
    const calculatedResults = filteredData
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        // Get real data from dados_caip
        const areaConstruida = item['area_construida_m2'] || 0;
        const areaTerreno = item['area_do_terreno_m2'] || 0;
        const idadeAparente = parseInt(item['idade_aparente_do_imovel']) || 15;
        const vidaUtil = parseInt(item['vida_util_estimada_anos']) || 80;
        const estadoConservacao = item['estado_de_conservacao'] || 'BOM';
        
        // Benfeitoria calculation using CUB
        const custoRedicao = parameters.cubM2 * areaConstruida * (1 + parameters.bdi / 100);
        
        // Terreno calculation
        const valorTerreno = parameters.valorM2 * areaTerreno;
        
        // Ross-Heidecke depreciation calculation
        import('../utils/rossHeideckeCalculator').then(({ calculateRossHeidecke }) => {
          const depreciacao = calculateRossHeidecke(custoRedicao, idadeAparente, vidaUtil, estadoConservacao);
          return depreciacao;
        });
        
        // Simplified depreciation for immediate calculation (will be replaced by Ross-Heidecke)
        const idadePercentual = (idadeAparente / vidaUtil) * 100;
        let coeficienteK = 0.25; // Default BOM state
        
        if (estadoConservacao.toUpperCase().includes('BOM')) {
          if (idadePercentual <= 20) coeficienteK = 0.13;
          else if (idadePercentual <= 30) coeficienteK = 0.22;
          else if (idadePercentual <= 40) coeficienteK = 0.31;
          else coeficienteK = 0.40;
        }
        
        const valorDepreciacao = custoRedicao * coeficienteK;
        const valorBenfeitoria = custoRedicao - valorDepreciacao;
        
        // Total value calculations
        const valorTotal = valorTerreno + valorBenfeitoria;
        const fatorLocalizacao = 1.0;
        const valorRvr = valorTotal * fatorLocalizacao;
        
        const valorOriginal = item['rvr'] || 0;
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
          custoRedicao,
          taxaDepreciacao: coeficienteK * 100,
          valorDepreciacao,
          valorDepreciado: valorBenfeitoria,
          valorOriginal,
          valorAvaliado: valorRvr,
          diferenca,
          percentual,
          areaImovel: areaConstruida,
          situacaoImovel: item['situacao_do_imovel'] || '',
          unidadeGestora: item['unidade_gestora'],
          anoCAIP: item['ano_caip'],
          endereco: item['endereco'] || '',
          rip: item['rip'] || '',
          matriculaImovel: item['matricula_do_imovel'] || '',
          processoSei: item['processo_sei'] || '',
          estadoConservacao,
          idadeAparente,
          vidaUtil,
          idadePercentual,
          coeficienteK,
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
        
        <main className="container mx-auto px-4 py-4">
          <div className="mb-4">
            <StepIndicator currentStep={currentStep} totalSteps={4} />
          </div>

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
            canProceed={canProceed()}
            onNextStep={nextStep}
            onPrevStep={prevStep}
            onNewEvaluation={handleNewEvaluation}
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
