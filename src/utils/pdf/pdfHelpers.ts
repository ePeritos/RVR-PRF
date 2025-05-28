
import jsPDF from 'jspdf';
import { PDFDimensions } from './types';

export const createPDFDimensions = (canvas: HTMLCanvasElement): PDFDimensions => {
  // Dimensões A4 em mm com margens maiores para evitar corte
  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 15; // Margem aumentada para evitar corte
  const usableWidth = pdfWidth - (margin * 2);
  const usableHeight = pdfHeight - (margin * 2);
  
  // Calcula proporções com margem de segurança
  const canvasAspectRatio = canvas.height / canvas.width;
  const scaledWidth = usableWidth * 0.95; // 95% da largura disponível
  const scaledHeight = scaledWidth * canvasAspectRatio;

  return {
    pdfWidth,
    pdfHeight,
    margin,
    usableWidth,
    usableHeight,
    scaledWidth,
    scaledHeight
  };
};

export const addImageToPDF = (
  pdf: jsPDF, 
  imgData: string, 
  dimensions: PDFDimensions
): void => {
  const { margin, scaledWidth, scaledHeight, usableHeight } = dimensions;
  
  // Se o conteúdo cabe em uma página com margem de segurança
  if (scaledHeight <= usableHeight * 0.95) {
    const centerX = margin + (dimensions.usableWidth - scaledWidth) / 2;
    const centerY = margin + 5; // Pequeno offset do topo
    
    pdf.addImage(
      imgData, 
      'PNG', 
      centerX, 
      centerY, 
      scaledWidth, 
      scaledHeight,
      undefined,
      'FAST'
    );
  } else {
    // Lança erro para indicar que precisa de paginação
    throw new Error('NEEDS_PAGINATION');
  }
};

export const addMultiPageImageToPDF = (
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  imgData: string,
  dimensions: PDFDimensions
): void => {
  const { margin, scaledWidth, scaledHeight, usableHeight } = dimensions;
  
  // Calcula altura útil por página com margem de segurança
  const pageContentHeight = usableHeight * 0.9; // 90% da altura disponível
  
  let currentY = 0;
  let pageNumber = 1;
  
  while (currentY < scaledHeight) {
    const remainingHeight = scaledHeight - currentY;
    const actualPageHeight = Math.min(pageContentHeight, remainingHeight);
    
    // Calcula a área do canvas para esta página
    const sourceY = (currentY / scaledHeight) * canvas.height;
    const sourceHeight = (actualPageHeight / scaledHeight) * canvas.height;
    
    // Cria canvas temporário para a página atual
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.ceil(sourceHeight);
    const pageCtx = pageCanvas.getContext('2d');
    
    if (pageCtx) {
      // Fundo branco
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      
      // Desenha a seção correspondente
      pageCtx.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight,
        0, 0, canvas.width, sourceHeight
      );
      
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      
      // Centraliza o conteúdo na página
      const centerX = margin + (dimensions.usableWidth - scaledWidth) / 2;
      const centerY = margin + 10; // Offset do topo
      
      // Adiciona ao PDF
      pdf.addImage(
        pageImgData, 
        'PNG', 
        centerX, 
        centerY, 
        scaledWidth, 
        actualPageHeight,
        undefined,
        'FAST'
      );
    }
    
    currentY += actualPageHeight;
    
    // Adiciona nova página se necessário
    if (currentY < scaledHeight) {
      pdf.addPage();
      pageNumber++;
    }
  }
  
  console.log(`PDF gerado com ${pageNumber} página(s)`);
};

export const generateFileName = (nome: string): string => {
  return `RVR_${nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
};
