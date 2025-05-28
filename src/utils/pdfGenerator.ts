
import jsPDF from 'jspdf';
import { RVRReportData } from './pdf/types';
import { waitForElement, prepareElementForCapture, restoreElementStyles } from './pdf/domHelpers';
import { generateCanvas, canvasToImageData } from './pdf/canvasHelpers';
import { createPDFDimensions, addImageToPDF, addMultiPageImageToPDF, generateFileName } from './pdf/pdfHelpers';

export { copyReportToClipboard } from './pdf/clipboardHelpers';
export type { RVRReportData } from './pdf/types';

export const generatePDF = async (data: RVRReportData): Promise<void> => {
  const elementId = `rvr-report-${data.id}`;
  
  try {
    console.log('Iniciando geração do PDF para elemento:', elementId);
    
    // Aguarda o elemento estar completamente renderizado
    const element = await waitForElement(elementId);
    
    console.log('Elemento encontrado, dimensões:', {
      width: element.scrollWidth,
      height: element.scrollHeight,
      offsetHeight: element.offsetHeight,
      offsetWidth: element.offsetWidth
    });

    // Prepara elemento para captura
    const originalStyles = prepareElementForCapture(element);

    try {
      // Gera o canvas
      const canvas = await generateCanvas(element);
      const imgData = canvasToImageData(canvas);
      
      // Cria o PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const dimensions = createPDFDimensions(canvas);
      
      console.log('Dimensões do PDF:', dimensions);
      
      try {
        // Tenta adicionar em uma página
        addImageToPDF(pdf, imgData, dimensions);
      } catch (error) {
        if (error instanceof Error && error.message === 'NEEDS_PAGINATION') {
          // Se não cabe, usa múltiplas páginas
          addMultiPageImageToPDF(pdf, canvas, imgData, dimensions);
        } else {
          throw error;
        }
      }
      
      console.log('PDF gerado com sucesso');
      
      const fileName = generateFileName(data.nome);
      pdf.save(fileName);
      
      console.log('PDF salvo com sucesso:', fileName);
    } finally {
      // Restaura estilos originais
      restoreElementStyles(element, originalStyles);
    }
  } catch (error) {
    console.error('Erro detalhado ao gerar PDF:', error);
    throw error;
  }
};
