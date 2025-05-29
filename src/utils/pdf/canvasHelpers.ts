
import html2canvas from 'html2canvas';
import { CanvasConfig } from './types';

export const createCanvasConfig = (element: HTMLElement): CanvasConfig & { width: number; height: number; windowHeight: number; onclone: (doc: Document) => void } => ({
  scale: 2, // Alta qualidade
  useCORS: true,
  allowTaint: false,
  backgroundColor: '#ffffff',
  width: element.scrollWidth,
  height: element.scrollHeight,
  foreignObjectRendering: true,
  logging: true, // Ativando logs para debug
  removeContainer: false,
  scrollX: 0,
  scrollY: 0,
  windowWidth: 1200,
  windowHeight: element.scrollHeight + 200,
  onclone: (clonedDoc) => {
    console.log('Clonando documento para captura...');
    const elementId = element.id;
    const clonedElement = clonedDoc.getElementById(elementId);
    
    if (clonedElement) {
      console.log('Aplicando estilos ao elemento clonado...');
      
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.position = 'relative';
      clonedElement.style.width = '800px';
      clonedElement.style.maxWidth = '800px';
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.padding = '40px'; // Padding aumentado
      clonedElement.style.boxSizing = 'border-box';
      clonedElement.style.fontSize = '14px';
      clonedElement.style.lineHeight = '1.6';
      clonedElement.style.margin = '0';
      clonedElement.style.border = 'none';
      clonedElement.style.overflow = 'visible';
      
      // Força o elemento a ocupar o espaço completo
      clonedElement.style.minHeight = 'auto';
      clonedElement.style.height = 'auto';
      
      // Aplica estilos para melhor renderização
      const allElements = clonedElement.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.boxSizing = 'border-box';
        htmlEl.style.pageBreakInside = 'avoid';
        
        // Fix TypeScript errors by using proper property access
        (htmlEl.style as any).webkitPrintColorAdjust = 'exact';
        (htmlEl.style as any).printColorAdjust = 'exact';
        
        if (htmlEl.style.transform) {
          htmlEl.style.transform = 'none';
        }
        if (htmlEl.style.boxShadow) {
          htmlEl.style.boxShadow = 'none';
        }
      });
      
      // Garante que tabelas não quebrem mal
      const tables = clonedElement.querySelectorAll('table');
      tables.forEach((table: Element) => {
        const htmlTable = table as HTMLElement;
        htmlTable.style.borderCollapse = 'collapse';
        htmlTable.style.width = '100%';
        htmlTable.style.tableLayout = 'fixed';
      });
      
      console.log('Estilos aplicados ao elemento clonado');
    } else {
      console.error('Elemento clonado não encontrado:', elementId);
    }
  }
});

export const generateCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  console.log('Iniciando geração do canvas...');
  
  // Aguarda renderização completa com mais tempo
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(resolve => setTimeout(resolve, 1500)); // Tempo aumentado

  const config = createCanvasConfig(element);
  console.log('Configuração do canvas:', config);
  
  const canvas = await html2canvas(element, config);

  console.log('Canvas gerado, dimensões:', {
    width: canvas.width,
    height: canvas.height,
    dataURL: canvas.toDataURL('image/png', 1.0).substring(0, 100) + '...'
  });

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas gerado está vazio - verifique se o elemento está visível');
  }

  return canvas;
};

export const canvasToImageData = (canvas: HTMLCanvasElement): string => {
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  if (imgData === 'data:,') {
    throw new Error('Dados da imagem estão vazios');
  }

  return imgData;
};
