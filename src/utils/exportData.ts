import * as XLSX from 'xlsx';

export interface ExportData {
  title: string;
  data: any[];
  selectedFields: string[];
  includeAggregation?: boolean;
  fieldLabels?: Record<string, string>;
}

const BOOLEAN_FIELDS = [
  'almoxarifado', 'alojamento_feminino', 'alojamento_masculino', 'alojamento_misto',
  'area_de_servico', 'area_de_uso_compartilhado_com_outros_orgaos', 'arquivo', 'auditorio',
  'banheiro_para_zeladoria', 'banheiro_feminino_para_servidoras', 'banheiro_masculino_para_servidores',
  'banheiro_misto_para_servidores', 'box_com_chuveiro_externo', 'box_para_lavagem_de_veiculos',
  'canil', 'casa_de_maquinas', 'central_de_gas', 'cobertura_para_aglomeracao_de_usuarios',
  'cobertura_para_fiscalizacao_de_veiculos', 'copa_e_cozinha', 'deposito_de_lixo',
  'deposito_de_materiais_de_descarte_e_baixa', 'deposito_de_material_de_limpeza',
  'deposito_de_material_operacional', 'estacionamento_para_usuarios', 'garagem_para_servidores',
  'garagem_para_viaturas', 'lavabo_para_servidores_sem_box_para_chuveiro',
  'local_para_custodia_temporaria_de_detidos', 'local_para_guarda_provisoria_de_animais',
  'patio_de_retencao_de_veiculos', 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos',
  'ponto_de_pouso_para_aeronaves', 'rampa_de_fiscalizacao_de_veiculos', 'recepcao',
  'sala_administrativa_escritorio', 'sala_de_assepsia', 'sala_de_aula', 'sala_de_reuniao',
  'sala_de_revista_pessoal', 'sala_operacional_observatorio', 'sala_tecnica', 'sanitario_publico',
  'telefone_publico', 'torre_de_telecomunicacoes', 'vestiario_para_nao_policiais',
  'vestiario_para_policiais', 'fornecimento_de_agua', 'fornecimento_de_energia_eletrica',
  'esgotamento_sanitario', 'conexao_de_internet', 'possui_wireless_wifi', 'identidade_visual',
  'blindagem', 'abastecimento_de_agua', 'energia_eletrica_de_emergencia', 'iluminacao_externa',
  'protecao_contra_incendios', 'protecao_contra_intrusao', 'radiocomunicacao',
  'cabeamento_estruturado', 'claviculario', 'sala_cofre', 'concertina', 'muro_ou_alambrado',
  'acessibilidade', 'sustentabilidade', 'aproveitamento_da_agua_da_chuva', 'energia_solar',
  'climatizacao_de_ambientes', 'coleta_de_lixo', 'ha_contrato_de_manutencao_predial',
  'ha_plano_de_manutencao_do_imovel', 'o_trecho_e_concessionado', 'adere_ao_pgprf_teletrabalho'
];

const isSim = (val: any) => {
  const s = String(val || '').toLowerCase().trim();
  return s === 'sim' || s === 'on' || s === 'true' || s === '1';
};

const buildAggregationSheet = (data: any[], selectedFields: string[], labels: Record<string, string>): any[][] => {
  const boolFields = selectedFields.filter(f => BOOLEAN_FIELDS.includes(f));
  if (boolFields.length === 0) return [];

  const hasUG = selectedFields.includes('unidade_gestora');
  const hasAno = selectedFields.includes('ano_caip');

  const uniqueUGs = hasUG
    ? [...new Set(data.map(d => d.unidade_gestora || 'Não informado'))].sort() as string[]
    : ['Todos'];
  const uniqueAnos = hasAno
    ? [...new Set(data.map(d => d.ano_caip || 'N/I'))].sort() as string[]
    : ['Todos'];

  const rows: any[][] = [];

  boolFields.forEach((field, fieldIdx) => {
    if (fieldIdx > 0) rows.push([]);

    rows.push([labels[field] || field]);

    const header1: any[] = [hasUG ? 'Unidade Gestora' : ''];
    uniqueAnos.forEach(ano => { header1.push(hasAno ? ano : 'Total', ''); });
    header1.push('Total Geral', '');
    rows.push(header1);

    const header2: any[] = [''];
    uniqueAnos.forEach(() => { header2.push('Sim (qtd/total)', '%'); });
    header2.push('Sim (qtd/total)', '%');
    rows.push(header2);

    uniqueUGs.forEach(ug => {
      const ugItems = hasUG ? data.filter(d => (d.unidade_gestora || 'Não informado') === ug) : data;
      const row: any[] = [hasUG ? ug : 'Todos'];

      uniqueAnos.forEach(ano => {
        const cellItems = hasAno ? ugItems.filter(d => (d.ano_caip || 'N/I') === ano) : ugItems;
        const simCount = cellItems.filter(d => isSim(d[field])).length;
        const total = cellItems.length;
        const pct = total > 0 ? ((simCount / total) * 100).toFixed(1).replace('.', ',') + '%' : '-';
        row.push(total > 0 ? `${simCount}/${total}` : '-', pct);
      });

      const ugSim = ugItems.filter(d => isSim(d[field])).length;
      const ugTotal = ugItems.length;
      row.push(ugTotal > 0 ? `${ugSim}/${ugTotal}` : '-', ugTotal > 0 ? ((ugSim / ugTotal) * 100).toFixed(1).replace('.', ',') + '%' : '-');
      rows.push(row);
    });

    const totalRow: any[] = ['TOTAL'];
    uniqueAnos.forEach(ano => {
      const anoItems = hasAno ? data.filter(d => (d.ano_caip || 'N/I') === ano) : data;
      const simCount = anoItems.filter(d => isSim(d[field])).length;
      const anoTotal = anoItems.length;
      totalRow.push(anoTotal > 0 ? `${simCount}/${anoTotal}` : '-', anoTotal > 0 ? ((simCount / anoTotal) * 100).toFixed(1).replace('.', ',') + '%' : '-');
    });
    const allSim = data.filter(d => isSim(d[field])).length;
    totalRow.push(`${allSim}/${data.length}`, data.length > 0 ? ((allSim / data.length) * 100).toFixed(1).replace('.', ',') + '%' : '-');
    rows.push(totalRow);
  });

  return rows;
};

export const exportToExcel = (exportData: ExportData): void => {
  try {
    const labels = exportData.fieldLabels || {};

    const filteredData = exportData.data.map(row => {
      const filteredRow: any = {};
      exportData.selectedFields.forEach(field => {
        filteredRow[labels[field] || field] = row[field];
      });
      return filteredRow;
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

    if (exportData.includeAggregation) {
      const aggRows = buildAggregationSheet(exportData.data, exportData.selectedFields, labels);
      if (aggRows.length > 0) {
        const aggSheet = XLSX.utils.aoa_to_sheet(aggRows);
        XLSX.utils.book_append_sheet(workbook, aggSheet, 'Resumo Agregado');
      }
    }

    const fileName = `${exportData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Erro ao gerar arquivo Excel');
  }
};

export const exportToCSV = (exportData: ExportData): void => {
  try {
    const filteredData = exportData.data.map(row => {
      const filteredRow: any = {};
      exportData.selectedFields.forEach(field => {
        filteredRow[field] = row[field];
      });
      return filteredRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

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
