
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFCreator {
  static async createPDFFromCanvas(canvas: HTMLCanvasElement, filename: string): Promise<void> {
    console.log('Canvas gerado:', { width: canvas.width, height: canvas.height });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas vazio - elemento não foi renderizado');
    }

    // Criar PDF com múltiplas páginas
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    
    // Converter canvas para imagem com qualidade otimizada
    const imgData = canvas.toDataURL('image/jpeg', 0.7); // JPEG com 70% de qualidade para reduzir tamanho
    
    // Calcular dimensões
    const imgWidth = pageWidth - (margin * 2);
    const imgRatio = canvas.height / canvas.width;
    const imgHeight = imgWidth * imgRatio;
    
    // Altura útil da página (descontando margens)
    const pageContentHeight = pageHeight - (margin * 2);
    
    // Verificar se precisa de múltiplas páginas
    if (imgHeight <= pageContentHeight) {
      // Cabe em uma página
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
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
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.7); // JPEG otimizado
          const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
          
          pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);
          
          console.log(`Página ${pageNum + 1}/${totalPages} adicionada ao PDF`);
        }
      }
    }
    
    // Salvar PDF
    pdf.save(filename);
    console.log('PDF salvo:', filename);
  }

  static async generateCanvasFromElement(element: HTMLElement): Promise<HTMLCanvasElement> {
    console.log('Capturando elemento para PDF...');
    
    // Aguarda renderização completa das imagens
    await this.waitForImages(element);
    
    // Aguarda renderização adicional
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Configuração otimizada para html2canvas
    const canvas = await html2canvas(element, {
      scale: 1.2, // Scale reduzido para diminuir tamanho do arquivo
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: 1200,
      windowHeight: element.scrollHeight,
      foreignObjectRendering: false,
      imageTimeout: 8000,
      removeContainer: true,
      ignoreElements: (element) => {
        // Ignora elementos que podem causar problemas
        return element.tagName === 'SCRIPT' || 
               element.tagName === 'STYLE' ||
               element.classList?.contains('no-print');
      },
      onclone: (clonedDoc, element) => {
        console.log('Preparando documento para PDF...');
        
        // Adiciona estilos específicos para PDF
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-family: Arial, sans-serif !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Controle rigoroso de quebras de página */
          .border.rounded-lg.p-6 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 20px !important;
          }
          
          /* Cada imóvel não deve quebrar */
          .mb-8.border.border-gray-300.rounded.p-4 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 30px !important;
          }
          
          /* Grid de dados em duas colunas */
          .grid.grid-cols-2 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
          
          .grid.grid-cols-2 > div {
            display: inline-block !important;
            width: 48% !important;
            margin-right: 2% !important;
            vertical-align: top !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Seção de imagens */
          .mt-6 h3 {
            page-break-after: avoid !important;
            margin-bottom: 10px !important;
          }
          
          /* Grid de imagens */
          .grid.grid-cols-2.gap-4 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
          
          .grid.grid-cols-2.gap-4 > div {
            display: inline-block !important;
            width: 48% !important;
            margin-right: 2% !important;
            margin-bottom: 10px !important;
            vertical-align: top !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Imagens otimizadas */
          img {
            max-width: 100% !important;
            max-height: 180px !important;
            object-fit: contain !important;
            display: block !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Container de cada imagem */
          .w-full.h-48 {
            height: 180px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Rodapé deve ficar na última página */
          .text-center.text-xs.text-gray-500.mt-8.pt-4.border-t {
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 40px !important;
            position: relative !important;
          }
          
          /* Cabeçalho não deve quebrar */
          .text-center.mb-8.border-b-2 {
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Título do imóvel não deve quebrar */
          h2.text-base.font-bold.mb-4 {
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        `;
        clonedDoc.head.appendChild(style);
        
        // Otimiza imagens no documento clonado
        const images = clonedDoc.querySelectorAll('img');
        images.forEach((img: HTMLImageElement) => {
          if (img.src) {
            console.log('Otimizando imagem:', img.src);
            img.crossOrigin = 'anonymous';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '180px';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
          }
        });
      }
    });

    return canvas;
  }
  
  private static async waitForImages(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve mesmo com erro para não travar
          setTimeout(() => resolve(), 5000); // Timeout de 5s
        }
      });
    });
    
    await Promise.all(imagePromises);
    console.log('Todas as imagens processadas');
  }

  static generateFilename(name: string): string {
    return `RVR_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  }
}
