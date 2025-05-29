
// Função auxiliar para aguardar renderização com timeout maior e verificações mais robustas
export const waitForElement = (selector: string, timeout = 15000): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    console.log('Procurando elemento:', selector);
    
    // Função para verificar se o elemento está realmente pronto
    const isElementReady = (element: HTMLElement): boolean => {
      return element && 
             element.offsetHeight > 0 && 
             element.offsetWidth > 0 &&
             element.innerHTML.trim().length > 0 &&
             element.style.display !== 'none' &&
             element.style.visibility !== 'hidden';
    };
    
    // Primeiro, tenta encontrar o elemento imediatamente
    const immediateElement = document.getElementById(selector);
    if (immediateElement && isElementReady(immediateElement)) {
      console.log('Elemento encontrado imediatamente:', selector);
      resolve(immediateElement);
      return;
    }

    let attempts = 0;
    const maxAttempts = Math.floor(timeout / 300); // Verifica a cada 300ms
    const checkInterval = 300;

    const checkElement = () => {
      attempts++;
      const element = document.getElementById(selector);
      
      console.log(`Tentativa ${attempts}: Elemento ${selector}`, {
        found: !!element,
        offsetHeight: element?.offsetHeight || 0,
        offsetWidth: element?.offsetWidth || 0,
        innerHTML: element?.innerHTML?.length || 0
      });
      
      if (element && isElementReady(element)) {
        console.log(`Elemento encontrado e pronto após ${attempts} tentativas:`, selector);
        resolve(element);
        return;
      }

      if (attempts >= maxAttempts) {
        console.error(`Elemento não encontrado ou não está pronto após ${attempts} tentativas:`, selector);
        reject(new Error(`Elemento ${selector} não encontrado ou não renderizado adequadamente`));
        return;
      }

      setTimeout(checkElement, checkInterval);
    };

    // MutationObserver como backup
    const observer = new MutationObserver(() => {
      const element = document.getElementById(selector);
      if (element && isElementReady(element)) {
        observer.disconnect();
        console.log('Elemento encontrado via MutationObserver:', selector);
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Inicia a verificação por polling
    setTimeout(checkElement, checkInterval);

    // Timeout de segurança
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout ao aguardar elemento ${selector}`));
    }, timeout);
  });
};

interface OriginalStyles {
  display: string;
  visibility: string;
  width: string;
  maxWidth: string;
  position: string;
  zIndex: string;
  top: string;
  left: string;
}

export const prepareElementForCapture = (element: HTMLElement): OriginalStyles => {
  const originalStyles = {
    display: element.style.display,
    visibility: element.style.visibility,
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    position: element.style.position,
    zIndex: element.style.zIndex,
    top: element.style.top,
    left: element.style.left,
  };
  
  // Aplica estilos temporários para garantir captura completa
  element.style.display = 'block';
  element.style.visibility = 'visible';
  element.style.width = '800px'; // Largura aumentada
  element.style.maxWidth = '800px';
  element.style.position = 'absolute';
  element.style.zIndex = '9999';
  element.style.top = '0';
  element.style.left = '0';
  element.style.backgroundColor = '#ffffff';
  element.style.margin = '0';
  element.style.padding = '30px'; // Padding aumentado

  return originalStyles;
};

export const restoreElementStyles = (element: HTMLElement, originalStyles: OriginalStyles): void => {
  element.style.display = originalStyles.display;
  element.style.visibility = originalStyles.visibility;
  element.style.width = originalStyles.width;
  element.style.maxWidth = originalStyles.maxWidth;
  element.style.position = originalStyles.position;
  element.style.zIndex = originalStyles.zIndex;
  element.style.top = originalStyles.top;
  element.style.left = originalStyles.left;
};

export const formatTextContent = (element: HTMLElement): string => {
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
