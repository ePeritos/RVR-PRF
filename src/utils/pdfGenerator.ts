
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

export const generatePDF = async (data: RVRReportData): Promise<void> => {
  const element = document.getElementById(`rvr-report-${data.id}`);
  
  if (!element) {
    throw new Error('Elemento do relatório não encontrado');
  }

  try {
    // Configurações otimizadas para melhor qualidade
    const canvas = await html2canvas(element, {
      scale: 3, // Aumenta a resolução
      useCORS: true,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      width: element.scrollWidth,
      allowTaint: false,
      foreignObjectRendering: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calcula a proporção para usar a largura completa da página
    const ratio = pdfWidth / (imgWidth / 3); // Divide por 3 devido ao scale
    const scaledHeight = (imgHeight / 3) * ratio; // Ajusta altura proporcionalmente
    
    // Se a imagem for maior que uma página, divide em múltiplas páginas
    const pageHeight = pdfHeight - 20; // Margem de 10mm em cima e embaixo
    let yPosition = 10; // Margem superior
    let remainingHeight = scaledHeight;
    
    while (remainingHeight > 0) {
      const currentPageHeight = Math.min(pageHeight, remainingHeight);
      
      // Calcula a posição Y no canvas original
      const sourceY = ((scaledHeight - remainingHeight) / ratio) * 3;
      const sourceHeight = (currentPageHeight / ratio) * 3;
      
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
    
    const fileName = `RVR_${data.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};

export const copyReportToClipboard = async (data: RVRReportData): Promise<void> => {
  // Obtém o conteúdo atual do template renderizado
  const element = document.getElementById(`rvr-report-${data.id}`);
  
  if (!element) {
    throw new Error('Elemento do relatório não encontrado para cópia');
  }
  
  try {
    // Extrai o texto do elemento HTML renderizado
    const reportText = element.innerText || element.textContent || '';
    
    // Remove quebras de linha excessivas e espaços desnecessários
    const cleanedText = reportText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove múltiplas quebras de linha
      .replace(/\s+/g, ' ') // Remove espaços excessivos
      .replace(/\n /g, '\n') // Remove espaços no início das linhas
      .trim();
    
    await navigator.clipboard.writeText(cleanedText);
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error);
    throw error;
  }
};
