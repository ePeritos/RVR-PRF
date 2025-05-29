
import html2canvas from 'html2canvas';
import { RVRReportData } from './types';
import { HTMLGenerator } from './htmlGenerator';
import { PDFCreator } from './pdfCreator';

interface PDFGenerationOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

export class PDFService {
  private static instance: PDFService;
  
  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async generateFromData(data: RVRReportData): Promise<void> {
    console.log('Iniciando geração de PDF para:', data.nome);
    
    // Cria um container temporário VISÍVEL para garantir renderização
    const container = HTMLGenerator.createContainer();
    
    try {
      // Adiciona ao DOM
      document.body.appendChild(container);

      // Cria o conteúdo do relatório
      const reportContent = HTMLGenerator.createReportHTML(data);
      container.innerHTML = reportContent;

      console.log('Conteúdo HTML criado, aguardando renderização...');
      
      // Gera o canvas a partir do elemento
      const canvas = await PDFCreator.generateCanvasFromElement(container);
      
      // Gera o nome do arquivo
      const filename = PDFCreator.generateFilename(data.nome);
      
      // Cria e salva o PDF
      await PDFCreator.createPDFFromCanvas(canvas, filename);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    } finally {
      // Remove o container
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }

  async generateFromElement(
    element: HTMLElement, 
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const {
      filename = 'document.pdf',
      quality = 1.0,
      scale = 2
    } = options;

    try {
      console.log('Iniciando captura do elemento para PDF...');
      
      // Configuração otimizada para html2canvas
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: false,
        foreignObjectRendering: true,
        windowWidth: 1200,
        windowHeight: window.innerHeight,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Aplica estilos no documento clonado
          const clonedElement = clonedDoc.body.querySelector('*');
          if (clonedElement) {
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * { 
                box-sizing: border-box !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body { 
                margin: 0 !important;
                padding: 20px !important;
                background: white !important;
                font-family: system-ui, -apple-system, sans-serif !important;
              }
              table { 
                border-collapse: collapse !important;
                width: 100% !important;
              }
              .no-print { display: none !important; }
            `;
            clonedDoc.head.appendChild(style);
          }
        }
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vazio - elemento pode não estar visível');
      }

      console.log('Canvas criado com sucesso:', {
        width: canvas.width,
        height: canvas.height
      });

      await PDFCreator.createPDFFromCanvas(canvas, filename);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}

export const pdfService = PDFService.getInstance();
