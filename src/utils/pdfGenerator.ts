
import { pdfService } from './pdf/pdfService';

export { copyReportToClipboard } from './pdf/clipboardHelpers';

// Interface para compatibilidade
export interface RVRReportData {
  id: string;
  nome: string;
  categoria: string;
  valorOriginal: number;
  valorAvaliado: number;
  diferenca: number;
  percentual: number;
  areaImovel?: number;
  areaConstruida?: number;
  areaTerreno?: number;
  situacaoImovel?: string;
  unidadeGestora?: string;
  anoCAIP?: string;
  endereco?: string;
  rip?: string;
  matriculaImovel?: string;
  parametros?: {
    cub?: number;
    cubM2?: number;
    valorM2: number;
    bdi: number;
    dataReferencia?: string;
    fonteValorTerreno?: string;
    padraoConstrutivo?: string;
    responsavelTecnico?: {
      id: string;
      nome_completo: string;
      numero_registro: string;
      conselho: string;
      formacao: string;
      uf: string;
    };
  };
  responsavelTecnico?: {
    id: string;
    nome_completo: string;
    numero_registro: string;
    conselho: string;
    formacao: string;
    uf: string;
  };
  idadeAparente?: number;
  vidaUtil?: number;
  estadoConservacao?: string;
}

export const generatePDF = async (data: any): Promise<void> => {
  try {
    console.log('Gerando PDF para:', data.nome);
    await pdfService.generateFromData(data);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};
