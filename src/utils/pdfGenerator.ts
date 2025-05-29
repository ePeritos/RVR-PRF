
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
    
    // Aguarda o elemento estar completamente renderizado com mais tempo
    const element = await waitForElement(elementId, 15000);
    
    console.log('Elemento encontrado, verificando conteúdo...');
    
    // Verifica se o elemento tem conteúdo
    if (!element.innerHTML || element.innerHTML.trim().length === 0) {
      throw new Error('Elemento encontrado mas sem conteúdo');
    }

    console.log('Elemento válido encontrado, dimensões:', {
      width: element.scrollWidth,
      height: element.scrollHeight,
      offsetHeight: element.offsetHeight,
      offsetWidth: element.offsetWidth,
      innerHTML: element.innerHTML.length
    });

    // Prepara elemento para captura com estilos otimizados
    const originalStyles = prepareElementForCapture(element);

    try {
      // Aguarda um pouco mais para garantir que os estilos sejam aplicados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gera o canvas
      const canvas = await generateCanvas(element);
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas gerado está vazio - elemento pode não estar visível');
      }
      
      const imgData = canvasToImageData(canvas);
      
      // Verifica se os dados da imagem estão válidos
      if (imgData === 'data:,' || imgData.length < 100) {
        throw new Error('Dados da imagem estão vazios ou inválidos');
      }
      
      // Cria o PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const dimensions = createPDFDimensions(canvas);
      
      console.log('Dimensões do PDF calculadas:', dimensions);
      
      try {
        // Tenta adicionar em uma página
        addImageToPDF(pdf, imgData, dimensions);
      } catch (error) {
        if (error instanceof Error && error.message === 'NEEDS_PAGINATION') {
          console.log('Conteúdo muito grande, usando múltiplas páginas...');
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
