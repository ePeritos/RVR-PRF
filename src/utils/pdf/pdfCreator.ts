
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
    
    // Salvar PDF
    pdf.save(filename);
    console.log('PDF salvo:', filename);
  }

  static async generateCanvasFromElement(element: HTMLElement): Promise<HTMLCanvasElement> {
    console.log('Capturando elemento para PDF...');
    
    // Aguarda renderização completa
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Configuração otimizada para html2canvas com suporte a imagens
    const canvas = await html2canvas(element, {
      scale: 1.5, // Reduzir scale para evitar problemas de memória
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      foreignObjectRendering: false,
      imageTimeout: 10000,
      ignoreElements: (element) => {
        // Ignora elementos que podem causar problemas
        return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
      },
      onclone: (clonedDoc, element) => {
        console.log('Clonando documento...');
        
        // Adiciona estilos específicos para o clone
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          img {
            max-width: 95% !important;
            max-height: 95% !important;
            object-fit: contain !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: block !important;
          }
          
          div[style*="pageBreakInside"] {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        `;
        clonedDoc.head.appendChild(style);
        
        // Força o carregamento de imagens no documento clonado
        const images = clonedDoc.querySelectorAll('img');
        images.forEach((img: HTMLImageElement) => {
          if (img.src) {
            console.log('Processando imagem no clone:', img.src);
            img.crossOrigin = 'anonymous';
            // Força estilo inline para garantir renderização correta
            img.style.maxWidth = '95%';
            img.style.maxHeight = '95%';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
          }
        });
      }
    });

    return canvas;
  }

  static generateFilename(name: string): string {
    return `RVR_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  }
}
