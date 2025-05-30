
import { RVRReportData } from './types';

export class HTMLGenerator {
  static createReportHTML(data: RVRReportData): string {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    const reportNumber = `${data.id}/2025`;
    
    // Dados dos cálculos
    const areaTerreno = data.areaTerreno || 0;
    const areaConstruida = data.areaConstruida || 0;
    const valorUnitarioTerreno = data.parametros?.valorM2 || 150;
    const cubValor = data.parametros?.cubM2 || 2100;
    const bdiPercentual = data.parametros?.bdi || 25;
    const idadeAparente = data.idadeAparente || 15;
    const vidaUtil = data.vidaUtil || 80;
    const estadoConservacao = data.estadoConservacao || 'BOM';
    const coeficienteK = data.coeficienteK || 0.25;
    const idadePercentual = data.idadePercentual || 18.75;
    
    // Cálculos
    const valorTerreno = areaTerreno * valorUnitarioTerreno;
    const custoRedicao = areaConstruida * cubValor * (1 + (bdiPercentual / 100));
    const depreciacao = custoRedicao * coeficienteK;
    const valorBenfeitoria = custoRedicao - depreciacao;
    const valorTotal = valorTerreno + valorBenfeitoria;
    const fatorComercializacao = 1.0;
    const valorAdotado = valorTotal * fatorComercializacao;

    // Dados do responsável técnico selecionado
    const responsavelTecnico = data.parametros?.responsavelTecnico;
    const nomeResponsavel = responsavelTecnico?.nome_completo || '[Nome do Responsável Técnico]';
    const registroResponsavel = responsavelTecnico ? 
      `${responsavelTecnico.conselho}/${responsavelTecnico.uf} ${responsavelTecnico.numero_registro}` : 
      'CREA/[UF] [Número]';
    
    return `
      <div style="width: 100%; max-width: 210mm; font-family: Arial, sans-serif; color: #000; background: white; padding: 20mm; box-sizing: border-box; line-height: 1.4; font-size: 14px;">
        
        <!-- Cabeçalho Principal -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #000;">
          <div style="font-size: 12px; margin-bottom: 5px;">MINISTÉRIO DA JUSTIÇA E SEGURANÇA PÚBLICA</div>
          <div style="font-size: 12px; margin-bottom: 5px;">POLÍCIA RODOVIÁRIA FEDERAL</div>
          <div style="font-size: 12px; margin-bottom: 15px;">SUPERINTENDÊNCIA REGIONAL NO ESTADO DE ${data.unidadeGestora || '[UF]'}</div>
          
          <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 10px 0; color: #000; text-transform: uppercase;">
            RELATÓRIO DE VALOR DE REFERÊNCIA (RVR)
          </h1>
          <div style="font-size: 16px; font-weight: bold;">Nº ${reportNumber}</div>
        </div>

        <!-- I. DADOS GERAIS -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; background-color: #f0f0f0; padding: 8px;">
            I. DADOS GERAIS
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; width: 30%; background-color: #f8f8f8;">
                Endereço:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                ${data.endereco || '[Endereço do imóvel]'}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Finalidade:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                Reavaliação de bens para fins contábeis
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Processo SEI:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                ${data.processoSei || '[Número do Processo]'}
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
                Data-base da Avaliação:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                ${data.parametros?.dataReferencia ? new Date(data.parametros.dataReferencia).toLocaleDateString('pt-BR') : currentDate}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Responsável Técnico:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                ${nomeResponsavel}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">
                Registro Profissional:
              </td>
              <td style="padding: 6px; border: 1px solid #000;">
                ${registroResponsavel}
              </td>
            </tr>
          </table>
        </div>

        <!-- II. RESULTADOS DA AVALIAÇÃO -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; background-color: #f0f0f0; padding: 8px;">
            II. RESULTADOS DA AVALIAÇÃO
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px;">
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
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">
                  ${valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px; border: 1px solid #000;">Benfeitorias</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">
                  ${valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px; border: 1px solid #000;">Imóvel (Terreno + Benfeitorias)</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">
                  ${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                </td>
              </tr>
              <tr>
                <td style="padding: 6px; border: 1px solid #000;">Fator de Comercialização</td>
                <td style="padding: 6px; border: 1px solid #000; text-align: right;">${fatorComercializacao.toFixed(2)}</td>
              </tr>
              <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td style="padding: 8px; border: 1px solid #000;">VALOR ADOTADO</td>
                <td style="padding: 8px; border: 1px solid #000; text-align: right; color: #008000; font-size: 14px;">
                  ${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
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
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; background-color: #f0f0f0; padding: 8px;">
            III. IDENTIFICAÇÃO E CARACTERIZAÇÃO DO IMÓVEL
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px;">
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; width: 30%; background-color: #f8f8f8;">Tipo:</td>
              <td style="padding: 6px; border: 1px solid #000;">${data.categoria}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">RIP:</td>
              <td style="padding: 6px; border: 1px solid #000;">${data.rip || '[Número RIP]'}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Matrícula:</td>
              <td style="padding: 6px; border: 1px solid #000;">${data.matriculaImovel || '[Número da Matrícula]'}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Endereço Completo:</td>
              <td style="padding: 6px; border: 1px solid #000;">${data.endereco || '[Endereço detalhado]'}</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Área do Terreno:</td>
              <td style="padding: 6px; border: 1px solid #000;">${areaTerreno.toLocaleString('pt-BR')} m²</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Área Construída:</td>
              <td style="padding: 6px; border: 1px solid #000;">${areaConstruida.toLocaleString('pt-BR')} m²</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #000; font-weight: bold; background-color: #f8f8f8;">Situação:</td>
              <td style="padding: 6px; border: 1px solid #000;">${data.situacaoImovel || 'Próprio'}</td>
            </tr>
          </table>
        </div>

        <!-- IV. CONSIDERAÇÕES, PRESSUPOSTOS, RESSALVAS E FATORES LIMITANTES -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; background-color: #f0f0f0; padding: 8px;">
            IV. CONSIDERAÇÕES, PRESSUPOSTOS, RESSALVAS E FATORES LIMITANTES
          </h3>
          
          <div style="margin-bottom: 15px; font-size: 12px;">
            <p style="margin: 0 0 10px 0;"><strong>4.1. A presente avaliação foi elaborada em conformidade com:</strong></p>
            <ul style="margin: 0 0 15px 20px; line-height: 1.5;">
              <li>Instrução Normativa SPU/MGI nº 98, de 10 de março de 2025</li>
              <li>Portaria STN/SPU nº 10, de 27 de janeiro de 2023</li>
              <li>NBR 14653-1:2019 - Avaliação de bens - Parte 1: Procedimentos gerais</li>
              <li>NBR 14653-2:2011 - Avaliação de bens - Parte 2: Imóveis urbanos</li>
            </ul>
          </div>

          <div style="margin-bottom: 15px; font-size: 12px;">
            <p style="margin: 0 0 10px 0;"><strong>4.2. Os valores de referência utilizados têm as seguintes fontes e datas-base:</strong></p>
            <ul style="margin: 0 0 15px 20px; line-height: 1.5;">
              <li>Valor unitário do terreno: ${valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m² - Fonte: ${data.parametros?.fonteValorTerreno || '[Fonte]'} - Data-base: ${data.parametros?.dataReferencia ? new Date(data.parametros.dataReferencia).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : '05/2025'}</li>
              <li>CUB/m²: ${cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m² - Fonte: SINDUSCON/[UF] - Data-base: ${data.parametros?.dataReferencia ? new Date(data.parametros.dataReferencia).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : '05/2025'}</li>
            </ul>
          </div>

          <p style="font-size: 12px; margin-bottom: 10px; line-height: 1.5;">
            <strong>4.3.</strong> A avaliação refere-se ao imóvel nas condições em que se encontra na data-base da avaliação, não sendo exigida vistoria para elaboração de RVR.
          </p>
          
          <p style="font-size: 12px; margin-bottom: 10px; line-height: 1.5;">
            <strong>4.4.</strong> Este relatório destina-se exclusivamente à finalidade declarada no item I.
          </p>

          <p style="font-size: 12px; margin-bottom: 10px; line-height: 1.5;">
            <strong>4.5.</strong> <u>O presente RVR NÃO serve para:</u>
          </p>
          <ul style="margin: 0 0 15px 20px; font-size: 12px; line-height: 1.5;">
            <li>I - alienação onerosa de domínio pleno, domínio direto ou domínio útil;</li>
            <li>II - aquisição compulsória ou voluntária, quando onerosa;</li>
            <li>III - locação e arrendamento de imóveis nas condições previstas; e</li>
            <li>IV - adjudicação.</li>
          </ul>
        </div>

        <!-- Nova página para Memorial de Cálculo -->
        <div style="page-break-before: always;">
          
          <!-- V. MEMORIAL DE CÁLCULO -->
          <div style="margin-bottom: 25px;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; background-color: #f0f0f0; padding: 8px;">
              V. MEMORIAL DE CÁLCULO
            </h3>
            
            <!-- A. Avaliação do Terreno -->
            <div style="margin-bottom: 20px; font-size: 12px;">
              <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">A. Avaliação do Terreno (Vt)</h4>
              <p style="margin: 0 0 8px 0;"><strong>Método Adotado:</strong> Comparativo direto de dados de mercado</p>
              
              <div style="margin-left: 15px;">
                <p style="margin: 0 0 5px 0;"><strong>Valor Unitário do Terreno:</strong> ${valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</p>
                <p style="margin: 0 0 5px 0;"><strong>Área do Terreno:</strong> ${areaTerreno.toLocaleString('pt-BR')} m²</p>
                <p style="margin: 0 0 8px 0;"><strong>Cálculo:</strong> Vt = ${areaTerreno.toLocaleString('pt-BR')} m² × ${valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</p>
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #008000;"><strong>Resultado Vt: ${valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}</strong></p>
              </div>
            </div>

            <!-- B. Avaliação das Benfeitorias -->
            <div style="margin-bottom: 20px; font-size: 12px;">
              <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">B. Avaliação das Benfeitorias (Vb) – Método Evolutivo</h4>
              <p style="margin: 0 0 10px 0;"><strong>Fórmula:</strong> Vb = Custo de Reedição (CR) - Depreciação (D)</p>
              
              <div style="margin-left: 15px;">
                <p style="margin: 0 0 5px 0; font-weight: bold;">B.1. Custo de Reedição (CR)</p>
                <p style="margin: 0 0 5px 0;">Área da Benfeitoria: ${areaConstruida.toLocaleString('pt-BR')} m²</p>
                <p style="margin: 0 0 5px 0;">CUB/m²: ${cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</p>
                <p style="margin: 0 0 5px 0;">BDI: ${bdiPercentual}%</p>
                <p style="margin: 0 0 8px 0;">Cálculo: CR = ${areaConstruida.toLocaleString('pt-BR')} × ${cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × ${(1 + bdiPercentual/100).toFixed(2)} = <strong>${custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}</strong></p>
                
                <p style="margin: 0 0 5px 0; font-weight: bold;">B.2. Depreciação (D) - Ross-Heidecke</p>
                <p style="margin: 0 0 5px 0;">Idade Aparente: ${idadeAparente} anos</p>
                <p style="margin: 0 0 5px 0;">Vida Útil: ${vidaUtil} anos</p>
                <p style="margin: 0 0 5px 0;">Idade Percentual: ${idadePercentual.toFixed(2)}%</p>
                <p style="margin: 0 0 5px 0;">Estado de Conservação: ${estadoConservacao}</p>
                <p style="margin: 0 0 5px 0;">Coeficiente K: ${coeficienteK.toFixed(3)}</p>
                <p style="margin: 0 0 8px 0;">Cálculo: D = ${custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })} × ${coeficienteK.toFixed(3)} = <strong>${depreciacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}</strong></p>
                
                <p style="margin: 0 0 5px 0; font-weight: bold;">B.3. Valor da Benfeitoria</p>
                <p style="margin: 0 0 15px 0;">Vb = ${custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })} - ${depreciacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })} = <strong style="color: #008000;">${valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}</strong></p>
              </div>
            </div>

            <!-- C. Valor Total -->
            <div style="margin-bottom: 20px; font-size: 12px;">
              <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">C. Valor Total do Imóvel</h4>
              <div style="margin-left: 15px;">
                <p style="margin: 0 0 5px 0;">Vi = Vt + Vb = ${valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })} + ${valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}</p>
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #008000;"><strong>Vi = ${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}</strong></p>
              </div>
            </div>

            <!-- D. Valor Adotado -->
            <div style="margin-bottom: 20px; font-size: 12px;">
              <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">D. Valor Adotado</h4>
              <div style="margin-left: 15px;">
                <p style="margin: 0 0 5px 0;">Fator de Comercialização: ${fatorComercializacao.toFixed(2)}</p>
                <p style="margin: 0 0 5px 0;">Valor Adotado = ${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })} × ${fatorComercializacao.toFixed(2)}</p>
                <p style="margin: 0 0 15px 0; font-weight: bold; color: #008000; font-size: 14px;"><strong>Valor Adotado = ${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}</strong></p>
              </div>
            </div>
          </div>

          <!-- VI. RESPONSABILIDADE TÉCNICA -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; background-color: #f0f0f0; padding: 8px;">
              VI. RESPONSABILIDADE TÉCNICA
            </h3>
            <p style="font-size: 12px; margin-bottom: 20px; line-height: 1.5;">
              Declaro que o presente trabalho foi realizado com a observância dos preceitos da legislação e normas técnicas pertinentes.
            </p>
            
            <div style="text-align: center; margin-top: 40px;">
              <div style="border-top: 1px solid #000; width: 300px; margin: 0 auto 10px;">
                <p style="font-size: 12px; margin: 10px 0 5px; font-weight: bold;">${nomeResponsavel}</p>
                <p style="font-size: 12px; margin: 0;">${responsavelTecnico?.formacao || 'Engenheiro Civil'}</p>
                <p style="font-size: 12px; margin: 0;">${registroResponsavel}</p>
              </div>
              <p style="font-size: 12px; margin-top: 20px;">
                [Cidade/UF], ${currentDate}
              </p>
            </div>
          </div>

          <!-- Rodapé Final -->
          <div style="position: absolute; bottom: 20mm; left: 20mm; right: 20mm; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
            <p style="margin: 2px 0; font-weight: bold;">Relatório de Valor de Referência (RVR) nº ${reportNumber}</p>
            <p style="margin: 2px 0;">Polícia Rodoviária Federal - Superintendência Regional no Estado de ${data.unidadeGestora || '[UF]'}</p>
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
