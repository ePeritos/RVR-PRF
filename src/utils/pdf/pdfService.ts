import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { PDFCreator } from './pdfCreator';
import { RVRReportPDFTemplate } from '../../components/reports/RVRReportPDFTemplate';
import { CAIPReportTemplate } from '../../components/caip/CAIPReportTemplate';
import { CustomReportPDFTemplate } from '../../components/reports/CustomReportPDFTemplate';
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
      
      console.log('3. Renderizando componente...');
      // Detecta o tipo de relatório e renderiza o componente apropriado
      const isCustomReport = data.titulo && data.dados && data.campos_incluidos;
      const isCAIPReport = data.ano_caip || data.unidade_gestora || data.tipo_de_unidade;
      
      await new Promise<void>((resolve, reject) => {
        try {
          if (isCustomReport) {
            console.log('Renderizando CustomReportPDFTemplate...');
            console.log('Dados incluídos:', data.campos_incluidos);
            console.log('Incluir imagens:', data.incluir_imagens);
            root.render(React.createElement(CustomReportPDFTemplate, { 
              data
            }));
          } else if (isCAIPReport) {
            console.log('Renderizando CAIPReportTemplate...');
            root.render(React.createElement(CAIPReportTemplate, { 
              data
            }));
          } else {
            console.log('Renderizando RVRReportPDFTemplate...');
            root.render(React.createElement(RVRReportPDFTemplate, { 
              data, 
              className: 'print:text-black' 
            }));
          }
          
          console.log('4. Aguardando renderização...');
          // Aguarda a renderização e o carregamento das imagens
          setTimeout(async () => {
            console.log('5. Verificando imagens carregadas...');
            
            // Aguarda todas as imagens carregarem
            const images = container.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => {
              return new Promise((resolve) => {
                if (img.complete) {
                  console.log('Imagem já carregada:', img.src);
                  resolve(true);
                } else {
                  img.onload = () => {
                    console.log('Imagem carregada:', img.src);
                    resolve(true);
                  };
                  img.onerror = () => {
                    console.log('Erro ao carregar imagem:', img.src);
                    resolve(false);
                  };
                  // Timeout para imagens que não carregam
                  setTimeout(() => {
                    console.log('Timeout para imagem:', img.src);
                    resolve(false);
                  }, 5000);
                }
              });
            });
            
            await Promise.all(imagePromises);
            console.log('6. Todas as imagens processadas');
            resolve();
          }, 2000);
        } catch (renderError) {
          console.error('Erro na renderização:', renderError);
          reject(renderError);
        }
      });

      console.log('6. Iniciando captura do canvas...');
      
      // Adiciona estilos CSS específicos para PDF antes da captura
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: Arial, sans-serif !important;
          }
          
          /* Controle rigoroso de quebra de página para tabelas */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          td {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            vertical-align: top !important;
          }
          
          /* Controle específico para seções de imagem */
          div[style*="pageBreakInside"] {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 20px !important;
          }
          
          /* Controle específico para imagens e seus containers */
          img {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: contain !important;
            display: block !important;
          }
          
          /* Container de cada imagem individual */
          div[style*="height: 180px"] {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 10px !important;
          }
          
          /* Seção de imagens completa */
          div h3 + table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Cada linha de imagens */
          tr:has(img) {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: auto !important;
          }
          
          /* Força quebra antes de seções de imagem se necessário */
          h3:contains("Imagens") {
            page-break-before: auto !important;
            margin-top: 20px !important;
          }
        }
      `;
      container.appendChild(style);
      
      // Aguarda um tempo adicional para garantir que as imagens sejam processadas
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Força a renderização completa antes da captura
      const images = container.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            setTimeout(() => resolve(false), 3000);
          }
        });
      }));
      
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