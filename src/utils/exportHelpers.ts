
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

export interface ExportData {
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
}

export const exportToExcel = async (data: ExportData[], fileName: string = 'relatorio_rvr') => {
  try {
    // Prepara os dados para Excel
    const excelData = data.map(item => ({
      'ID': item.id,
      'Nome da Unidade': item.nome,
      'Categoria': item.categoria,
      'Valor Original (R$)': item.valorOriginal.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      'Valor Avaliado (R$)': item.valorAvaliado.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      'Diferença (R$)': item.diferenca.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      'Percentual (%)': `${item.percentual.toFixed(2)}%`,
      'Área do Imóvel (m²)': item.areaImovel || 'N/A',
      'Situação do Imóvel': item.situacaoImovel || 'N/A',
      'Unidade Gestora': item.unidadeGestora || 'N/A',
      'Ano CAIP': item.anoCAIP || 'N/A',
    }));

    // Cria workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajusta largura das colunas
    const colWidths = [
      { wch: 15 }, // ID
      { wch: 30 }, // Nome da Unidade
      { wch: 15 }, // Categoria
      { wch: 18 }, // Valor Original
      { wch: 18 }, // Valor Avaliado
      { wch: 18 }, // Diferença
      { wch: 12 }, // Percentual
      { wch: 15 }, // Área
      { wch: 20 }, // Situação
      { wch: 20 }, // Unidade Gestora
      { wch: 12 }, // Ano CAIP
    ];
    ws['!cols'] = colWidths;

    // Adiciona worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório RVR');

    // Salva arquivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    console.log('Arquivo Excel exportado com sucesso');
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Erro ao exportar arquivo Excel');
  }
};

export const exportToWord = async (data: ExportData[], fileName: string = 'relatorio_rvr') => {
  try {
    // Cria conteúdo HTML para conversão
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório RVR</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .currency { text-align: right; }
          .percentage { text-align: center; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Relatório de Reavaliação de Valor de Referência (RVR)</h1>
        <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>Total de Imóveis:</strong> ${data.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Nome da Unidade</th>
              <th>Categoria</th>
              <th>Valor Original</th>
              <th>Valor Avaliado</th>
              <th>Diferença</th>
              <th>Percentual</th>
              <th>Área (m²)</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.nome}</td>
                <td>${item.categoria}</td>
                <td class="currency">${item.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="currency">${item.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="currency">${item.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="percentage">${item.percentual.toFixed(2)}%</td>
                <td>${item.areaImovel || 'N/A'}</td>
                <td>${item.situacaoImovel || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Resumo</h3>
          <p><strong>Valor Total Original:</strong> ${data.reduce((sum, item) => sum + item.valorOriginal, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p><strong>Valor Total Avaliado:</strong> ${data.reduce((sum, item) => sum + item.valorAvaliado, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p><strong>Diferença Total:</strong> ${data.reduce((sum, item) => sum + item.diferenca, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      </body>
      </html>
    `;

    // Cria blob com conteúdo HTML
    const blob = new Blob([htmlContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Cria link para download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Arquivo Word exportado com sucesso');
  } catch (error) {
    console.error('Erro ao exportar para Word:', error);
    throw new Error('Erro ao exportar arquivo Word');
  }
};

export const exportToPDF = async (data: ExportData[], fileName: string = 'relatorio_rvr', assinaturaDigital?: string) => {
  try {
    const pdf = new jsPDF();
    
    // Configurações
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Título
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório de Reavaliação de Valor de Referência (RVR)', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Informações gerais
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 10;
    pdf.text(`Total de Imóveis: ${data.length}`, margin, yPosition);
    yPosition += 15;

    // Cabeçalho da tabela
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    const headers = ['Nome', 'Categoria', 'Valor Original', 'Valor Avaliado', 'Diferença', '%'];
    const colWidths = [40, 25, 30, 30, 30, 15];
    let xPosition = margin;

    headers.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    yPosition += 10;

    // Dados da tabela
    pdf.setFont('helvetica', 'normal');
    data.forEach((item, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      xPosition = margin;
      const values = [
        item.nome.substring(0, 25) + (item.nome.length > 25 ? '...' : ''),
        item.categoria,
        item.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        item.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        item.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        `${item.percentual.toFixed(1)}%`
      ];

      values.forEach((value, colIndex) => {
        pdf.text(value, xPosition, yPosition);
        xPosition += colWidths[colIndex];
      });
      yPosition += 8;
    });

    // Resumo
    yPosition += 10;
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('Resumo:', margin, yPosition);
    yPosition += 10;

    pdf.setFont('helvetica', 'normal');
    const valorTotalOriginal = data.reduce((sum, item) => sum + item.valorOriginal, 0);
    const valorTotalAvaliado = data.reduce((sum, item) => sum + item.valorAvaliado, 0);
    const diferencaTotal = data.reduce((sum, item) => sum + item.diferenca, 0);

    pdf.text(`Valor Total Original: ${valorTotalOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Valor Total Avaliado: ${valorTotalAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Diferença Total: ${diferencaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margin, yPosition);
    yPosition += 15;

    // Assinatura digital
    if (assinaturaDigital) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.text('Assinatura Digital:', margin, yPosition);
      yPosition += 8;
      pdf.text(assinaturaDigital, margin, yPosition);
      yPosition += 8;
      pdf.text(`Timestamp: ${new Date().toISOString()}`, margin, yPosition);
    }

    // Salva o PDF
    pdf.save(`${fileName}.pdf`);
    
    console.log('Arquivo PDF exportado com sucesso');
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error);
    throw new Error('Erro ao exportar arquivo PDF');
  }
};
