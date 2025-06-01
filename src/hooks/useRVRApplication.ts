
import { useState } from 'react';
import { DataRow } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAvaliacoes } from '@/hooks/useAvaliacoes';
import { supabase } from '@/integrations/supabase/client';
import { calculateRossHeidecke } from '@/utils/rossHeideckeCalculator';

export const useRVRApplication = () => {
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

  const handleFilterChange = (filters: any, supabaseData: DataRow[]) => {
    setCurrentFilters(filters);
    
    let filtered = supabaseData;
    
    if (filters.anoCAIP) {
      filtered = filtered.filter(item => item['ano_caip'] === filters.anoCAIP);
    }
    
    if (filters.unidadeGestora) {
      filtered = filtered.filter(item => item['unidade_gestora'] === filters.unidadeGestora);
    }
    
    if (filters.tipoUnidade) {
      filtered = filtered.filter(item => item['tipo_de_unidade'] === filters.tipoUnidade);
    }
    
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

  const handleParameterSubmit = async (parameters: any, supabaseData: DataRow[]) => {
    console.log('Parâmetros recebidos para processamento:', parameters);
    
    // Validar se os parâmetros essenciais estão presentes
    if (!parameters.valorM2 || !parameters.cubM2 || !parameters.bdi) {
      toast({
        title: "Erro",
        description: "Parâmetros obrigatórios não foram fornecidos. Verifique Valor m², CUB m² e BDI.",
        variant: "destructive",
      });
      return;
    }

    setCurrentParameters(parameters);
    setIsProcessing(true);
    setProcessedItems(0);
    
    const PARAMETROS_FORMULARIO = {
      valorM2: Number(parameters.valorM2),
      cubM2: Number(parameters.cubM2), 
      bdi: Number(parameters.bdi),
      dataReferencia: parameters.dataReferencia,
      fonteValorTerreno: parameters.fonteValorTerreno,
      responsavelTecnico: parameters.responsavelTecnico
    };
    
    console.log('PARÂMETROS VALIDADOS que serão usados nos cálculos:', PARAMETROS_FORMULARIO);
    
    const selectedData = (filteredData.length > 0 ? filteredData : supabaseData).filter(item => selectedItems.includes(item.id));
    
    if (selectedData.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum imóvel foi selecionado para avaliação.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const calculatedResults = [];
    
    try {
      for (let i = 0; i < selectedData.length; i++) {
        const item = selectedData[i];
        console.log('Processando item:', item.nome_da_unidade);
        
        const areaConstruida = Number(item['area_construida_m2']) || 0;
        const areaTerreno = Number(item['area_do_terreno_m2']) || 0;
        const idadeAparente = Number(item['idade_aparente_do_imovel']) || 15;
        const vidaUtil = Number(item['vida_util_estimada_anos']) || 80;
        const estadoConservacao = item['estado_de_conservacao'] || 'BOM';
        
        const valorM2 = PARAMETROS_FORMULARIO.valorM2;
        const cubM2 = PARAMETROS_FORMULARIO.cubM2;
        const bdi = PARAMETROS_FORMULARIO.bdi;
        
        console.log('Aplicando parâmetros:', { 
          valorM2, 
          cubM2, 
          bdi,
          areaConstruida,
          areaTerreno
        });
        
        const custoRedicao = areaConstruida * cubM2 * (1 + (bdi / 100));
        const valorTerreno = areaTerreno * valorM2;
        
        console.log('Cálculos intermediários:', {
          custoRedicao: `${areaConstruida} * ${cubM2} * ${(1 + bdi/100)} = ${custoRedicao}`,
          valorTerreno: `${areaTerreno} * ${valorM2} = ${valorTerreno}`
        });
        
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
          parametros: {
            ...PARAMETROS_FORMULARIO,
            cub: cubM2,
            cubM2: cubM2
          },
          responsavelTecnico: parameters.responsavelTecnico
        };
        
        calculatedResults.push(resultado);
        setProcessedItems(i + 1);
        
        if (i < selectedData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('RESULTADOS calculados com sucesso:', calculatedResults);
      setResults(calculatedResults);
      
      // Salvar avaliação no histórico
      try {
        await salvarAvaliacao(
          `Avaliação RVR - ${new Date().toLocaleDateString()}`,
          PARAMETROS_FORMULARIO,
          calculatedResults,
          calculatedResults.length,
          calculatedResults.reduce((sum, result) => sum + result.valorAvaliado, 0)
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
      
      setIsProcessing(false);
      // Só avança para a etapa 4 após sucesso completo
      setCurrentStep(4);
      
    } catch (error) {
      console.error('Erro durante o processamento:', error);
      setIsProcessing(false);
      toast({
        title: "Erro",
        description: "Erro durante o processamento dos dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return selectedItems.length > 0;
      case 3: return false; // Etapa 3 só avança através do formulário
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNewEvaluation = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setSelectedItems([]);
    setResults([]);
    setCurrentParameters(null);
    setProcessedItems(0);
    setIsProcessing(false);
  };

  return {
    currentStep,
    uploadedFile,
    selectedItems,
    filteredData,
    currentFilters,
    results,
    currentParameters,
    isProcessing,
    processedItems,
    setSelectedItems,
    setFilteredData,
    fetchUserProfile,
    handleFileUpload,
    handleFilterChange,
    handleParameterSubmit,
    canProceed,
    nextStep,
    prevStep,
    handleNewEvaluation
  };
};
