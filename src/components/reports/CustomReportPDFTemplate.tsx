import React from 'react';
import { ReportContent } from './ReportContent';

interface CustomReportData {
  titulo: string;
  descricao?: string;
  campos_incluidos: string[];
  incluir_imagens: boolean;
  dados: any[];
  total_imoveis: number;
  data_geracao: string;
  gerado_por: string;
}

interface CustomReportPDFTemplateProps {
  data: CustomReportData;
  className?: string;
}

export const CustomReportPDFTemplate: React.FC<CustomReportPDFTemplateProps> = ({
  data,
  className = ""
}) => {
  return (
    <div className={`w-full ${className}`} style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '12px',
      lineHeight: '1.4',
      padding: '0',
      margin: '0'
    }}>
      <ReportContent data={data} />
    </div>
  );
};