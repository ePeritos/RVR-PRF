
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
  idadeAparente?: number;
  vidaUtil?: number;
  idadePercentual?: number;
  coeficienteK?: number;
  custoRedicao?: number;
  valorBenfeitoria?: number;
  valorTerreno?: number;
  valorDepreciacao?: number;
  taxaDepreciacao?: number;
  parametros?: {
    cub?: number;
    cubM2?: number;
    valorM2: number;
    bdi: number;
    dataReferencia?: string;
    fonteValorTerreno?: string;
  };
}
