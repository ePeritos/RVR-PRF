
import { RVRReportData } from './types';

export class HTMLGenerator {
  static createReportHTML(data: RVRReportData): string {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    return `
      <div style="width: 100%; max-width: 210mm; font-family: Arial, sans-serif; color: #000; background: white; padding: 20mm; box-sizing: border-box; line-height: 1.4;">
        
        <!-- Cabeçalho Principal -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #000;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 5px 0; color: #000; text-transform: uppercase;">
            RELATÓRIO DE VALOR DE REFERÊNCIA (RVR)
          </h1>
          <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #000;">
            Nº 1/2025
          </h2>
          <p style="font-size: 10px; margin: 0; color: #666;">
            Polícia Rodoviária Federal - Superintendência Regional
          </p>
        </div>

        <!-- I. DADOS GERAIS -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
            I. DADOS GERAIS
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; width: 30%; background-color: #f8f8f8;">
                Endereço:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                [Endereço do imóvel]
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Município/UF:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                [Município/UF]
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Finalidade:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                Avaliação para fins de conhecimento patrimonial
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Solicitante:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                Superintendência Regional da PRF/${data.unidadeGestora || '[UF]'}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Data da Vistoria:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                ${currentDate}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Data-base da Avaliação:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                ${currentDate}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Responsável Técnico:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                [Nome do Avaliador]
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Registro Profissional:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                CREA/[UF] [Número]
              </td>
            </tr>
          </table>
        </div>

        <!-- II. RESULTADOS DA AVALIAÇÃO -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
            II. RESULTADOS DA AVALIAÇÃO
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
            <thead>
              <tr style="background-color: #e0e0e0;">
                <th style="padding: 8px; border: 1px solid #000; font-weight: bold; text-align: center;">
                  COMPONENTE
                </th>
                <th style="padding: 8px; border: 1px solid #000; font-weight: bold; text-align: center;">
                  VALOR (R$)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 6px; border: 1px solid #000;">Terreno</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">R$ 180.000,00</td>
              </tr>
              <tr>
                <td style="padding: 6px; border: 1px solid #000;">Benfeitorias</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">R$ 236.250,00</td>
              </tr>
              <tr>
                <td style="padding: 6px; border: 1px solid #000;">Imóvel (Terreno + Benfeitorias)</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">R$ 416.250,00</td>
              </tr>
              <tr>
                <td style="padding: 6px; border: 1px solid #000;">Fator de Comercialização</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">1.00</td>
              </tr>
              <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td style="padding: 8px; border: 1px solid #000;">VALOR ADOTADO</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: right; color: #008000;">
                  ${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px; border: 1px solid #000;">Liquidez</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">Baixa</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- III. IDENTIFICAÇÃO E CARACTERIZAÇÃO DO IMÓVEL -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
            III. IDENTIFICAÇÃO E CARACTERIZAÇÃO DO IMÓVEL
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; width: 30%; background-color: #f8f8f8;">Tipo:</td>
              <td style="padding: 6px; border: 1px solid #000;">${data.categoria}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">RIP:</td>
              <td style="padding: 6px; border: 1px solid #000;">[Número RIP]</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Matrícula:</td>
              <td style="padding: 6px; border: 1px solid #000;">[Número da Matrícula]</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Cartório:</td>
              <td style="padding: 6px; border: 1px solid #000;">[Nome do Cartório]</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Endereço Completo:</td>
              <td style="padding: 6px; border: 1px solid #000;">[Endereço detalhado]</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">CEP:</td>
              <td style="padding: 6px; border: 1px solid #000;">[CEP]</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Área do Terreno:</td>
              <td style="padding: 6px; border: 1px solid #000;">1.200 m²</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Área Construída:</td>
              <td style="padding: 6px; border: 1px solid #000;">120 m²</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Área Total:</td>
              <td style="padding: 6px; border: 1px solid #000;">1.320 m²</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Situação:</td>
              <td style="padding: 6px; border: 1px solid #000;">${data.situacaoImovel || 'próprio'}</td>
            </tr>
          </table>
        </div>

        <!-- IV. CARACTERÍSTICAS DO TERRENO E DA REGIÃO -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
            IV. CARACTERÍSTICAS DO TERRENO E DA REGIÃO
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; width: 30%; background-color: #f8f8f8;">Formato:</td>
              <td style="padding: 6px; border: 1px solid #000;">Retangular</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Dimensões:</td>
              <td style="padding: 6px; border: 1px solid #000;">[Dimensões do terreno]</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Topografia:</td>
              <td style="padding: 6px; border: 1px solid #000;">Plana</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Situação:</td>
              <td style="padding: 6px; border: 1px solid #000;">Meio de quadra</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Uso do Solo:</td>
              <td style="padding: 6px; border: 1px solid #000;">Misto (residencial/comercial)</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Infraestrutura Urbana:</td>
              <td style="padding: 6px; border: 1px solid #000;">Completa (água, esgoto, energia elétrica, telefone, pavimentação)</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Transporte Público:</td>
              <td style="padding: 6px; border: 1px solid #000;">Disponível</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Zoneamento:</td>
              <td style="padding: 6px; border: 1px solid #000;">[Zona conforme legislação municipal]</td>
            </tr>
          </table>
        </div>

        <!-- V. CARACTERÍSTICAS DAS BENFEITORIAS -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
            V. CARACTERÍSTICAS DAS BENFEITORIAS
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; width: 30%; background-color: #f8f8f8;">Descrição Geral:</td>
              <td style="padding: 6px; border: 1px solid #000;">Edificação destinada a UOP</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Tipo de Uso:</td>
              <td style="padding: 6px; border: 1px solid #000;">Institucional - Segurança Pública</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Número de Pavimentos:</td>
              <td style="padding: 6px; border: 1px solid #000;">[Número]</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Estrutura:</td>
              <td style="padding: 6px; border: 1px solid #000;">Concreto armado</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Vedação:</td>
              <td style="padding: 6px; border: 1px solid #000;">Alvenaria de tijolos cerâmicos</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Cobertura:</td>
              <td style="padding: 6px; border: 1px solid #000;">Telhas cerâmicas</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Idade Aparente:</td>
              <td style="padding: 6px; border: 1px solid #000;">15 anos</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Estado de Conservação:</td>
              <td style="padding: 6px; border: 1px solid #000;">Bom</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Padrão Construtivo:</td>
              <td style="padding: 6px; border: 1px solid #000;">Médio</td>
            </tr>
          </table>
        </div>

        <!-- Nova página para seções seguintes -->
        <div style="page-break-before: always;">
          
          <!-- VI. CONSIDERAÇÕES, PRESSUPOSTOS, RESSALVAS E FATORES LIMITANTES -->
          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
              VI. CONSIDERAÇÕES, PRESSUPOSTOS, RESSALVAS E FATORES LIMITANTES
            </h3>
            
            <div style="margin-bottom: 15px;">
              <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">6.1. A presente avaliação foi elaborada em conformidade com:</h4>
              <ul style="margin: 0 0 15px 20px; font-size: 11px; line-height: 1.5;">
                <li>Instrução Normativa SPU/MGI nº 98, de 10 de março de 2025</li>
                <li>Portaria STN/SPU nº 10, de 27 de janeiro de 2023</li>
                <li>NBR 14653-1:2019 - Avaliação de bens - Parte 1: Procedimentos gerais</li>
                <li>NBR 14653-2:2011 - Avaliação de bens - Parte 2: Imóveis urbanos</li>
              </ul>
            </div>

            <div style="margin-bottom: 15px;">
              <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">6.2. Os valores de referência utilizados têm as seguintes fontes e datas-base:</h4>
              <ul style="margin: 0 0 15px 20px; font-size: 11px; line-height: 1.5;">
                <li>Valor unitário do terreno: R$ 150,00/m² - Fonte: [Fonte] - Data-base: 05/2025</li>
                <li>CUB/m²: R$ 2.100,00/m² - Fonte: SINDUSCON/[UF] - Data-base: 05/2025</li>
              </ul>
            </div>

            <p style="font-size: 11px; margin-bottom: 10px; line-height: 1.5;">
              <strong>6.3.</strong> A avaliação refere-se ao imóvel nas condições em que se encontra na data da vistoria.
            </p>
            
            <p style="font-size: 11px; margin-bottom: 10px; line-height: 1.5;">
              <strong>6.4.</strong> Este relatório destina-se exclusivamente à finalidade declarada no item I.
            </p>
          </div>

          <!-- VII. MEMORIAL DE CÁLCULO -->
          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
              VII. MEMORIAL DE CÁLCULO
            </h3>
            
            <!-- A. Avaliação do Terreno -->
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">A. Avaliação do Terreno (Vt)</h4>
              <p style="font-size: 11px; margin-bottom: 10px;"><strong>Método Adotado:</strong> Comparativo direto de dados de mercado</p>
              
              <div style="margin-bottom: 10px;">
                <p style="font-size: 11px; font-weight: bold; margin: 0 0 5px 0;">Passo 1: Identificação do Valor Unitário do Terreno</p>
                <ul style="margin: 0 0 10px 20px; font-size: 10px;">
                  <li>Fonte: [Fonte do valor unitário]</li>
                  <li>Data-Base da Fonte: 05/2025</li>
                  <li>Valor Unitário (VUterreno): R$ 150,00/m²</li>
                </ul>
              </div>

              <div style="margin-bottom: 10px;">
                <p style="font-size: 11px; font-weight: bold; margin: 0 0 5px 0;">Passo 2: Área do Terreno (Aterreno)</p>
                <p style="font-size: 10px; margin: 0 0 10px 20px;">Aterreno: 1.200 m²</p>
              </div>

              <div style="margin-bottom: 15px;">
                <p style="font-size: 11px; font-weight: bold; margin: 0 0 5px 0;">Passo 3: Cálculo do Valor do Terreno (Vt)</p>
                <ul style="margin: 0 0 10px 20px; font-size: 10px;">
                  <li>Fórmula: Vt = Aterreno × VUterreno</li>
                  <li>Cálculo: Vt = 1.200 m² × R$ 150,00/m²</li>
                  <li><strong>Resultado Vt: R$ 180.000,00</strong></li>
                </ul>
              </div>
            </div>

            <!-- B. Avaliação das Benfeitorias -->
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">B. Avaliação das Benfeitorias (Vb) – Método Evolutivo</h4>
              <p style="font-size: 11px; margin-bottom: 10px;"><strong>Fórmula Geral:</strong> Vb = Custo de Reedição (CR) - Depreciação (D)</p>
              
              <div style="margin-bottom: 15px;">
                <p style="font-size: 11px; font-weight: bold; margin: 0 0 5px 0;">B.1. Cálculo do Custo de Reedição (CR) da Benfeitoria</p>
                <p style="font-size: 10px; margin: 0 0 10px 0;"><strong>Fórmula:</strong> CR = Área da Benfeitoria (Abenf) × CUB/m² × (1 + BDI (%))</p>
                
                <div style="margin-left: 15px;">
                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 1: Área da Benfeitoria (Abenf)</p>
                  <p style="font-size: 10px; margin: 0 0 8px 10px;">Abenf: 120 m²</p>

                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 2: Custo Unitário Básico (CUB/m²)</p>
                  <ul style="margin: 0 0 8px 10px; font-size: 9px;">
                    <li>Padrão Construtivo: Médio</li>
                    <li>Fonte: SINDUSCON/[UF]</li>
                    <li>Data-Base do CUB: 05/2025</li>
                    <li>Valor do CUB/m²: R$ 2.100,00/m²</li>
                  </ul>

                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 3: Benefícios e Despesas Indiretas (BDI)</p>
                  <p style="font-size: 10px; margin: 0 0 8px 10px;">Percentual BDI: 0.25 (25%)</p>

                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 4: Cálculo do Custo de Reedição (CR)</p>
                  <ul style="margin: 0 0 10px 10px; font-size: 9px;">
                    <li>Cálculo: CR = 120 m² × R$ 2.100,00/m² × (1 + 0.25)</li>
                    <li>CR = 120 × R$ 2.100,00 × 1.25</li>
                    <li><strong>Resultado CR: R$ 315.000,00</strong></li>
                  </ul>
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <p style="font-size: 11px; font-weight: bold; margin: 0 0 5px 0;">B.2. Cálculo da Depreciação (D) da Benfeitoria – Método de Ross-Heidecke</p>
                <p style="font-size: 10px; margin: 0 0 10px 0;"><strong>Fórmula:</strong> D = CR × K (Coeficiente de Depreciação)</p>
                
                <div style="margin-left: 15px;">
                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 1: Idade Aparente (IA)</p>
                  <p style="font-size: 10px; margin: 0 0 8px 10px;">IA: 15 anos</p>

                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 2: Vida Útil Estimada (VU)</p>
                  <p style="font-size: 10px; margin: 0 0 8px 10px;">VU: 80 anos</p>

                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 3: Cálculo da Idade Percentual (IP)</p>
                  <ul style="margin: 0 0 8px 10px; font-size: 9px;">
                    <li>Fórmula: IP = (IA/VU) × 100</li>
                    <li>Cálculo: IP = (15/80) × 100 = 18.75%</li>
                  </ul>

                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 4: Estado de Conservação (EC)</p>
                  <p style="font-size: 10px; margin: 0 0 8px 10px;">EC: Bom</p>

                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 5: Identificação do Coeficiente de Depreciação (K)</p>
                  <ul style="margin: 0 0 8px 10px; font-size: 9px;">
                    <li>K = 0.25 (conforme Tabela de Ross-Heidecke para IP = 18.75% e EC = Bom)</li>
                    <li>Fonte do Coeficiente K: Tabela de Ross-Heidecke</li>
                  </ul>

                  <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 6: Cálculo da Depreciação (D)</p>
                  <ul style="margin: 0 0 10px 10px; font-size: 9px;">
                    <li>Cálculo: D = R$ 315.000,00 × 0.25</li>
                    <li><strong>Resultado D: R$ 78.750,00</strong></li>
                  </ul>
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <p style="font-size: 11px; font-weight: bold; margin: 0 0 5px 0;">B.3. Cálculo do Valor da Benfeitoria (Vb)</p>
                <ul style="margin: 0 0 10px 15px; font-size: 10px;">
                  <li>Fórmula: Vb = CR - D</li>
                  <li>Cálculo: Vb = R$ 315.000,00 - R$ 78.750,00</li>
                  <li><strong>Resultado Vb: R$ 236.250,00</strong></li>
                </ul>
              </div>
            </div>

            <!-- C. Cálculo do Valor Total -->
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">C. Cálculo do Valor Total do Imóvel (Vi)</h4>
              <ul style="margin: 0 0 10px 15px; font-size: 11px;">
                <li>Fórmula: Vi = Vt + Vb</li>
                <li>Cálculo: Vi = R$ 180.000,00 + R$ 236.250,00</li>
                <li><strong>Resultado Vi: R$ 416.250,00</strong></li>
              </ul>
            </div>

            <!-- D. Valor Adotado -->
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 12px; font-weight: bold; margin: 0 0 10px 0;">D. Cálculo do Valor Adotado</h4>
              <p style="font-size: 10px; margin: 0 0 5px 0;"><strong>Fórmula:</strong> Valor Adotado = Vi × Fator de Comercialização (Fc)</p>
              
              <div style="margin-left: 15px;">
                <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 1: Fator de Comercialização (Fc)</p>
                <p style="font-size: 10px; margin: 0 0 8px 10px;">Fc: 1.00</p>

                <p style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Passo 2: Cálculo do Valor Adotado</p>
                <ul style="margin: 0 0 10px 10px; font-size: 9px;">
                  <li>Cálculo: Valor Adotado = R$ 416.250,00 × 1.00</li>
                  <li><strong>Resultado Valor Adotado: ${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        <!-- Nova página para seções finais -->
        <div style="page-break-before: always;">
          
          <!-- VIII. ANEXOS -->
          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
              VIII. ANEXOS
            </h3>
            <ul style="margin: 0 0 15px 20px; font-size: 11px; line-height: 1.6;">
              <li>Plantas e croquis do imóvel</li>
              <li>Fotografias do imóvel</li>
              <li>Documentação consultada</li>
              <li>Planilhas de cálculo</li>
              <li>Referências de mercado utilizadas</li>
            </ul>
          </div>

          <!-- IX. RESPONSABILIDADE TÉCNICA -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 15px 0; color: #000; text-transform: uppercase;">
              IX. RESPONSABILIDADE TÉCNICA
            </h3>
            <p style="font-size: 11px; margin-bottom: 20px; line-height: 1.5;">
              Declaro que o presente trabalho foi realizado com a observância dos preceitos da legislação e normas técnicas pertinentes.
            </p>
            
            <div style="text-align: center; margin-top: 40px;">
              <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto 10px;">
                <p style="font-size: 11px; margin: 10px 0 5px; font-weight: bold;">[Nome do Responsável Técnico]</p>
                <p style="font-size: 10px; margin: 0;">Engenheiro Civil</p>
                <p style="font-size: 10px; margin: 0;">CREA/[UF] [Número]</p>
              </div>
              <p style="font-size: 10px; margin-top: 20px;">
                [Cidade/UF], ${currentDate}
              </p>
            </div>
          </div>

          <!-- Rodapé Final -->
          <div style="position: absolute; bottom: 20mm; left: 20mm; right: 20mm; text-align: center; font-size: 9px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
            <p style="margin: 2px 0; font-weight: bold;">Relatório de Valor de Referência (RVR) nº 1/2025</p>
            <p style="margin: 2px 0;">Polícia Rodoviária Federal - Superintendência Regional no Estado de [UF]</p>
            <p style="margin: 2px 0;">Gerado automaticamente em ${currentDate} às ${currentTime}</p>
          </div>
        </div>
      </div>
    `;
  }

  static createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '210mm';
    container.style.minHeight = '297mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.4';
    container.style.zIndex = '999999';
    container.style.boxSizing = 'border-box';
    container.style.overflow = 'visible';
    return container;
  }
}
