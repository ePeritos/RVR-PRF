
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RVRReportData {
  id: string;
  nome: string;
  categoria: string;
  valorOriginal: number;
  valorAvaliado: number;
  diferenca: number;
  percentual: number;
  areaImovel?: number;
  situacaoImovel?: string;
  unidadeGestora?: string;
  anoCAIP?: string;
  parametros?: {
    cub: number;
    valorM2: number;
    bdi: number;
  };
}

// Função auxiliar para aguardar renderização
const waitForElement = (selector: string, timeout = 5000): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(selector);
    if (element && element.offsetHeight > 0) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.getElementById(selector);
      if (element && element.offsetHeight > 0) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // Timeout de segurança
    setTimeout(() => {
      observer.disconnect();
      reject(new Error('Elemento não encontrado ou não renderizado'));
    }, timeout);
  });
};

export const generatePDF = async (data: RVRReportData): Promise<void> => {
  const elementId = `rvr-report-${data.id}`;
  
  try {
    console.log('Iniciando geração do PDF para elemento:', elementId);
    
    // Aguarda o elemento estar completamente renderizado
    const element = await waitForElement(elementId);
    
    console.log('Elemento encontrado, dimensões:', {
      width: element.scrollWidth,
      height: element.scrollHeight,
      offsetHeight: element.offsetHeight,
      offsetWidth: element.offsetWidth
    });

    // Garante que o elemento está visível e com largura adequada
    const originalDisplay = element.style.display;
    const originalVisibility = element.style.visibility;
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    const originalPosition = element.style.position;
    
    element.style.display = 'block';
    element.style.visibility = 'visible';
    element.style.width = '210mm'; // Largura exata A4
    element.style.maxWidth = '210mm';
    element.style.position = 'relative';

    // Aguarda um frame adicional para garantir renderização
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 300));

    // Configurações otimizadas para captura A4
    const canvas = await html2canvas(element, {
      scale: 2, // Maior qualidade
      useCORS: true,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      width: element.scrollWidth,
      allowTaint: false,
      foreignObjectRendering: true,
      logging: true,
      removeContainer: false,
      onclone: (clonedDoc) => {
        // Garante que o elemento clonado está visível e com largura A4
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.position = 'relative';
          clonedElement.style.width = '210mm';
          clonedElement.style.maxWidth = '210mm';
          clonedElement.style.boxSizing = 'border-box';
          clonedElement.style.padding = '20px';
        }
      }
    });

    // Restaura estilos originais
    element.style.display = originalDisplay;
    element.style.visibility = originalVisibility;
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.position = originalPosition;

    console.log('Canvas gerado, dimensões:', {
      width: canvas.width,
      height: canvas.height
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas gerado está vazio');
    }

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    if (imgData === 'data:,') {
      throw new Error('Dados da imagem estão vazios');
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Dimensões A4 em mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 15; // Margem reduzida
    const usableWidth = pdfWidth - (margin * 2);
    const usableHeight = pdfHeight - (margin * 2);
    
    // Calcula proporções corretas
    const canvasAspectRatio = canvas.height / canvas.width;
    const scaledWidth = usableWidth;
    const scaledHeight = scaledWidth * canvasAspectRatio;
    
    console.log('Dimensões do PDF:', {
      pdfWidth,
      pdfHeight,
      usableWidth,
      usableHeight,
      scaledWidth,
      scaledHeight,
      canvasAspectRatio
    });
    
    // Se o conteúdo cabe em uma página
    if (scaledHeight <= usableHeight) {
      pdf.addImage(
        imgData, 
        'PNG', 
        margin, 
        margin, 
        scaledWidth, 
        scaledHeight
      );
    } else {
      // Divide o conteúdo em páginas
      let yPosition = 0;
      let currentPage = 1;
      
      while (yPosition < scaledHeight) {
        // Altura da seção atual (limitada pela altura útil da página)
        const currentSectionHeight = Math.min(usableHeight, scaledHeight - yPosition);
        
        // Calcula a posição Y no canvas original
        const sourceY = (yPosition / scaledHeight) * canvas.height;
        const sourceHeight = (currentSectionHeight / scaledHeight) * canvas.height;
        
        // Cria um canvas temporário para esta página
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          // Preenche com fundo branco
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          
          // Desenha a seção do canvas original
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          
          // Adiciona a imagem ao PDF com margens
          pdf.addImage(
            pageImgData, 
            'PNG', 
            margin, 
            margin, 
            scaledWidth, 
            currentSectionHeight
          );
        }
        
        yPosition += currentSectionHeight;
        
        // Adiciona nova página se ainda houver conteúdo
        if (yPosition < scaledHeight) {
          pdf.addPage();
          currentPage++;
        }
      }
    }
    
    console.log(`PDF gerado com sucesso`);
    
    const fileName = `RVR_${data.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    console.log('PDF salvo com sucesso:', fileName);
  } catch (error) {
    console.error('Erro detalhado ao gerar PDF:', error);
    throw error;
  }
};

export const copyReportToClipboard = async (data: RVRReportData): Promise<void> => {
  const elementId = `rvr-report-${data.id}`;
  
  try {
    // Aguarda o elemento estar renderizado
    const element = await waitForElement(elementId);
    
    if (!element) {
      throw new Error('Elemento do relatório não encontrado para cópia');
    }
    
    // Cria uma versão formatada do conteúdo
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Remove elementos desnecessários
    const elementsToRemove = clonedElement.querySelectorAll('button, .hover\\:scale, .hover-scale');
    elementsToRemove.forEach(el => el.remove());
    
    // Converte para texto preservando estrutura básica
    const formatTextContent = (element: HTMLElement): string => {
      let text = '';
      
      for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          const textContent = node.textContent?.trim();
          if (textContent) {
            text += textContent + ' ';
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          
          // Adiciona quebras de linha para elementos de bloco
          if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'tr'].includes(tagName)) {
            text += '\n';
          }
          
          // Adiciona tabulação para células de tabela
          if (tagName === 'td' || tagName === 'th') {
            text += '\t';
          }
          
          // Adiciona o conteúdo do elemento recursivamente
          text += formatTextContent(el);
          
          // Adiciona quebra de linha após elementos de bloco
          if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'tr'].includes(tagName)) {
            text += '\n';
          }
        }
      }
      
      return text;
    };
    
    const formattedText = formatTextContent(clonedElement);
    
    // Limpa o texto removendo quebras excessivas e espaços desnecessários
    const cleanedText = formattedText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove múltiplas quebras de linha
      .replace(/\t+/g, '\t') // Remove tabulações excessivas
      .replace(/[ ]+/g, ' ') // Remove espaços excessivos
      .replace(/\n /g, '\n') // Remove espaços no início das linhas
      .replace(/^\s+|\s+$/g, '') // Remove espaços no início e fim
      .trim();
    
    // Tenta usar a API moderna de clipboard com fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(cleanedText);
    } else {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = cleanedText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    
    console.log('Texto copiado com formatação preservada');
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error);
    throw error;
  }
};
