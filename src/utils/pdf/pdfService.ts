import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RVRReportData } from './types';

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
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '210mm'; // Largura A4
    container.style.backgroundColor = 'white';
    container.style.padding = '20mm';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.4';
    container.style.zIndex = '999999';
    container.style.boxSizing = 'border-box';
    
    try {
      // Adiciona ao DOM
      document.body.appendChild(container);

      // Cria o conteúdo do relatório
      const reportContent = this.createReportHTML(data);
      container.innerHTML = reportContent;

      console.log('Conteúdo HTML criado, aguardando renderização...');
      
      // Aguarda renderização completa
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Capturando elemento para PDF...');
      
      // Configuração otimizada para html2canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: true,
        width: container.offsetWidth,
        height: container.offsetHeight,
        windowWidth: container.offsetWidth,
        windowHeight: container.offsetHeight,
        onclone: (clonedDoc) => {
          console.log('Clonando documento...');
          const clonedContainer = clonedDoc.querySelector('div');
          if (clonedContainer) {
            (clonedContainer as HTMLElement).style.display = 'block';
            (clonedContainer as HTMLElement).style.visibility = 'visible';
          }
        }
      });

      console.log('Canvas gerado:', { width: canvas.width, height: canvas.height });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vazio - elemento não foi renderizado');
      }

      // Criar PDF com múltiplas páginas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      
      // Converter canvas para imagem
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calcular dimensões
      const imgWidth = pageWidth - (margin * 2);
      const imgRatio = canvas.height / canvas.width;
      const imgHeight = imgWidth * imgRatio;
      
      // Altura útil da página (descontando margens)
      const pageContentHeight = pageHeight - (margin * 2);
      
      // Verificar se precisa de múltiplas páginas
      if (imgHeight <= pageContentHeight) {
        // Cabe em uma página
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      } else {
        // Múltiplas páginas necessárias
        const totalPages = Math.ceil(imgHeight / pageContentHeight);
        console.log(`Gerando ${totalPages} páginas para o PDF`);
        
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
          if (pageNum > 0) {
            pdf.addPage();
          }
          
          // Calcular a porção da imagem para esta página
          const sourceY = (pageNum * pageContentHeight * canvas.height) / imgHeight;
          const sourceHeight = Math.min(
            (pageContentHeight * canvas.height) / imgHeight,
            canvas.height - sourceY
          );
          
          // Criar canvas temporário para esta página
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');
          
          if (ctx) {
            // Fundo branco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            
            // Desenhar a porção da imagem correspondente a esta página
            ctx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, pageCanvas.width, pageCanvas.height
            );
            
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
            const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
            
            pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageImgHeight);
            
            console.log(`Página ${pageNum + 1}/${totalPages} adicionada ao PDF`);
          }
        }
      }
      
      const filename = `RVR_${data.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Salvar PDF
      pdf.save(filename);
      console.log('PDF salvo:', filename);
      
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

  private createReportHTML(data: RVRReportData): string {
    return `
      <div style="width: 100%; font-family: Arial, sans-serif; color: #000; page-break-inside: avoid;">
        <!-- Cabeçalho -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #000;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #000;">
            RELATÓRIO DE REAVALIAÇÃO
          </h1>
          <h2 style="font-size: 18px; font-weight: normal; margin: 0 0 10px 0; color: #666;">
            Relatório de Valor de Referência (RVR)
          </h2>
          <p style="font-size: 12px; margin: 0; color: #888;">
            Data de Geração: ${new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <!-- Informações da Unidade -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Informações da Unidade
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold; width: 35%;">
                Nome da Unidade:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.nome}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Categoria:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.categoria}
              </td>
            </tr>
            ${data.unidadeGestora ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Unidade Gestora:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.unidadeGestora}
              </td>
            </tr>
            ` : ''}
            ${data.anoCAIP ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Ano CAIP:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.anoCAIP}
              </td>
            </tr>
            ` : ''}
            ${data.areaImovel ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Área do Imóvel:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.areaImovel} m²
              </td>
            </tr>
            ` : ''}
            ${data.situacaoImovel ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Situação do Imóvel:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.situacaoImovel}
              </td>
            </tr>
            ` : ''}
          </table>
        </div>

        <!-- Análise Financeira -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Análise Financeira
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold; width: 35%;">
                Valor Original (RVR):
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Valor Reavaliado:
              </td>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: #008000;">
                ${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Diferença:
              </td>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: ${data.diferenca >= 0 ? '#008000' : '#cc0000'};">
                ${data.diferenca >= 0 ? '+' : ''}${data.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Variação Percentual:
              </td>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: ${data.percentual >= 0 ? '#008000' : '#cc0000'};">
                ${data.percentual >= 0 ? '+' : ''}${data.percentual.toFixed(2)}%
              </td>
            </tr>
          </table>
        </div>

        ${data.parametros ? `
        <!-- Parâmetros Utilizados -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Parâmetros Utilizados
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold; width: 35%;">
                CUB (Custo Unitário Básico):
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.parametros.cub.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Valor por m²:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.parametros.valorM2.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                BDI (%):
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.parametros.bdi}%
              </td>
            </tr>
          </table>
        </div>
        ` : ''}

        <!-- Metodologia (página adicional) -->
        <div style="margin-bottom: 25px; page-break-before: always;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Metodologia de Avaliação
          </h3>
          
          <p style="margin-bottom: 15px; text-align: justify; line-height: 1.6;">
            A reavaliação foi realizada considerando os parâmetros técnicos vigentes e as condições atuais do mercado imobiliário. 
            O método utilizado baseou-se na análise comparativa de dados e na aplicação de índices de correção apropriados.
          </p>
          
          <h4 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; color: #000;">
            Critérios Considerados:
          </h4>
          
          <ul style="margin-left: 20px; line-height: 1.6;">
            <li>Localização e características do imóvel</li>
            <li>Estado de conservação</li>
            <li>Área construída e área do terreno</li>
            <li>Índices econômicos de correção</li>
            <li>Comparação com valores de mercado</li>
          </ul>
          
          <h4 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; color: #000;">
            Considerações Finais:
          </h4>
          
          <p style="margin-bottom: 15px; text-align: justify; line-height: 1.6;">
            Este relatório apresenta o resultado da reavaliação do imóvel considerando todos os aspectos técnicos e legais pertinentes. 
            Os valores aqui apresentados refletem as condições atuais do mercado e seguem as normas técnicas estabelecidas.
          </p>
        </div>

        <!-- Rodapé -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 10px; color: #666;">
          <p style="margin: 5px 0;">
            Este relatório foi gerado automaticamente pelo Sistema de Reavaliação de Imóveis
          </p>
          <p style="margin: 5px 0;">
            Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>
    `;
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

      // Cria o PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - (margin * 2);

      // Calcula dimensões mantendo proporção
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(maxWidth / (imgWidth * 0.264583), maxHeight / (imgHeight * 0.264583));
      
      const finalWidth = imgWidth * 0.264583 * ratio;
      const finalHeight = imgHeight * 0.264583 * ratio;

      // Centraliza o conteúdo
      const x = (pageWidth - finalWidth) / 2;
      const y = margin;

      const imgData = canvas.toDataURL('image/png', quality);
      
      // Verifica se precisa de múltiplas páginas
      if (finalHeight <= maxHeight) {
        // Cabe em uma página
        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      } else {
        // Múltiplas páginas
        const pagesNeeded = Math.ceil(finalHeight / maxHeight);
        const pageContentHeight = finalHeight / pagesNeeded;
        
        for (let page = 0; page < pagesNeeded; page++) {
          if (page > 0) pdf.addPage();
          
          const sourceY = (page * canvas.height) / pagesNeeded;
          const sourceHeight = canvas.height / pagesNeeded;
          
          // Cria canvas para esta página
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');
          
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            
            const pageImgData = pageCanvas.toDataURL('image/png', quality);
            pdf.addImage(pageImgData, 'PNG', x, y, finalWidth, pageContentHeight);
          }
        }
      }

      // Salva o PDF
      pdf.save(filename);
      console.log('PDF gerado e salvo:', filename);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}

export const pdfService = PDFService.getInstance();
