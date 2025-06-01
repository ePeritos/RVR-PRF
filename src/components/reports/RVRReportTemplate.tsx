import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  endereco?: string;
  rip?: string;
  matriculaImovel?: string;
  parametros?: {
    cub: number;
    valorM2: number;
    bdi: number;
    responsavelTecnico?: {
      id: string;
      nome_completo: string;
      numero_registro: string;
      conselho: string;
      formacao: string;
      uf: string;
    };
  };
}

interface RVRReportTemplateProps {
  data: RVRReportData;
  className?: string;
}

export function RVRReportTemplate({ data, className = "" }: RVRReportTemplateProps) {
  const currentDate = new Date();
  const reportNumber = `${data.id}/2025`;
  
  // Dados calculados para o Memorial de Cálculo
  const areaTerreno = 1200; // m² - substituir por dado real
  const valorUnitarioTerreno = data.parametros?.valorM2 || 150; // R$/m²
  const areaBenfeitoria = data.areaImovel || 300; // m²
  const cubValor = data.parametros?.cub || 2500; // R$/m²
  const bdiPercentual = data.parametros?.bdi || 25; // %
  const idadeAparente = 15; // anos
  const vidaUtil = 60; // anos
  const fatorComercializacao = 1.0;
  const coeficienteK = 0.25; // Ross-Heidecke
  
  // Cálculos do Memorial
  const valorTerreno = areaTerreno * valorUnitarioTerreno;
  const custoRedicao = areaBenfeitoria * cubValor * (1 + (bdiPercentual / 100));
  const idadePercentual = (idadeAparente / vidaUtil) * 100;
  const depreciacao = custoRedicao * coeficienteK;
  const valorBenfeitoria = custoRedicao - depreciacao;
  const valorImovel = valorTerreno + valorBenfeitoria;
  const valorAdotado = valorImovel * fatorComercializacao;

  // Dados do responsável técnico selecionado
  const responsavelTecnico = data.parametros?.responsavelTecnico;
  const nomeResponsavel = responsavelTecnico?.nome_completo || '[Nome do Responsável Técnico]';
  const registroResponsavel = responsavelTecnico ? 
    `${responsavelTecnico.conselho}/${responsavelTecnico.uf} ${responsavelTecnico.numero_registro}` : 
    'CREA/[UF] [Número]';
  const formacaoResponsavel = responsavelTecnico?.formacao || 'Engenheiro Civil';

  // Extrair UF da unidade gestora ou usar dados do responsável
  const getUfFromUnidade = (unidadeGestora?: string) => {
    if (responsavelTecnico?.uf) return responsavelTecnico.uf;
    if (!unidadeGestora) return 'XX';
    // Tentar extrair UF do final da string da unidade gestora
    const match = unidadeGestora.match(/([A-Z]{2})$/);
    return match ? match[1] : 'XX';
  };

  const uf = getUfFromUnidade(data.unidadeGestora);
  const solicitante = data.unidadeGestora || 'PRF/XX';

  return (
    <div className={`bg-white text-black p-8 max-w-5xl mx-auto text-sm leading-relaxed ${className}`} id={`rvr-report-${data.id}`}>
      {/* Cabeçalho Oficial */}
      <div className="text-center mb-8">
        <div className="text-xs mb-2">MINISTÉRIO DA JUSTIÇA E SEGURANÇA PÚBLICA</div>
        <div className="text-xs mb-2">POLÍCIA RODOVIÁRIA FEDERAL</div>
        <div className="text-xs mb-6">SUPERINTENDÊNCIA REGIONAL NO ESTADO DE {uf}</div>
        
        <h1 className="text-lg font-bold mb-4">RELATÓRIO DE VALOR DE REFERÊNCIA (RVR)</h1>
        <div className="text-sm">Nº {reportNumber}</div>
      </div>

      {/* I. DADOS GERAIS */}
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">I. DADOS GERAIS</h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div><strong>Endereço:</strong> {data.endereco || '[Endereço do imóvel]'}</div>
          <div><strong>Finalidade:</strong> Avaliação para fins de gestão patrimonial</div>
          <div><strong>Solicitante:</strong> {solicitante}</div>
          <div><strong>Data da Vistoria:</strong> {format(currentDate, 'dd/MM/yyyy')}</div>
          <div><strong>Data-base da Avaliação:</strong> {format(currentDate, 'dd/MM/yyyy')}</div>
          <div><strong>Responsável Técnico:</strong> {nomeResponsavel}</div>
          <div><strong>Registro Profissional:</strong> {registroResponsavel}</div>
        </div>
      </section>

      {/* II. RESULTADOS DA AVALIAÇÃO */}
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">II. RESULTADOS DA AVALIAÇÃO</h2>
        <div className="border border-gray-300">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 p-2 text-left">COMPONENTE</th>
                <th className="border border-gray-300 p-2 text-right">VALOR (R$)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Terreno</td>
                <td className="border border-gray-300 p-2 text-right font-medium">
                  {valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Benfeitorias</td>
                <td className="border border-gray-300 p-2 text-right font-medium">
                  {valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-2 font-bold">Imóvel (Terreno + Benfeitorias)</td>
                <td className="border border-gray-300 p-2 text-right font-bold">
                  {valorImovel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Fator de Comercialização</td>
                <td className="border border-gray-300 p-2 text-right">{fatorComercializacao.toFixed(2)}</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="border border-gray-300 p-2 font-bold text-blue-800">VALOR ADOTADO</td>
                <td className="border border-gray-300 p-2 text-right font-bold text-blue-800 text-base">
                  {valorAdotado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Liquidez</td>
                <td className="border border-gray-300 p-2 text-right">Baixa</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* III. IDENTIFICAÇÃO E CARACTERIZAÇÃO DO IMÓVEL */}
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">III. IDENTIFICAÇÃO E CARACTERIZAÇÃO DO IMÓVEL</h2>
        <div className="grid grid-cols-2 gap-4 text-xs">
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
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">IV. CARACTERÍSTICAS DO TERRENO E DA REGIÃO</h2>
        <div className="text-xs space-y-2">
          <div><strong>Formato:</strong> Retangular</div>
          <div><strong>Dimensões:</strong> [Dimensões do terreno]</div>
          <div><strong>Topografia:</strong> Plana</div>
          <div><strong>Situação:</strong> Meio de quadra</div>
          <div><strong>Uso do Solo:</strong> Misto (residencial/comercial)</div>
          <div><strong>Infraestrutura Urbana:</strong> Completa (água, esgoto, energia elétrica, telefone, pavimentação)</div>
          <div><strong>Transporte Público:</strong> Disponível</div>
          <div><strong>Zoneamento:</strong> [Zona conforme legislação municipal]</div>
        </div>
      </section>

      {/* V. CARACTERÍSTICAS DAS BENFEITORIAS */}
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">V. CARACTERÍSTICAS DAS BENFEITORIAS</h2>
        <div className="text-xs space-y-2">
          <div><strong>Descrição Geral:</strong> Edificação destinada a {data.categoria}</div>
          <div><strong>Tipo de Uso:</strong> Institucional - Segurança Pública</div>
          <div><strong>Número de Pavimentos:</strong> [Número]</div>
          <div><strong>Estrutura:</strong> Concreto armado</div>
          <div><strong>Vedação:</strong> Alvenaria de tijolos cerâmicos</div>
          <div><strong>Cobertura:</strong> Telhas cerâmicas</div>
          <div><strong>Idade Aparente:</strong> {idadeAparente} anos</div>
          <div><strong>Estado de Conservação:</strong> Bom</div>
          <div><strong>Padrão Construtivo:</strong> Médio</div>
        </div>
      </section>

      {/* VI. CONSIDERAÇÕES, PRESSUPOSTOS, RESSALVAS E FATORES LIMITANTES */}
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">VI. CONSIDERAÇÕES, PRESSUPOSTOS, RESSALVAS E FATORES LIMITANTES</h2>
        <div className="text-xs space-y-2">
          <p>6.1. A presente avaliação foi elaborada em conformidade com:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Instrução Normativa SPU/MGI nº 98, de 10 de março de 2025</li>
            <li>Portaria STN/SPU nº 10, de 27 de janeiro de 2023</li>
            <li>NBR 14653-1:2019 - Avaliação de bens - Parte 1: Procedimentos gerais</li>
            <li>NBR 14653-2:2011 - Avaliação de bens - Parte 2: Imóveis urbanos</li>
          </ul>
          <p>6.2. Os valores de referência utilizados têm as seguintes fontes e datas-base:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Valor unitário do terreno: {valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m² - Fonte: [Fonte] - Data-base: {format(currentDate, 'MM/yyyy')}</li>
            <li>CUB/m²: {cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m² - Fonte: SINDUSCON/{uf} - Data-base: {format(currentDate, 'MM/yyyy')}</li>
          </ul>
          <p>6.3. A avaliação refere-se ao imóvel nas condições em que se encontra na data da vistoria.</p>
          <p>6.4. Este relatório destina-se exclusivamente à finalidade declarada no item I.</p>
        </div>
      </section>

      {/* VII. MEMORIAL DE CÁLCULO */}
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">VII. MEMORIAL DE CÁLCULO</h2>
        
        {/* A. Avaliação do Terreno */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">A. Avaliação do Terreno (Vt)</h3>
          <div className="text-xs space-y-2 ml-4">
            <p><strong>Método Adotado:</strong> Comparativo direto de dados de mercado</p>
            
            <p><strong>Passo 1: Identificação do Valor Unitário do Terreno</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Fonte: [Fonte do valor unitário]</li>
              <li>Data-Base da Fonte: {format(currentDate, 'MM/yyyy')}</li>
              <li>Valor Unitário (VU<sub>terreno</sub>): {valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</li>
            </ul>
            
            <p><strong>Passo 2: Área do Terreno (A<sub>terreno</sub>)</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>A<sub>terreno</sub>: {areaTerreno.toLocaleString('pt-BR')} m²</li>
            </ul>
            
            <p><strong>Passo 3: Cálculo do Valor do Terreno (Vt)</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Fórmula: Vt = A<sub>terreno</sub> × VU<sub>terreno</sub></li>
              <li>Cálculo: Vt = {areaTerreno.toLocaleString('pt-BR')} m² × {valorUnitarioTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</li>
              <li><strong>Resultado Vt: {valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
            </ul>
          </div>
        </div>

        {/* B. Avaliação das Benfeitorias */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">B. Avaliação das Benfeitorias (Vb) – Método Evolutivo</h3>
          <div className="text-xs space-y-2 ml-4">
            <p><strong>Fórmula Geral:</strong> Vb = Custo de Reedição (CR) - Depreciação (D)</p>
            
            {/* B.1 Custo de Reedição */}
            <div className="mt-3">
              <p><strong>B.1. Cálculo do Custo de Reedição (CR) da Benfeitoria</strong></p>
              <p><strong>Fórmula:</strong> CR = Área da Benfeitoria (A<sub>benf</sub>) × CUB/m² × (1 + BDI (%))</p>
              
              <p><strong>Passo 1: Área da Benfeitoria (A<sub>benf</sub>)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>A<sub>benf</sub>: {areaBenfeitoria.toLocaleString('pt-BR')} m²</li>
              </ul>
              
              <p><strong>Passo 2: Custo Unitário Básico (CUB/m²)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Padrão Construtivo: Médio</li>
                <li>Fonte: SINDUSCON/[UF]</li>
                <li>Data-Base do CUB: {format(currentDate, 'MM/yyyy')}</li>
                <li>Valor do CUB/m²: {cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m²</li>
              </ul>
              
              <p><strong>Passo 3: Benefícios e Despesas Indiretas (BDI)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Percentual BDI: {(bdiPercentual/100).toFixed(2)} ({bdiPercentual}%)</li>
              </ul>
              
              <p><strong>Passo 4: Cálculo do Custo de Reedição (CR)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Cálculo: CR = {areaBenfeitoria.toLocaleString('pt-BR')} m² × {cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m² × (1 + {bdiPercentual/100})</li>
                <li>CR = {areaBenfeitoria.toLocaleString('pt-BR')} × {cubValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {(1 + bdiPercentual/100).toFixed(2)}</li>
                <li><strong>Resultado CR: {custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
              </ul>
            </div>

            {/* B.2 Depreciação */}
            <div className="mt-3">
              <p><strong>B.2. Cálculo da Depreciação (D) da Benfeitoria – Método de Ross-Heidecke</strong></p>
              <p><strong>Fórmula:</strong> D = CR × K (Coeficiente de Depreciação)</p>
              
              <p><strong>Passo 1: Idade Aparente (IA)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>IA: {idadeAparente} anos</li>
              </ul>
              
              <p><strong>Passo 2: Vida Útil Estimada (VU)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>VU: {vidaUtil} anos</li>
              </ul>
              
              <p><strong>Passo 3: Cálculo da Idade Percentual (IP)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Fórmula: IP = (IA/VU) × 100</li>
                <li>Cálculo: IP = ({idadeAparente}/{vidaUtil}) × 100 = {idadePercentual.toFixed(2)}%</li>
              </ul>
              
              <p><strong>Passo 4: Estado de Conservação (EC)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>EC: Bom</li>
              </ul>
              
              <p><strong>Passo 5: Identificação do Coeficiente de Depreciação (K)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>K = {coeficienteK.toFixed(2)} (conforme Tabela de Ross-Heidecke para IP = {idadePercentual.toFixed(2)}% e EC = Bom)</li>
                <li>Fonte do Coeficiente K: Tabela de Ross-Heidecke</li>
              </ul>
              
              <p><strong>Passo 6: Cálculo da Depreciação (D)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Cálculo: D = {custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {coeficienteK.toFixed(2)}</li>
                <li><strong>Resultado D: {depreciacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
              </ul>
            </div>

            {/* B.3 Valor da Benfeitoria */}
            <div className="mt-3">
              <p><strong>B.3. Cálculo do Valor da Benfeitoria (Vb)</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Fórmula: Vb = CR - D</li>
                <li>Cálculo: Vb = {custoRedicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - {depreciacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                <li><strong>Resultado Vb: {valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* C. Valor Total do Imóvel */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">C. Cálculo do Valor Total do Imóvel (Vi)</h3>
          <div className="text-xs space-y-2 ml-4">
            <ul className="list-disc list-inside ml-4">
              <li>Fórmula: Vi = Vt + Vb</li>
              <li>Cálculo: Vi = {valorTerreno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} + {valorBenfeitoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
              <li><strong>Resultado Vi: {valorImovel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
            </ul>
          </div>
        </div>

        {/* D. Valor Adotado */}
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">D. Cálculo do Valor Adotado</h3>
          <div className="text-xs space-y-2 ml-4">
            <p><strong>Fórmula:</strong> Valor Adotado = Vi × Fator de Comercialização (Fc)</p>
            
            <p><strong>Passo 1: Fator de Comercialização (Fc)</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Fc: {fatorComercializacao.toFixed(2)}</li>
            </ul>
            
            <p><strong>Passo 2: Cálculo do Valor Adotado</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Cálculo: Valor Adotado = {valorImovel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} × {fatorComercializacao.toFixed(2)}</li>
              <li><strong>Resultado Valor Adotado: {valorAdotado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></li>
            </ul>
          </div>
        </div>
      </section>

      {/* VIII. ANEXOS */}
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">VIII. ANEXOS</h2>
        <div className="text-xs space-y-1">
          <div>• Fotografias do imóvel</div>
          <div>• Documentação consultada</div>
          <div>• Planilhas de cálculo</div>
        </div>
      </section>

      {/* IX. RESPONSABILIDADE TÉCNICA */}
      <section className="mb-6">
        <h2 className="text-base font-bold mb-3 bg-gray-100 p-2">IX. RESPONSABILIDADE TÉCNICA</h2>
        <div className="text-xs space-y-4">
          <p>Declaro que o presente trabalho foi realizado com a observância dos preceitos da legislação e normas técnicas pertinentes.</p>
          
          <div className="mt-8 text-center">
            <div className="border-t border-black w-64 mx-auto mb-2"></div>
            <div><strong>{nomeResponsavel}</strong></div>
            <div>{formacaoResponsavel}</div>
            <div>{registroResponsavel}</div>
          </div>
          
          <div className="text-right mt-8">
            <div>[Cidade/{uf}], {format(currentDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}</div>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <div className="border-t border-gray-400 pt-4 mt-8">
        <div className="text-center text-xs text-gray-600">
          <p>Relatório de Valor de Referência (RVR) nº {reportNumber}</p>
          <p>Polícia Rodoviária Federal - Superintendência Regional no Estado de {uf}</p>
          <p>Gerado automaticamente em {format(currentDate, 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}</p>
        </div>
      </div>
    </div>
  );
}
