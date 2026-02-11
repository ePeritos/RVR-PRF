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
  zona?: string;
  coordenadas?: string;
  fornecimento_de_agua?: string;
  fornecimento_de_energia_eletrica?: string;
  esgotamento_sanitario?: string;
  conexao_de_internet?: string;
  possui_wireless_wifi?: string;
  climatizacao_de_ambientes?: string;
  sala_cofre?: string;
  protecao_contra_incendios?: string;
  protecao_contra_intrusao?: string;
  muro_ou_alambrado?: string;
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
  const ufCub = (data.parametros as any)?.uf || uf;
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

      {/* I. DADOS GERAIS */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>I. DADOS GERAIS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
          <div><strong>Endereço:</strong> {data.endereco || '[Endereço do imóvel]'}</div>
          <div><strong>Finalidade:</strong> Avaliação para fins de gestão patrimonial</div>
          <div><strong>Solicitante:</strong> {solicitante}</div>
          <div><strong>Data da Vistoria:</strong> {format(currentDate, 'dd/MM/yyyy')}</div>
          <div><strong>Data-base da Avaliação:</strong> {format(dataReferencia, 'dd/MM/yyyy')}</div>
          <div><strong>Responsável Técnico:</strong> {nomeResponsavel}</div>
          <div><strong>Registro Profissional:</strong> {registroResponsavel}</div>
        </div>
      </section>

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

      {/* III. IDENTIFICAÇÃO E CARACTERIZAÇÃO DO IMÓVEL */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>III. IDENTIFICAÇÃO E CARACTERIZAÇÃO DO IMÓVEL</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
          <div><strong>Tipo:</strong> {data.categoria}</div>
          <div><strong>RIP:</strong> {data.rip || '[Número RIP]'}</div>
          <div><strong>Matrícula:</strong> {data.matriculaImovel || '[Número da Matrícula]'}</div>
          <div><strong>Cartório:</strong> [Nome do Cartório]</div>
          <div><strong>Endereço Completo:</strong> {data.endereco || '[Endereço detalhado]'}</div>
          <div><strong>CEP:</strong> [CEP]</div>
          <div><strong>Área do Terreno:</strong> {areaTerreno.toLocaleString('pt-BR')} m²</div>
          <div><strong>Área Construída:</strong> {areaBenfeitoria.toLocaleString('pt-BR')} m²</div>
          <div><strong>Área Total:</strong> {(areaTerreno + areaBenfeitoria).toLocaleString('pt-BR')} m²</div>
          <div><strong>Situação:</strong> {data.situacaoImovel}</div>
        </div>
      </section>

      {/* IV. CARACTERÍSTICAS DO TERRENO E DA REGIÃO */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>IV. CARACTERÍSTICAS DO TERRENO E DA REGIÃO</h2>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '8px' }}><strong>Área do Terreno:</strong> {areaTerreno.toLocaleString('pt-BR')} m²</div>
          <div style={{ marginBottom: '8px' }}><strong>Endereço:</strong> {data.endereco || '[Endereço não informado]'}</div>
          <div style={{ marginBottom: '8px' }}><strong>Zona:</strong> {data.zona || 'Urbana'}</div>
          <div style={{ marginBottom: '8px' }}><strong>Coordenadas:</strong> {data.coordenadas || '[Coordenadas não informadas]'}</div>
          <div style={{ marginBottom: '8px' }}><strong>Situação do Imóvel:</strong> {data.situacaoImovel || '[Não informado]'}</div>
          <div style={{ marginBottom: '8px' }}><strong>Matrícula:</strong> {data.matriculaImovel || '[Não informado]'}</div>
          <div style={{ marginBottom: '8px' }}><strong>RIP:</strong> {data.rip || '[Não informado]'}</div>
          <div style={{ marginBottom: '8px' }}><strong>Tipo de Imóvel:</strong> {data.categoria}</div>
        </div>
      </section>

      {/* V. CARACTERÍSTICAS DAS BENFEITORIAS */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>V. CARACTERÍSTICAS DAS BENFEITORIAS</h2>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '8px' }}><strong>Área Construída:</strong> {areaBenfeitoria.toLocaleString('pt-BR')} m²</div>
          <div style={{ marginBottom: '8px' }}><strong>Descrição Geral:</strong> Edificação destinada a {data.categoria}</div>
          <div style={{ marginBottom: '8px' }}><strong>Tipo de Uso:</strong> Institucional - Segurança Pública</div>
          <div style={{ marginBottom: '8px' }}><strong>Idade Aparente:</strong> {idadeAparente ? `${idadeAparente} anos` : '[Não informado]'}</div>
          <div style={{ marginBottom: '8px' }}><strong>Vida Útil Estimada:</strong> {vidaUtil ? `${vidaUtil} anos` : '[Não informado]'}</div>
          <div style={{ marginBottom: '8px' }}><strong>Estado de Conservação:</strong> {estadoConservacao || '[Não informado]'}</div>
          <div style={{ marginBottom: '8px' }}><strong>Padrão Construtivo:</strong> {data.parametros?.padraoConstrutivo || '[Não informado]'}</div>
          
          {/* Ambientes e Características Técnicas */}
          <div style={{ marginTop: '16px' }}>
            <strong>Infraestrutura Disponível:</strong>
            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <div>• Fornecimento de Água: {data.fornecimento_de_agua === 'true' ? 'Sim' : 'Não'}</div>
              <div>• Energia Elétrica: {data.fornecimento_de_energia_eletrica === 'true' ? 'Sim' : 'Não'}</div>
              <div>• Esgotamento Sanitário: {data.esgotamento_sanitario === 'true' ? 'Sim' : 'Não'}</div>
              <div>• Internet: {data.conexao_de_internet === 'true' ? 'Sim' : 'Não'}</div>
              <div>• Wi-Fi: {data.possui_wireless_wifi === 'true' ? 'Sim' : 'Não'}</div>
              <div>• Climatização: {data.climatizacao_de_ambientes === 'true' ? 'Sim' : 'Não'}</div>
            </div>
          </div>

          {/* Sistemas de Segurança */}
          <div style={{ marginTop: '16px' }}>
            <strong>Sistemas de Segurança:</strong>
            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <div>• Sala Cofre: {data.sala_cofre === 'true' ? 'Sim' : 'Não'}</div>
              <div>• Proteção contra Incêndio: {data.protecao_contra_incendios === 'true' ? 'Sim' : 'Não'}</div>
              <div>• Proteção contra Intrusão: {data.protecao_contra_intrusao === 'true' ? 'Sim' : 'Não'}</div>
              <div>• Muro/Alambrado: {data.muro_ou_alambrado === 'true' ? 'Sim' : 'Não'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* VI. CONSIDERAÇÕES, PRESSUPOSTOS, RESSALVAS E FATORES LIMITANTES */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>VI. CONSIDERAÇÕES, PRESSUPOSTOS, RESSALVAS E FATORES LIMITANTES</h2>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>6.1. A presente avaliação foi elaborada em conformidade com:</p>
          <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '4px' }}>Instrução Normativa SPU/MGI nº 98, de 10 de março de 2025</li>
            <li style={{ marginBottom: '4px' }}>Portaria STN/SPU nº 10, de 27 de janeiro de 2023</li>
            <li style={{ marginBottom: '4px' }}>NBR 14653-1:2019 - Avaliação de bens - Parte 1: Procedimentos gerais</li>
            <li style={{ marginBottom: '4px' }}>NBR 14653-2:2011 - Avaliação de bens - Parte 2: Imóveis urbanos</li>
          </ul>
          <p style={{ marginBottom: '8px' }}>6.2. Os valores de referência utilizados têm as seguintes fontes e datas-base:</p>
          <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginBottom: '12px' }}>
            <li style={{ marginBottom: '4px' }}>Valor unitário do terreno: {valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m² - Fonte: [Fonte] - Data-base: {format(currentDate, 'MM/yyyy')}</li>
            <li style={{ marginBottom: '4px' }}>CUB/m²: {cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m² - Fonte: SINDUSCON/{ufCub} - Data-base: {format(currentDate, 'MM/yyyy')}</li>
          </ul>
          <p style={{ marginBottom: '8px' }}>6.3. A avaliação refere-se ao imóvel nas condições em que se encontra na data da vistoria.</p>
          <p>6.4. Este relatório destina-se exclusivamente à finalidade declarada no item I.</p>
        </div>
      </section>

      {/* VII. MEMORIAL DE CÁLCULO */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>VII. MEMORIAL DE CÁLCULO</h2>
        
        {/* A. Avaliação do Terreno */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>A. Avaliação do Terreno (Vt)</h3>
          <div style={{ fontSize: '12px', lineHeight: '1.6', marginLeft: '16px' }}>
            <p style={{ marginBottom: '8px' }}><strong>Método Adotado:</strong> Comparativo direto de dados de mercado</p>
            
            <p style={{ marginBottom: '8px' }}><strong>Passo 1: Identificação do Valor Unitário do Terreno</strong></p>
            <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
              <li>Fonte: {data.parametros?.fonteValorTerreno || '[Fonte do valor unitário]'}</li>
              <li>Data-Base da Fonte: {format(dataReferencia, 'MM/yyyy')}</li>
              <li>Valor Unitário (VU<sub>terreno</sub>): {valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</li>
            </ul>
            
            <p style={{ marginBottom: '8px' }}><strong>Passo 2: Área do Terreno (A<sub>terreno</sub>)</strong></p>
            <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
              <li>A<sub>terreno</sub>: {areaTerreno.toLocaleString('pt-BR')} m²</li>
            </ul>
            
            <p style={{ marginBottom: '8px' }}><strong>Passo 3: Cálculo do Valor do Terreno (Vt)</strong></p>
            <ul style={{ listStyleType: 'disc', marginLeft: '16px' }}>
              <li>Fórmula: Vt = A<sub>terreno</sub> × VU<sub>terreno</sub></li>
              <li>Cálculo: Vt = {areaTerreno.toLocaleString('pt-BR')} m² × {valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</li>
              <li><strong>Resultado Vt: {valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
            </ul>
          </div>
        </div>

        {/* B. Avaliação das Benfeitorias */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>B. Avaliação das Benfeitorias (Vb) – Método Evolutivo</h3>
          <div style={{ fontSize: '12px', lineHeight: '1.6', marginLeft: '16px' }}>
            <p style={{ marginBottom: '8px' }}><strong>Fórmula Geral:</strong> Vb = Custo de Reedição (CR) - Depreciação (D)</p>
            
            {/* B.1 Custo de Reedição */}
            <div style={{ marginTop: '12px' }}>
              <p style={{ marginBottom: '8px' }}><strong>B.1. Cálculo do Custo de Reedição (CR) da Benfeitoria</strong></p>
              <p style={{ marginBottom: '8px' }}><strong>Fórmula:</strong> CR = Área da Benfeitoria (A<sub>benf</sub>) × CUB/m² × (1 + BDI (%))</p>
              
              <p style={{ marginBottom: '8px' }}><strong>Passo 1: Área da Benfeitoria (A<sub>benf</sub>)</strong></p>
              <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
                <li>A<sub>benf</sub>: {areaBenfeitoria.toLocaleString('pt-BR')} m²</li>
              </ul>
              
              <p style={{ marginBottom: '8px' }}><strong>Passo 2: Custo Unitário Básico (CUB/m²)</strong></p>
              <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
                <li>Padrão Construtivo: {data.parametros?.padraoConstrutivo || '[Não informado]'}</li>
                <li>Fonte: SINDUSCON/{ufCub}</li>
                <li>Data-Base do CUB: {format(dataReferencia, 'MM/yyyy')}</li>
                <li>Valor do CUB/m²: {cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</li>
              </ul>
              
              <p style={{ marginBottom: '8px' }}><strong>Passo 3: Benefícios e Despesas Indiretas (BDI)</strong></p>
              <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
                <li>Percentual BDI: {bdiPercentual.toFixed(0)}%</li>
              </ul>
              
              <p style={{ marginBottom: '8px' }}><strong>Passo 4: Cálculo do Custo de Reedição (CR)</strong></p>
              <ul style={{ listStyleType: 'disc', marginLeft: '16px' }}>
                <li>Cálculo: CR = {areaBenfeitoria.toLocaleString('pt-BR')} m² × {cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m² × (1 + {(bdiPercentual/100).toFixed(2)})</li>
                <li>CR = {areaBenfeitoria.toLocaleString('pt-BR')} × {cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {(1 + bdiPercentual/100).toFixed(2)}</li>
                <li><strong>Resultado CR: {custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
              </ul>
            </div>

            {/* B.2 Depreciação */}
            {idadeAparente && vidaUtil && estadoConservacao && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ marginBottom: '8px' }}><strong>B.2. Cálculo da Depreciação (D) da Benfeitoria – Método de Ross-Heidecke</strong></p>
                <p style={{ marginBottom: '8px' }}><strong>Fórmula:</strong> D = CR × K (Coeficiente de Depreciação)</p>
                
                <p style={{ marginBottom: '8px' }}><strong>Passo 1: Idade Aparente (IA)</strong></p>
                <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
                  <li>IA: {idadeAparente} anos</li>
                </ul>
                
                <p style={{ marginBottom: '8px' }}><strong>Passo 2: Vida Útil Estimada (VU)</strong></p>
                <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
                  <li>VU: {vidaUtil} anos</li>
                </ul>
                
                <p style={{ marginBottom: '8px' }}><strong>Passo 3: Cálculo da Idade Percentual (IP)</strong></p>
                <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
                  <li>Fórmula: IP = (IA/VU) × 100</li>
                  <li>Cálculo: IP = ({idadeAparente}/{vidaUtil}) × 100 = {idadePercentual.toFixed(2)}%</li>
                </ul>
                
                <p style={{ marginBottom: '8px' }}><strong>Passo 4: Estado de Conservação (EC)</strong></p>
                <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
                  <li>EC: {estadoConservacao}</li>
                </ul>
                
                <p style={{ marginBottom: '8px' }}><strong>Passo 5: Identificação do Coeficiente de Depreciação (K)</strong></p>
                <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
                  <li>K = {coeficienteK.toFixed(3)} (conforme Tabela de Ross-Heidecke para IP = {idadePercentual.toFixed(2)}% e EC = {estadoConservacao})</li>
                  <li>Fonte do Coeficiente K: Tabela de Ross-Heidecke</li>
                </ul>
                
                <p style={{ marginBottom: '8px' }}><strong>Passo 6: Cálculo da Depreciação (D)</strong></p>
                <ul style={{ listStyleType: 'disc', marginLeft: '16px' }}>
                  <li>Cálculo: D = {custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {coeficienteK.toFixed(2)}</li>
                  <li><strong>Resultado D: {depreciacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
                </ul>
              </div>
            )}

            {/* B.3 Valor da Benfeitoria */}
            <div style={{ marginTop: '12px' }}>
              <p style={{ marginBottom: '8px' }}><strong>B.3. Cálculo do Valor da Benfeitoria (Vb)</strong></p>
              <ul style={{ listStyleType: 'disc', marginLeft: '16px' }}>
                <li>Fórmula: Vb = CR - D</li>
                <li>Cálculo: Vb = {custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - {depreciacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                <li><strong>Resultado Vb: {valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* C. Valor Total do Imóvel */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>C. Cálculo do Valor Total do Imóvel (Vi)</h3>
          <div style={{ fontSize: '12px', lineHeight: '1.6', marginLeft: '16px' }}>
            <ul style={{ listStyleType: 'disc', marginLeft: '16px' }}>
              <li>Fórmula: Vi = Vt + Vb</li>
              <li>Cálculo: Vi = {valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} + {valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
              <li><strong>Resultado Vi: {valorImovel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
            </ul>
          </div>
        </div>

        {/* D. Valor Adotado */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>D. Cálculo do Valor Adotado</h3>
          <div style={{ fontSize: '12px', lineHeight: '1.6', marginLeft: '16px' }}>
            <p style={{ marginBottom: '8px' }}><strong>Fórmula:</strong> Valor Adotado = Vi × Fator de Comercialização (Fc)</p>
            
            <p style={{ marginBottom: '8px' }}><strong>Passo 1: Fator de Comercialização (Fc)</strong></p>
            <ul style={{ listStyleType: 'disc', marginLeft: '16px', marginBottom: '12px' }}>
              <li>Fc: {fatorComercializacao.toFixed(2)}</li>
            </ul>
            
            <p style={{ marginBottom: '8px' }}><strong>Passo 2: Cálculo do Valor Adotado</strong></p>
            <ul style={{ listStyleType: 'disc', marginLeft: '16px' }}>
              <li>Cálculo: Valor Adotado = {valorImovel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {fatorComercializacao.toFixed(2)}</li>
              <li><strong>Resultado Valor Adotado: {valorAdotado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* VIII. ANEXOS */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', backgroundColor: '#f3f4f6', padding: '8px' }}>VIII. ANEXOS</h2>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '4px' }}>• Fotografias do imóvel</div>
          <div style={{ marginBottom: '4px' }}>• Documentação consultada</div>
          <div style={{ marginBottom: '4px' }}>• Planilhas de cálculo</div>
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