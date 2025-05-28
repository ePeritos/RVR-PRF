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

    // Configurações aprimoradas para evitar corte de conteúdo
    const originalDisplay = element.style.display;
    const originalVisibility = element.style.visibility;
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    const originalPosition = element.style.position;
    const originalZIndex = element.style.zIndex;
    const originalTop = element.style.top;
    const originalLeft = element.style.left;
    
    // Aplica estilos temporários para garantir captura completa
    element.style.display = 'block';
    element.style.visibility = 'visible';
    element.style.width = '794px'; // Largura A4 em pixels (210mm)
    element.style.maxWidth = '794px';
    element.style.position = 'absolute';
    element.style.zIndex = '9999';
    element.style.top = '0';
    element.style.left = '0';
    element.style.backgroundColor = '#ffffff';

    // Aguarda renderização completa
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 500));

    // Configurações otimizadas do html2canvas
    const canvas = await html2canvas(element, {
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
      windowHeight: element.scrollHeight + 100,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.position = 'relative';
          clonedElement.style.width = '794px';
          clonedElement.style.maxWidth = '794px';
          clonedElement.style.backgroundColor = '#ffffff';
          clonedElement.style.padding = '20px';
          clonedElement.style.boxSizing = 'border-box';
          clonedElement.style.fontSize = '14px';
          clonedElement.style.lineHeight = '1.5';
          
          // Aplica estilos para melhor renderização
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.boxSizing = 'border-box';
            if (htmlEl.style.transform) {
              htmlEl.style.transform = 'none';
            }
          });
        }
      }
    });

    // Restaura estilos originais
    element.style.display = originalDisplay;
    element.style.visibility = originalVisibility;
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.position = originalPosition;
    element.style.zIndex = originalZIndex;
    element.style.top = originalTop;
    element.style.left = originalLeft;

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
    
    // Dimensões A4 em mm com margens adequadas
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10; // Margem reduzida para aproveitar melhor o espaço
    const usableWidth = pdfWidth - (margin * 2);
    const usableHeight = pdfHeight - (margin * 2);
    
    // Calcula proporções corretas mantendo aspect ratio
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
        scaledHeight,
        undefined,
        'FAST'
      );
    } else {
      // Divide o conteúdo em múltiplas páginas sem cortar
      let currentY = 0;
      let pageNumber = 1;
      
      while (currentY < scaledHeight) {
        const remainingHeight = scaledHeight - currentY;
        const pageContentHeight = Math.min(usableHeight, remainingHeight);
        
        // Calcula a área do canvas para esta página
        const sourceY = (currentY / scaledHeight) * canvas.height;
        const sourceHeight = (pageContentHeight / scaledHeight) * canvas.height;
        
        // Cria canvas temporário para a página atual
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.ceil(sourceHeight);
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          // Fundo branco
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          
          // Desenha a seção correspondente
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          
          // Adiciona ao PDF
          pdf.addImage(
            pageImgData, 
            'PNG', 
            margin, 
            margin, 
            scaledWidth, 
            pageContentHeight,
            undefined,
            'FAST'
          );
        }
        
        currentY += pageContentHeight;
        
        // Adiciona nova página se necessário
        if (currentY < scaledHeight) {
          pdf.addPage();
          pageNumber++;
        }
      }
      
      console.log(`PDF gerado com ${pageNumber} página(s)`);
    }
    
    console.log('PDF gerado com sucesso');
    
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
