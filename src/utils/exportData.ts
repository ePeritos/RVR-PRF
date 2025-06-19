import * as XLSX from 'xlsx';

export interface ExportData {
  title: string;
  data: any[];
  selectedFields: string[];
}

export const exportToExcel = (exportData: ExportData): void => {
  try {
    // Filtrar apenas os campos selecionados
    const filteredData = exportData.data.map(row => {
      const filteredRow: any = {};
      exportData.selectedFields.forEach(field => {
        filteredRow[field] = row[field];
      });
      return filteredRow;
    });

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Adicionar a planilha ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

    // Gerar nome do arquivo
    const fileName = `${exportData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Salvar arquivo
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Erro ao gerar arquivo Excel');
  }
};

export const exportToCSV = (exportData: ExportData): void => {
  try {
    // Filtrar apenas os campos selecionados
    const filteredData = exportData.data.map(row => {
      const filteredRow: any = {};
      exportData.selectedFields.forEach(field => {
        filteredRow[field] = row[field];
      });
      return filteredRow;
    });

    // Converter para CSV
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    // Criar blob e download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${exportData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    throw new Error('Erro ao gerar arquivo CSV');
  }
};