
import { RVRReportData } from './types';

export class HTMLGenerator {
  static createReportHTML(data: RVRReportData): string {
    return `
      <div style="width: 100%; font-family: Arial, sans-serif; color: #000; page-break-inside: avoid;">
        <!-- Cabeçalho -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #000;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #000;">
            RELATÓRIO DE REAVALIAÇÃO
          </h1>
          <h2 style="font-size: 18px; font-weight: normal; margin: 0 0 10px 0; color: #666;">
            Relatório de Valor de Referência (RVR)
          </h2>
          <p style="font-size: 12px; margin: 0; color: #888;">
            Data de Geração: ${new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <!-- Informações da Unidade -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Informações da Unidade
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold; width: 35%;">
                Nome da Unidade:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.nome}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Categoria:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.categoria}
              </td>
            </tr>
            ${data.unidadeGestora ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Unidade Gestora:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.unidadeGestora}
              </td>
            </tr>
            ` : ''}
            ${data.anoCAIP ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Ano CAIP:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.anoCAIP}
              </td>
            </tr>
            ` : ''}
            ${data.areaImovel ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Área do Imóvel:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.areaImovel} m²
              </td>
            </tr>
            ` : ''}
            ${data.situacaoImovel ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Situação do Imóvel:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.situacaoImovel}
              </td>
            </tr>
            ` : ''}
          </table>
        </div>

        <!-- Análise Financeira -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Análise Financeira
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold; width: 35%;">
                Valor Original (RVR):
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Valor Reavaliado:
              </td>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: #008000;">
                ${data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Diferença:
              </td>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: ${data.diferenca >= 0 ? '#008000' : '#cc0000'};">
                ${data.diferenca >= 0 ? '+' : ''}${data.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Variação Percentual:
              </td>
              <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: ${data.percentual >= 0 ? '#008000' : '#cc0000'};">
                ${data.percentual >= 0 ? '+' : ''}${data.percentual.toFixed(2)}%
              </td>
            </tr>
          </table>
        </div>

        ${data.parametros ? `
        <!-- Parâmetros Utilizados -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Parâmetros Utilizados
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold; width: 35%;">
                CUB (Custo Unitário Básico):
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.parametros.cub.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                Valor por m²:
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.parametros.valorM2.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold;">
                BDI (%):
              </td>
              <td style="padding: 8px; border: 1px solid #000;">
                ${data.parametros.bdi}%
              </td>
            </tr>
          </table>
        </div>
        ` : ''}

        <!-- Metodologia (página adicional) -->
        <div style="margin-bottom: 25px; page-break-before: always;">
          <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
            Metodologia de Avaliação
          </h3>
          
          <p style="margin-bottom: 15px; text-align: justify; line-height: 1.6;">
            A reavaliação foi realizada considerando os parâmetros técnicos vigentes e as condições atuais do mercado imobiliário. 
            O método utilizado baseou-se na análise comparativa de dados e na aplicação de índices de correção apropriados.
          </p>
          
          <h4 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; color: #000;">
            Critérios Considerados:
          </h4>
          
          <ul style="margin-left: 20px; line-height: 1.6;">
            <li>Localização e características do imóvel</li>
            <li>Estado de conservação</li>
            <li>Área construída e área do terreno</li>
            <li>Índices econômicos de correção</li>
            <li>Comparação com valores de mercado</li>
          </ul>
          
          <h4 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px 0; color: #000;">
            Considerações Finais:
          </h4>
          
          <p style="margin-bottom: 15px; text-align: justify; line-height: 1.6;">
            Este relatório apresenta o resultado da reavaliação do imóvel considerando todos os aspectos técnicos e legais pertinentes. 
            Os valores aqui apresentados refletem as condições atuais do mercado e seguem as normas técnicas estabelecidas.
          </p>
        </div>

        <!-- Rodapé -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 10px; color: #666;">
          <p style="margin: 5px 0;">
            Este relatório foi gerado automaticamente pelo Sistema de Reavaliação de Imóveis
          </p>
          <p style="margin: 5px 0;">
            Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </p>
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
    container.style.backgroundColor = 'white';
    container.style.padding = '20mm';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.4';
    container.style.zIndex = '999999';
    container.style.boxSizing = 'border-box';
    return container;
  }
}
