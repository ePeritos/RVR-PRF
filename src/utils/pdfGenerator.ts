
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

    // Garante que o elemento está visível
    const originalDisplay = element.style.display;
    const originalVisibility = element.style.visibility;
    element.style.display = 'block';
    element.style.visibility = 'visible';

    // Aguarda um frame adicional para garantir renderização
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 100));

    // Configurações otimizadas para captura
    const canvas = await html2canvas(element, {
      scale: 2, // Reduzido para evitar problemas de memória
      useCORS: true,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      width: element.scrollWidth,
      allowTaint: false,
      foreignObjectRendering: true,
      logging: true, // Ativado para debug
      removeContainer: false,
      async: true,
      onclone: (clonedDoc) => {
        // Garante que o elemento clonado está visível
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.position = 'relative';
        }
      }
    });

    // Restaura estilos originais
    element.style.display = originalDisplay;
    element.style.visibility = originalVisibility;

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
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calcula a proporção para usar a largura completa da página
    const ratio = pdfWidth / (imgWidth / 2); // Divide por 2 devido ao scale
    const scaledHeight = (imgHeight / 2) * ratio; // Ajusta altura proporcionalmente
    
    console.log('Dimensões do PDF:', {
      pdfWidth,
      pdfHeight,
      scaledHeight,
      ratio
    });
    
    // Se a imagem for maior que uma página, divide em múltiplas páginas
    const pageHeight = pdfHeight - 20; // Margem de 10mm em cima e embaixo
    let yPosition = 10; // Margem superior
    let remainingHeight = scaledHeight;
    let pageCount = 0;
    
    while (remainingHeight > 0) {
      pageCount++;
      const currentPageHeight = Math.min(pageHeight, remainingHeight);
      
      // Calcula a posição Y no canvas original
      const sourceY = ((scaledHeight - remainingHeight) / ratio) * 2;
      const sourceHeight = (currentPageHeight / ratio) * 2;
      
      // Cria um canvas temporário para esta página
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      const pageCtx = pageCanvas.getContext('2d');
      
      if (pageCtx) {
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(pageImgData, 'PNG', 0, yPosition, pdfWidth, currentPageHeight);
      }
      
      remainingHeight -= currentPageHeight;
      
      // Adiciona nova página se ainda houver conteúdo
      if (remainingHeight > 0) {
        pdf.addPage();
        yPosition = 10;
      }
    }
    
    console.log(`PDF gerado com ${pageCount} página(s)`);
    
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
