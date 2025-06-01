
import { useState } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { StepIndicator } from '@/components/StepIndicator';
import { StepContent } from '@/components/StepContent';
import { NavigationButtons } from '@/components/NavigationButtons';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ExportOptions } from '@/components/ExportOptions';
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, DataRow } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useAvaliacoes } from '@/hooks/useAvaliacoes';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedItems, setProcessedItems] = useState(0);
  const { toast } = useToast();

  // Use real Supabase data
  const { data: supabaseData, loading, error, refetch } = useSupabaseData();
  const { salvarAvaliacao } = useAvaliacoes();

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

  const handleParameterSubmit = async (parameters: any) => {
    console.log('Parâmetros recebidos no Index - ANTES dos cálculos:', parameters);
    setCurrentParameters(parameters);
    setIsProcessing(true);
    setProcessedItems(0);
    
    // FORÇAR o uso dos parâmetros exatos do formulário
    const PARAMETROS_FORMULARIO = {
      valorM2: Number(parameters.valorM2),
      cubM2: Number(parameters.cubM2), 
      bdi: Number(parameters.bdi),
      dataReferencia: parameters.dataReferencia,
      fonteValorTerreno: parameters.fonteValorTerreno,
      responsavelTecnico: parameters.responsavelTecnico
    };
    
    console.log('PARÂMETROS FORÇADOS que serão usados nos cálculos:', PARAMETROS_FORMULARIO);
    
    // RVR calculation using real data from dados_caip and Ross-Heidecke
    const selectedData = filteredData.filter(item => selectedItems.includes(item.id));
    const calculatedResults = [];
    
    for (let i = 0; i < selectedData.length; i++) {
      const item = selectedData[i];
      console.log('Processando item:', item.nome_da_unidade);
      
      // Get real data from dados_caip
      const areaConstruida = Number(item['area_construida_m2']) || 0;
      const areaTerreno = Number(item['area_do_terreno_m2']) || 0;
      const idadeAparente = Number(item['idade_aparente_do_imovel']) || 15;
      const vidaUtil = Number(item['vida_util_estimada_anos']) || 80;
      const estadoConservacao = item['estado_de_conservacao'] || 'BOM';
      
      // USAR PARÂMETROS FORÇADOS
      const valorM2 = PARAMETROS_FORMULARIO.valorM2;
      const cubM2 = PARAMETROS_FORMULARIO.cubM2;
      const bdi = PARAMETROS_FORMULARIO.bdi;
      
      console.log('VERIFICAÇÃO - Parâmetros sendo aplicados:', { 
        valorM2, 
        cubM2, 
        bdi,
        areaConstruida,
        areaTerreno
      });
      
      // Cálculos usando os parâmetros FORÇADOS
      const custoRedicao = areaConstruida * cubM2 * (1 + (bdi / 100));
      const valorTerreno = areaTerreno * valorM2;
      
      console.log('Cálculos com parâmetros forçados:', {
        custoRedicao: `${areaConstruida} * ${cubM2} * ${(1 + bdi/100)} = ${custoRedicao}`,
        valorTerreno: `${areaTerreno} * ${valorM2} = ${valorTerreno}`
      });
      
      // Ross-Heidecke depreciation calculation
      const rossHeideckeResult = calculateRossHeidecke(
        custoRedicao,
        idadeAparente,
        vidaUtil,
        estadoConservacao
      );
      
      const valorBenfeitoria = rossHeideckeResult.valorDepreciado;
      const valorTotal = valorTerreno + valorBenfeitoria;
      const fatorLocalizacao = 1.0;
      const valorRvr = valorTotal * fatorLocalizacao;
      
      const valorOriginal = Number(item['rvr']) || 0;
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
        // GARANTIR que os parâmetros corretos sejam passados
        parametros: {
          ...PARAMETROS_FORMULARIO,
          cub: cubM2, // manter compatibilidade
          cubM2: cubM2
        },
        responsavelTecnico: parameters.responsavelTecnico
      };
      
      calculatedResults.push(resultado);
      setProcessedItems(i + 1);
      
      // Simular delay para mostrar progresso
      if (i < selectedData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('TODOS os resultados calculados com parâmetros corretos:', calculatedResults);
    setResults(calculatedResults);
    setIsProcessing(false);
    
    // Salvar no histórico de avaliações
    try {
      await salvarAvaliacao(
        `Avaliação RVR - ${new Date().toLocaleDateString()}`,
        PARAMETROS_FORMULARIO,
        calculatedResults
      );
      
      toast({
        title: "Avaliação Concluída",
        description: "Os resultados foram calculados e salvos no histórico.",
      });
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "Aviso",
        description: "Avaliação concluída, mas não foi possível salvar no histórico.",
        variant: "destructive",
      });
    }
    
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
        
        console.log('DADOS SENDO ENVIADOS PARA O PDF:', {
          resultData: resultData,
          parametros: resultData.parametros,
          valorM2: resultData.parametros?.valorM2,
          cubM2: resultData.parametros?.cubM2,
          bdi: resultData.parametros?.bdi
        });
        
        const reportData = {
          ...resultData,
          responsavelTecnico: profile ? {
            nome: profile.nome_completo,
            cargo: profile.cargo,
            matricula: profile.matricula,
            unidadeLotacao: profile.unidade_lotacao
          } : undefined
        };
        
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
    setProcessedItems(0);
    setIsProcessing(false);
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

  const stepLabels = [
    'Upload dos Dados',
    'Seleção de Imóveis', 
    'Parâmetros RVR',
    'Relatório Final'
  ];

  return (
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

          {/* Opções de exportação na etapa final */}
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
  );
};

export default Index;
