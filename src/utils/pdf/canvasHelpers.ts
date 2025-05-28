
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
  logging: false,
  removeContainer: false,
  scrollX: 0,
  scrollY: 0,
  windowWidth: 1200,
  windowHeight: element.scrollHeight + 200, // Margem extra
  onclone: (clonedDoc) => {
    const elementId = element.id;
    const clonedElement = clonedDoc.getElementById(elementId);
    if (clonedElement) {
      clonedElement.style.display = 'block';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.position = 'relative';
      clonedElement.style.width = '800px'; // Largura ligeiramente maior
      clonedElement.style.maxWidth = '800px';
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.padding = '30px'; // Padding aumentado
      clonedElement.style.boxSizing = 'border-box';
      clonedElement.style.fontSize = '14px';
      clonedElement.style.lineHeight = '1.6'; // Melhor espaçamento
      clonedElement.style.margin = '0';
      clonedElement.style.border = 'none';
      
      // Aplica estilos para melhor renderização
      const allElements = clonedElement.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.boxSizing = 'border-box';
        htmlEl.style.pageBreakInside = 'avoid';
        if (htmlEl.style.transform) {
          htmlEl.style.transform = 'none';
        }
        // Remove sombras que podem causar problemas
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
      });
    }
  }
});

export const generateCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  // Aguarda renderização completa com mais tempo
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(resolve => setTimeout(resolve, 1000)); // Tempo aumentado

  const config = createCanvasConfig(element);
  const canvas = await html2canvas(element, config);

  console.log('Canvas gerado, dimensões:', {
    width: canvas.width,
    height: canvas.height
  });

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas gerado está vazio');
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
