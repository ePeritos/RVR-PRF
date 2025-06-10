import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateRossHeidecke } from '@/utils/rossHeideckeCalculator';

interface RVRReportData {
  id: string;
  nome: string;
  categoria: string;
  valorOriginal: number;
  valorAvaliado: number;
  diferenca: number;
  percentual: number;
  areaImovel?: number;
  areaConstruida?: number;
  areaTerreno?: number;
  situacaoImovel?: string;
  unidadeGestora?: string;
  anoCAIP?: string;
  endereco?: string;
  rip?: string;
  matriculaImovel?: string;
  parametros?: {
    cub?: number;
    cubM2?: number;
    valorM2: number;
    bdi: number;
    dataReferencia?: string;
    fonteValorTerreno?: string;
    padraoConstrutivo?: string;
    responsavelTecnico?: {
      id: string;
      nome_completo: string;
      numero_registro: string;
      conselho: string;
      formacao: string;
      uf: string;
    };
  };
  responsavelTecnico?: {
    id: string;
    nome_completo: string;
    numero_registro: string;
    conselho: string;
    formacao: string;
    uf: string;
  };
  idadeAparente?: number;
  vidaUtil?: number;
  estadoConservacao?: string;
}

interface RVRReportPDFTemplateProps {
  data: RVRReportData;
  className?: string;
}

export function RVRReportPDFTemplate({ data, className = "" }: RVRReportPDFTemplateProps) {
  const currentDate = new Date();
  const reportNumber = `${data.id}/2025`;
  
  // USAR SEMPRE os parâmetros do formulário - NUNCA valores fixos/padrão
  const areaTerreno = data.areaTerreno || 0;
  const valorUnitarioTerreno = data.parametros?.valorM2;
  const areaBenfeitoria = data.areaConstruida || data.areaImovel || 0;
  const cubValor = data.parametros?.cubM2 || data.parametros?.cub;
  const bdiPercentual = data.parametros?.bdi;
  const idadeAparente = data.idadeAparente;
  const vidaUtil = data.vidaUtil;
  const estadoConservacao = data.estadoConservacao;
  const fatorComercializacao = 1.0;
  
  // Validar se os parâmetros obrigatórios estão presentes
  if (!valorUnitarioTerreno || !cubValor || bdiPercentual === undefined) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        color: 'black', 
        padding: '32px', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        fontSize: '14px', 
        lineHeight: '1.6' 
      }}>
        <div style={{ color: '#ef4444', textAlign: 'center' }}>
          <h2>Erro: Parâmetros não encontrados</h2>
          <p>Os parâmetros necessários (Valor M², CUB, BDI) não foram fornecidos.</p>
        </div>
      </div>
    );
  }
  
  // Cálculos do Memorial USANDO os parâmetros do formulário
  const valorTerreno = areaTerreno * valorUnitarioTerreno;
  const custoRedicao = areaBenfeitoria * cubValor * (1 + (bdiPercentual / 100));
  
  // Calcular depreciação usando Ross-Heidecke APENAS se dados estiverem disponíveis
  let rossHeideckeResult;
  let depreciacao = 0;
  let valorBenfeitoria = custoRedicao;
  let idadePercentual = 0;
  let coeficienteK = 0;
  
  if (idadeAparente && vidaUtil && estadoConservacao) {
    rossHeideckeResult = calculateRossHeidecke(
      custoRedicao,
      idadeAparente,
      vidaUtil,
      estadoConservacao
    );
    
    depreciacao = rossHeideckeResult.depreciacao;
    valorBenfeitoria = rossHeideckeResult.valorDepreciado;
    idadePercentual = rossHeideckeResult.idadePercentual;
    coeficienteK = rossHeideckeResult.coeficiente;
  }
  
  const valorImovel = valorTerreno + valorBenfeitoria;
  const valorAdotado = valorImovel * fatorComercializacao;

  // Dados do responsável técnico
  const responsavelTecnico = data.parametros?.responsavelTecnico || data.responsavelTecnico;
  const nomeResponsavel = responsavelTecnico?.nome_completo || '[Nome do Responsável Técnico]';
  const registroResponsavel = responsavelTecnico ? 
    `${responsavelTecnico.conselho}/${responsavelTecnico.uf} ${responsavelTecnico.numero_registro}` : 
    'CREA/[UF] [Número]';
  const formacaoResponsavel = responsavelTecnico?.formacao || 'Engenheiro Civil';

  // Extrair UF da unidade gestora ou usar dados do responsável
  const getUfFromUnidade = (unidadeGestora?: string) => {
    if (responsavelTecnico?.uf) return responsavelTecnico.uf;
    if (!unidadeGestora) return 'XX';
    const match = unidadeGestora.match(/([A-Z]{2})$/);
    return match ? match[1] : 'XX';
  };

  const uf = getUfFromUnidade(data.unidadeGestora);
  const solicitante = data.unidadeGestora || 'PRF/XX';

  // Data de referência dos parâmetros
  const dataReferencia = data.parametros?.dataReferencia ? new Date(data.parametros.dataReferencia) : currentDate;

  return (
    <div style={{ 
      backgroundColor: 'white', 
      color: 'black', 
      padding: '32px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      fontSize: '14px', 
      lineHeight: '1.6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Cabeçalho Oficial */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>MINISTÉRIO DA JUSTIÇA E SEGURANÇA PÚBLICA</div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>POLÍCIA RODOVIÁRIA FEDERAL</div>
        <div style={{ fontSize: '12px', marginBottom: '24px' }}>SUPERINTENDÊNCIA REGIONAL NO ESTADO DE {uf}</div>
        
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>RELATÓRIO DE VALOR DE REFERÊNCIA (RVR)</h1>
        <div style={{ fontSize: '14px' }}>Nº {reportNumber}</div>
      </div>

      {/* II. RESULTADOS DA AVALIAÇÃO */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>II. RESULTADOS DA AVALIAÇÃO</h2>
        <div style={{ border: '1px solid #d1d5db' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>COMPONENTE</th>
                <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>VALOR (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>Terreno</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', fontWeight: '500' }}>
                  {valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>Benfeitorias</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', fontWeight: '500' }}>
                  {valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', fontWeight: 'bold' }}>Imóvel (Terreno + Benfeitorias)</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                  {valorImovel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>Fator de Comercialização</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>{fatorComercializacao.toFixed(2)}</td>
              </tr>
              <tr style={{ backgroundColor: '#f0fdf4' }}>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', fontWeight: 'bold', color: '#166534' }}>VALOR ADOTADO</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#166534', fontSize: '16px' }}>
                  {valorAdotado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>Liquidez</td>
                <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>Baixa</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* IX. RESPONSABILIDADE TÉCNICA */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>IX. RESPONSABILIDADE TÉCNICA</h2>
        <div style={{ fontSize: '12px' }}>
          <p style={{ marginBottom: '16px' }}>Declaro que o presente trabalho foi realizado com a observância dos preceitos da legislação e normas técnicas pertinentes.</p>

          <div style={{ textAlign: 'right', marginTop: '32px' }}>
            <div>{format(currentDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}</div>
          </div>
          
          <div style={{ marginTop: '32px', textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ borderTop: '1px solid black', width: '256px', margin: '0 auto 8px' }}></div>
            <div style={{ fontWeight: 'bold' }}>{nomeResponsavel}</div>
            <div>{formacaoResponsavel}</div>
            <div>{registroResponsavel}</div>
          </div>
        </div>
      </section>
      
      {/* Rodapé */}
      <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '16px', marginTop: '48px' }}>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          <p>Relatório de Valor de Referência (RVR) nº {reportNumber}</p>
          <p>Polícia Rodoviária Federal</p>
          <p>Gerado automaticamente em {format(currentDate, 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}</p>
        </div>
      </div>
    </div>
  );
}