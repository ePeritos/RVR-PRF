
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

  async generateFromData(data: RVRReportData): Promise<void> {
    // Cria um container temporário para renderizar o relatório
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.zIndex = '-1';
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.id = `pdf-container-${Date.now()}`;

    try {
      // Adiciona ao DOM
      document.body.appendChild(container);

      // Cria o conteúdo do relatório
      const reportContent = this.createReportHTML(data);
      container.innerHTML = reportContent;

      // Aguarda um momento para renderização
      await new Promise(resolve => setTimeout(resolve, 100));

      const filename = `RVR_${data.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      await this.generateFromElement(container, { filename });
      
    } finally {
      // Remove o container
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }

  private createReportHTML(data: RVRReportData): string {
    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
          <h1 style="font-size: 24px; margin: 0; color: #1f2937;">RELATÓRIO DE REAVALIAÇÃO</h1>
          <h2 style="font-size: 18px; margin: 10px 0; color: #6b7280;">Relatório de Valor de Referência (RVR)</h2>
          <p style="margin: 5px 0; color: #9ca3af;">Data de Geração: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">
            Informações da Unidade
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold; width: 30%;">Nome da Unidade:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.nome}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Categoria:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.categoria}</td>
            </tr>
            ${data.unidadeGestora ? `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Unidade Gestora:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.unidadeGestora}</td>
            </tr>
            ` : ''}
            ${data.anoCAIP ? `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Ano CAIP:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.anoCAIP}</td>
            </tr>
            ` : ''}
            ${data.areaImovel ? `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Área do Imóvel:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.areaImovel} m²</td>
            </tr>
            ` : ''}
            ${data.situacaoImovel ? `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Situação do Imóvel:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.situacaoImovel}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">
            Análise Financeira
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold; width: 30%;">Valor Original (RVR):</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Valor Reavaliado:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #059669;">${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Diferença:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: ${data.diferenca >= 0 ? '#059669' : '#dc2626'};">
                ${data.diferenca >= 0 ? '+' : ''}${data.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Variação Percentual:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: ${data.percentual >= 0 ? '#059669' : '#dc2626'};">
                ${data.percentual >= 0 ? '+' : ''}${data.percentual.toFixed(2)}%
              </td>
            </tr>
          </table>
        </div>

        ${data.parametros ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; margin-bottom: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">
            Parâmetros Utilizados
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold; width: 30%;">CUB (Custo Unitário Básico):</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.parametros.cub.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Valor por m²:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.parametros.valorM2.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">BDI (%):</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${data.parametros.bdi}%</td>
            </tr>
          </table>
        </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Este relatório foi gerado automaticamente pelo Sistema de Reavaliação de Imóveis</p>
          <p>Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>
    `;
  }
}

export const pdfService = PDFService.getInstance();
