
export interface PDFDimensions {
  pdfWidth: number;
  pdfHeight: number;
  margin: number;
  usableWidth: number;
  usableHeight: number;
  scaledWidth: number;
  scaledHeight: number;
}

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
  processoSei?: string;
  estadoConservacao?: string;
  idadeAparente?: number | null;
  vidaUtil?: number | null;
  padraoConstrutivo?: string;
  idadePercentual?: number;
  coeficienteK?: number;
  custoRedicao?: number;
  valorBenfeitoria?: number;
  valorTerreno?: number;
  valorTotal?: number;
  valorDepreciacao?: number;
  taxaDepreciacao?: number;
  responsavelTecnico?: {
    nome_completo: string;
    cargo: string;
    matricula: string;
    unidade_lotacao: string;
  };
  parametros?: {
    cub?: number;
    cubM2?: number;
    valorM2: number;
    bdi: number;
    dataReferencia?: string;
    fonteValorTerreno?: string;
    padraoConstrutivo?: string;
    uf?: string;
    responsavelTecnico?: {
      id: string;
      nome_completo: string;
      numero_registro: string;
      conselho: string;
      formacao: string;
      uf: string;
    };
  };
}
