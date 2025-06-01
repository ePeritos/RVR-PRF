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
import { supabase } from '@/integrations/supabase/client';
import { calculateRossHeidecke } from '@/utils/rossHeideckeCalculator';

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

  const fetchUserProfile = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

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
    console.log('Parâmetros recebidos no Index:', parameters);
    setCurrentParameters(parameters);
    
    // RVR calculation using real data from dados_caip and Ross-Heidecke
    const calculatedResults = filteredData
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        console.log('Processando item:', item.nome_da_unidade, item);
        
        // Get real data from dados_caip
        const areaConstruida = item['area_construida_m2'] || 0;
        const areaTerreno = item['area_do_terreno_m2'] || 0;
        const idadeAparente = item['idade_aparente_do_imovel'] || 15;
        const vidaUtil = item['vida_util_estimada_anos'] || 80;
        const estadoConservacao = item['estado_de_conservacao'] || 'BOM';
        
        console.log('Dados do item:', {
          areaConstruida,
          areaTerreno,
          idadeAparente,
          vidaUtil,
          estadoConservacao
        });
        
        // Use parameters from form for calculations - GARANTINDO que os valores do formulário sejam usados
        const valorM2 = parameters.valorM2;
        const cubM2 = parameters.cubM2;
        const bdi = parameters.bdi;
        
        console.log('Parâmetros sendo usados nos cálculos:', { 
          valorM2: valorM2,
          cubM2: cubM2, 
          bdi: bdi,
          dataReferencia: parameters.dataReferencia,
          fonteValorTerreno: parameters.fonteValorTerreno
        });
        
        // Benfeitoria calculation using CUB from form
        const custoRedicao = cubM2 * areaConstruida * (1 + bdi / 100);
        
        // Terreno calculation using valor from form
        const valorTerreno = valorM2 * areaTerreno;
        
        console.log('Cálculos intermediários:', {
          custoRedicao,
          valorTerreno
        });
        
        // Ross-Heidecke depreciation calculation using real data
        const rossHeideckeResult = calculateRossHeidecke(
          custoRedicao,
          idadeAparente,
          vidaUtil,
          estadoConservacao
        );
        
        const valorBenfeitoria = rossHeideckeResult.valorDepreciado;
        
        // Total value calculations
        const valorTotal = valorTerreno + valorBenfeitoria;
        const fatorLocalizacao = 1.0;
        const valorRvr = valorTotal * fatorLocalizacao;
        
        const valorOriginal = item['rvr'] || 0;
        const diferenca = valorRvr - valorOriginal;
        const percentual = valorOriginal ? (diferenca / valorOriginal) * 100 : 0;
        
        const resultado = {
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
          taxaDepreciacao: rossHeideckeResult.coeficiente * 100,
          valorDepreciacao: rossHeideckeResult.depreciacao,
          valorDepreciado: rossHeideckeResult.valorDepreciado,
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
          idadePercentual: rossHeideckeResult.idadePercentual,
          coeficienteK: rossHeideckeResult.coeficiente,
          parametros: {
            cub: cubM2,
            valorM2: valorM2,
            bdi: bdi,
            cubM2: cubM2,
            dataReferencia: parameters.dataReferencia,
            fonteValorTerreno: parameters.fonteValorTerreno,
            responsavelTecnico: parameters.responsavelTecnico
          },
          responsavelTecnico: parameters.responsavelTecnico
        };
        
        console.log('Resultado calculado com parâmetros corretos:', resultado);
        console.log('Verificação - CUB usado:', cubM2, 'Valor M2 usado:', valorM2, 'BDI usado:', bdi);
        return resultado;
      });
    
    console.log('Todos os resultados calculados:', calculatedResults);
    setResults(calculatedResults);
    setCurrentStep(4);
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
        const profile = await fetchUserProfile();
        
        const reportData = {
          ...resultData,
          responsavelTecnico: profile ? {
            nome: profile.nome_completo,
            cargo: profile.cargo,
            matricula: profile.matricula,
            unidadeLotacao: profile.unidade_lotacao
          } : undefined
        };
        
        console.log('Dados sendo enviados para o PDF:', reportData);
        await generatePDF(reportData);
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
