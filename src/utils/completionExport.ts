import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

const IMAGE_FIELDS = [
  { key: 'imagem_geral', label: 'Imagem Geral' },
  { key: 'imagem_fachada', label: 'Fachada' },
  { key: 'imagem_lateral_1', label: 'Lateral 1' },
  { key: 'imagem_lateral_2', label: 'Lateral 2' },
  { key: 'imagem_fundos', label: 'Fundos' },
  { key: 'imagem_sala_cofre', label: 'Sala Cofre' },
  { key: 'imagem_cofre', label: 'Cofre' },
  { key: 'imagem_interna_alojamento_masculino', label: 'Alojamento Masculino' },
  { key: 'imagem_interna_alojamento_feminino', label: 'Alojamento Feminino' },
  { key: 'imagem_interna_plantao_uop', label: 'Plantão UOP' },
];

const getStatus = (pct: number) => {
  if (pct >= 80) return 'Completo';
  if (pct >= 50) return 'Parcial';
  return 'Baixo';
};

interface RegionalRow {
  unidade: string;
  totalImoveis: number;
  mediaPreenchimento: number;
  completosCount: number;
  parcialCount: number;
  baixoCount: number;
}

function buildRegionalStats(data: any[]): RegionalRow[] {
  const map = new Map<string, { total: number; soma: number; completos: number; parcial: number; baixo: number }>();
  data.forEach(item => {
    const ug = item.unidade_gestora || 'Não informado';
    const pct = Math.min(parseFloat(item.percentual_preenchimento || '0'), 100);
    const existing = map.get(ug) || { total: 0, soma: 0, completos: 0, parcial: 0, baixo: 0 };
    existing.total += 1;
    existing.soma += pct;
    if (pct >= 80) existing.completos += 1;
    else if (pct >= 50) existing.parcial += 1;
    else existing.baixo += 1;
    map.set(ug, existing);
  });
  return Array.from(map.entries())
    .map(([unidade, s]) => ({
      unidade,
      totalImoveis: s.total,
      mediaPreenchimento: Math.round(s.soma / s.total),
      completosCount: s.completos,
      parcialCount: s.parcial,
      baixoCount: s.baixo,
    }))
    .sort((a, b) => a.mediaPreenchimento - b.mediaPreenchimento);
}

export function exportCompletionToExcel(data: any[]) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumo por Regional
  const regional = buildRegionalStats(data);
  const regionalSheet = XLSX.utils.json_to_sheet(regional.map(r => ({
    'Regional': r.unidade,
    'Total Imóveis': r.totalImoveis,
    'Média Preenchimento (%)': r.mediaPreenchimento,
    'Completos (≥80%)': r.completosCount,
    'Parciais (50-79%)': r.parcialCount,
    'Baixo (<50%)': r.baixoCount,
    'Status': getStatus(r.mediaPreenchimento),
  })));
  XLSX.utils.book_append_sheet(wb, regionalSheet, 'Resumo Regional');

  // Sheet 2: Detalhamento por Imóvel
  const imoveis = data
    .map(item => {
      const pct = Math.min(parseFloat(item.percentual_preenchimento || '0'), 100);
      return {
        'Nome da Unidade': item.nome_da_unidade || 'Sem nome',
        'Tipo de Unidade': item.tipo_de_unidade || '-',
        'Unidade Gestora': item.unidade_gestora || 'Não informado',
        'Preenchimento (%)': pct,
        'Status': getStatus(pct),
      };
    })
    .sort((a, b) => a['Preenchimento (%)'] - b['Preenchimento (%)']);
  const imoveisSheet = XLSX.utils.json_to_sheet(imoveis);
  XLSX.utils.book_append_sheet(wb, imoveisSheet, 'Detalhamento Imóveis');

  // Sheet 3: Preenchimento de Imagens
  const total = data.length;
  const imgRows = IMAGE_FIELDS.map(f => {
    const count = data.filter(item => item[f.key] && item[f.key] !== '').length;
    return {
      'Tipo de Imagem': f.label,
      'Imóveis com Imagem': count,
      'Total Imóveis': total,
      'Preenchimento (%)': total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
  const imgSheet = XLSX.utils.json_to_sheet(imgRows);
  XLSX.utils.book_append_sheet(wb, imgSheet, 'Preenchimento Imagens');

  const fileName = `preenchimento_caip_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportCompletionToPDF(data: any[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const addHeader = () => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Preenchimento CAIP', margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} — Total de imóveis: ${data.length}`, margin, y);
    y += 10;
  };

  const checkPage = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // --- Resumo Global ---
  addHeader();
  const totalLen = data.length;
  let soma = 0, completos = 0, parcial = 0, baixo = 0;
  data.forEach(item => {
    const pct = Math.min(parseFloat(item.percentual_preenchimento || '0'), 100);
    soma += pct;
    if (pct >= 80) completos++;
    else if (pct >= 50) parcial++;
    else baixo++;
  });
  const media = totalLen > 0 ? Math.round(soma / totalLen) : 0;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Global', margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Média Global: ${media}%  |  Completos (≥80%): ${completos}  |  Parciais (50-79%): ${parcial}  |  Baixo (<50%): ${baixo}`, margin, y);
  y += 10;

  // --- Tabela Regional ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento por Regional', margin, y);
  y += 6;

  const regional = buildRegionalStats(data);
  const colWidths = [60, 25, 30, 25, 25, 25, 25];
  const headers = ['Regional', 'Imóveis', 'Média (%)', 'Completos', 'Parciais', 'Baixo', 'Status'];

  // Header row
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 3, colWidths.reduce((a, b) => a + b, 0), 6, 'F');
  let x = margin;
  headers.forEach((h, i) => { doc.text(h, x + 1, y); x += colWidths[i]; });
  y += 5;

  doc.setFont('helvetica', 'normal');
  regional.forEach(r => {
    checkPage(5);
    x = margin;
    const row = [r.unidade, String(r.totalImoveis), `${r.mediaPreenchimento}%`, String(r.completosCount), String(r.parcialCount), String(r.baixoCount), getStatus(r.mediaPreenchimento)];
    row.forEach((val, i) => { doc.text(val, x + 1, y); x += colWidths[i]; });
    y += 4.5;
  });
  y += 8;

  // --- Tabela Imóveis ---
  checkPage(20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento por Imóvel', margin, y);
  y += 6;

  const imColWidths = [80, 40, 50, 30, 25];
  const imHeaders = ['Nome da Unidade', 'Tipo', 'Unidade Gestora', 'Preench. (%)', 'Status'];

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 3, imColWidths.reduce((a, b) => a + b, 0), 6, 'F');
  x = margin;
  imHeaders.forEach((h, i) => { doc.text(h, x + 1, y); x += imColWidths[i]; });
  y += 5;

  doc.setFont('helvetica', 'normal');
  const sortedItems = [...data]
    .map(item => ({
      nome: (item.nome_da_unidade || 'Sem nome').substring(0, 45),
      tipo: (item.tipo_de_unidade || '-').substring(0, 22),
      ug: (item.unidade_gestora || 'N/I').substring(0, 28),
      pct: Math.min(parseFloat(item.percentual_preenchimento || '0'), 100),
    }))
    .sort((a, b) => a.pct - b.pct);

  sortedItems.forEach(item => {
    checkPage(5);
    x = margin;
    const row = [item.nome, item.tipo, item.ug, `${item.pct}%`, getStatus(item.pct)];
    row.forEach((val, i) => { doc.text(val, x + 1, y); x += imColWidths[i]; });
    y += 4.5;
  });

  const fileName = `preenchimento_caip_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
