
import { RVRReportData } from './types';

// Helper function to wait for element to be rendered
const waitForElement = async (elementId: string, timeout = 5000): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {
    const element = document.getElementById(elementId);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.getElementById(elementId);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

// Helper function to format text content for clipboard
const formatTextContent = (element: HTMLElement): string => {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return NodeFilter.FILTER_ACCEPT;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = (node as Element).tagName.toLowerCase();
          if (['br', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            return NodeFilter.FILTER_ACCEPT;
          }
        }
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  let result = '';
  let node;
  
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        result += text + ' ';
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = (node as Element).tagName.toLowerCase();
      if (['br', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        result += '\n';
      }
    }
  }

  return result;
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
