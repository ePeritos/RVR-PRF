
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
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      width: element.scrollWidth
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    const fileName = `RVR_${data.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};

export const copyReportToClipboard = async (data: RVRReportData): Promise<void> => {
  const reportText = `
RELATÓRIO DE VALOR REFERENCIAL (RVR)
Polícia Rodoviária Federal - PRF

1. DADOS DO IMÓVEL
Nome da Unidade: ${data.nome}
Tipo de Unidade: ${data.categoria}
Situação do Imóvel: ${data.situacaoImovel || 'Não informado'}
Área Construída: ${data.areaImovel ? `${data.areaImovel} m²` : 'Não informado'}
Unidade Gestora: ${data.unidadeGestora || 'Não informado'}
Ano CAIP: ${data.anoCAIP || 'Não informado'}

${data.parametros ? `2. PARÂMETROS DE AVALIAÇÃO
CUB (R$/m²): ${data.parametros.cub.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Valor m² (R$/m²): ${data.parametros.valorM2.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
BDI (%): ${data.parametros.bdi.toFixed(2)}%

` : ''}3. RESULTADO DA AVALIAÇÃO
Valor RVR Original: ${data.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Valor RVR Avaliado: ${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Diferença: ${data.diferenca >= 0 ? '+' : ''}${data.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Variação Percentual: ${data.percentual >= 0 ? '+' : ''}${data.percentual.toFixed(2)}%

4. CONCLUSÃO
Com base na metodologia aplicada e nos parâmetros utilizados, o valor referencial do imóvel "${data.nome}" foi avaliado em ${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, representando uma ${data.diferenca >= 0 ? 'valorização' : 'desvalorização'} de ${Math.abs(data.percentual).toFixed(2)}% em relação ao valor RVR original.

Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}
  `.trim();

  try {
    await navigator.clipboard.writeText(reportText);
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error);
    throw error;
  }
};
