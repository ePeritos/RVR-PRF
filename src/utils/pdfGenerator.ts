
import { RVRReportData } from './pdf/types';
import { pdfService } from './pdf/pdfService';

export { copyReportToClipboard } from './pdf/clipboardHelpers';
export type { RVRReportData } from './pdf/types';

export const generatePDF = async (data: RVRReportData): Promise<void> => {
  try {
    console.log('Gerando PDF para:', data.nome);
    await pdfService.generateFromData(data);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};
