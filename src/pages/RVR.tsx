import { useState, useEffect } from 'react';

import { StepIndicator } from '@/components/StepIndicator';
import { StepContent } from '@/components/StepContent';
import { NavigationButtons } from '@/components/NavigationButtons';
import { generatePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData, DataRow } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { calculateRossHeidecke } from '@/utils/rossHeideckeCalculator';

const RVR = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, isAdmin } = useProfile();
  const { profile: userProfile, isAdmin: isUserAdmin } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<DataRow[]>([]);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [results, setResults] = useState<any[]>([]);
  const [currentParameters, setCurrentParameters] = useState<any>(null);
  const { toast } = useToast();

  const { data: supabaseData, loading, error, refetch } = useSupabaseData(
    isUserAdmin ? undefined : userProfile?.unidade_gestora
  );

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

  const handleFilterChange = (filters: any) => {
    setCurrentFilters(filters);
    let filtered = supabaseData;
    
    if (filters.anoCAIP && filters.anoCAIP.length > 0) {
      filtered = filtered.filter(item => filters.anoCAIP.includes(item['ano_caip']));
    }
    if (filters.unidadeGestora && filters.unidadeGestora.length > 0) {
      filtered = filtered.filter(item => filters.unidadeGestora.includes(item['unidade_gestora']));
    }
    if (filters.tipoUnidade && filters.tipoUnidade.length > 0) {
      filtered = filtered.filter(item => filters.tipoUnidade.includes(item['tipo_de_unidade']));
    }
    if (filters.nomeUnidade) {
      filtered = filtered.filter(item => 
        item['nome_da_unidade'] && 
        item['nome_da_unidade'].toLowerCase().includes(filters.nomeUnidade.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  };

  const handleParameterSubmit = (parameters: any) => {
    // Process parameters and calculate RVR results
    setCurrentParameters(parameters);
    
    const PARAMETROS_FORMULARIO = {
      valorM2: Number(parameters.valorM2),
      cubM2: Number(parameters.cubM2), 
      bdi: Number(parameters.bdi),
      dataReferencia: parameters.dataReferencia,
      fonteValorTerreno: parameters.fonteValorTerreno,
      responsavelTecnico: parameters.responsavelTecnico,
      padraoConstrutivo: parameters.padraoConstrutivo,
      uf: parameters.uf
    };
    
    const calculatedResults = filteredData
      .filter(item => selectedItems.includes(item.id))
      .map(item => {
        const areaConstruida = Number(item['area_construida_m2']) || 0;
        const areaTerreno = Number(item['area_do_terreno_m2']) || 0;
        const idadeAparente = item['idade_aparente_do_imovel'] ? Number(item['idade_aparente_do_imovel']) : null;
        const vidaUtil = item['vida_util_estimada_anos'] ? Number(item['vida_util_estimada_anos']) : null;
        const estadoConservacao = item['estado_de_conservacao'] || null;
        
        const valorM2 = PARAMETROS_FORMULARIO.valorM2;
        const cubM2 = PARAMETROS_FORMULARIO.cubM2;
        const bdi = PARAMETROS_FORMULARIO.bdi;
        
        const custoRedicao = areaConstruida * cubM2 * (1 + (bdi / 100));
        const valorTerreno = areaTerreno * valorM2;
        
        const idadeParaCalculo = idadeAparente || 15;
        const vidaUtilParaCalculo = vidaUtil || 80;
        const estadoParaCalculo = estadoConservacao || 'REGULAR';
        
        const rossHeideckeResult = calculateRossHeidecke(
          custoRedicao,
          idadeParaCalculo,
          vidaUtilParaCalculo,
          estadoParaCalculo
        );
        
        const valorBenfeitoria = rossHeideckeResult.valorDepreciado;
        const valorTotal = valorTerreno + valorBenfeitoria;
        const fatorLocalizacao = 1.0;
        const valorRvr = valorTotal * fatorLocalizacao;
        
        const valorOriginal = Number(item['rvr']) || 0;
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
          padraoConstrutivo: PARAMETROS_FORMULARIO.padraoConstrutivo,
          idadePercentual: rossHeideckeResult.idadePercentual,
          coeficienteK: rossHeideckeResult.coeficiente,
          zona: item['zona'] || '',
          coordenadas: item['coordenadas'] || '',
          fornecimento_de_agua: item['fornecimento_de_agua'] || '',
          fornecimento_de_energia_eletrica: item['fornecimento_de_energia_eletrica'] || '',
          esgotamento_sanitario: item['esgotamento_sanitario'] || '',
          conexao_de_internet: item['conexao_de_internet'] || '',
          possui_wireless_wifi: item['possui_wireless_wifi'] || '',
          climatizacao_de_ambientes: item['climatizacao_de_ambientes'] || '',
          sala_cofre: item['sala_cofre'] || '',
          protecao_contra_incendios: item['protecao_contra_incendios'] || '',
          protecao_contra_intrusao: item['protecao_contra_intrusao'] || '',
          muro_ou_alambrado: item['muro_ou_alambrado'] || '',
          parametros: {
            ...PARAMETROS_FORMULARIO,
            cub: cubM2,
            cubM2: cubM2
          },
          responsavelTecnico: parameters.responsavelTecnico
        };
      });
    
    setResults(calculatedResults);
    setCurrentStep(3); // Go to results (step 3 now)
  };

  const handleViewPDF = (id: string) => {
    console.log('View RVR PDF for property:', id);
  };

  const handleDownloadPDF = async (id: string) => {
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
    if (currentStep < 3) {
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
      case 1: return selectedItems.length > 0;
      case 2: return true;
      default: return false;
    }
  };

  const handleNewEvaluation = () => {
    setCurrentStep(1);
    setSelectedItems([]);
    setResults([]);
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 text-lg">Erro ao carregar dados: {error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifique se a tabela dados_caip foi criada corretamente no Supabase.
          </p>
        </div>
      </div>
    );
  }

  // Map new step numbers (1,2,3) to old StepContent steps (2,3,4)
  const stepContentMap: Record<number, number> = { 1: 2, 2: 3, 3: 4 };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">RVR - Relatórios de Valor Referencial</h1>
      </div>
      
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
          Geração de Relatórios de Valor Referencial
        </h2>
        <p className="text-sm text-muted-foreground px-2">
          Selecione os parâmetros para gerar relatórios RVR baseados nos dados do CAIP
        </p>
      </div>
      
      <div className="mb-4 px-2 sm:px-0">
        <StepIndicator currentStep={currentStep} totalSteps={3} />
      </div>

      <div className="px-2 sm:px-0 mb-4">
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={3}
          canProceed={canProceed()}
          onNextStep={nextStep}
          onPrevStep={prevStep}
          onNewEvaluation={handleNewEvaluation}
        />
      </div>

      <div className="mb-4 sm:mb-6">
        <StepContent
          currentStep={stepContentMap[currentStep]}
          uploadedFile={null}
          onFileUpload={() => {}}
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
      </div>

      <div className="px-2 sm:px-0">
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={3}
          canProceed={canProceed()}
          onNextStep={nextStep}
          onPrevStep={prevStep}
          onNewEvaluation={handleNewEvaluation}
        />
      </div>
    </div>
  );
};

export default RVR;
