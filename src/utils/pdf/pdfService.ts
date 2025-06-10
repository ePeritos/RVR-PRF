import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { PDFCreator } from './pdfCreator';
import { RVRReportPDFTemplate } from '../../components/reports/RVRReportPDFTemplate';
import React from 'react';

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

  async generateFromData(data: any): Promise<void> {
    console.log('Iniciando geração de PDF para:', data.nome);
    console.log('Dados recebidos:', data);
    
    // Cria um container temporário VISÍVEL para garantir renderização
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.4';
    
    try {
      console.log('1. Adicionando container ao DOM...');
      // Adiciona ao DOM
      document.body.appendChild(container);

      console.log('2. Criando root do React...');
      // Cria o root do React para renderizar o componente
      const root = createRoot(container);
      
      console.log('3. Renderizando componente RVRReportPDFTemplate...');
      // Renderiza o RVRReportPDFTemplate (versão otimizada para PDF)
      await new Promise<void>((resolve, reject) => {
        try {
          root.render(React.createElement(RVRReportPDFTemplate, { 
            data, 
            className: 'print:text-black' 
          }));
          
          console.log('4. Aguardando renderização...');
          // Aguarda a renderização
          setTimeout(() => {
            console.log('5. Renderização concluída');
            resolve();
          }, 3000);
        } catch (renderError) {
          console.error('Erro na renderização:', renderError);
          reject(renderError);
        }
      });

      console.log('6. Iniciando captura do canvas...');
      
      // Gera o canvas a partir do elemento
      const canvas = await PDFCreator.generateCanvasFromElement(container);
      
      console.log('7. Canvas gerado, criando PDF...');
      
      // Gera o nome do arquivo
      const filename = PDFCreator.generateFilename(data.nome);
      
      // Cria e salva o PDF
      await PDFCreator.createPDFFromCanvas(canvas, filename);
      
      console.log('8. PDF criado com sucesso!');
      
      // Limpa o root do React
      root.unmount();
      
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error);
      console.error('Stack trace:', error.stack);
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