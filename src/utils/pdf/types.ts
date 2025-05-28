
export interface RVRReportData {
  id: string;
  nome: string;
  categoria: string;
  valorOriginal: number;
  valorAvaliado: number;
  diferenca: number;
  percentual: number;
  areaImovel?: number;
  situacaoImovel?: string;
  unidadeGestora?: string;
  anoCAIP?: string;
  parametros?: {
    cub: number;
    valorM2: number;
    bdi: number;
  };
}

export interface CanvasConfig {
  scale: number;
  useCORS: boolean;
  allowTaint: boolean;
  backgroundColor: string;
  foreignObjectRendering: boolean;
  logging: boolean;
  removeContainer: boolean;
  scrollX: number;
  scrollY: number;
  windowWidth: number;
}

export interface PDFDimensions {
  pdfWidth: number;
  pdfHeight: number;
  margin: number;
  usableWidth: number;
  usableHeight: number;
  scaledWidth: number;
  scaledHeight: number;
}
