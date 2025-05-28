
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
  parametros?: {
    cub: number;
    valorM2: number;
    bdi: number;
  };
}

interface RVRReportTemplateProps {
  data: RVRReportData;
  className?: string;
}

export function RVRReportTemplate({ data, className = "" }: RVRReportTemplateProps) {
  const currentDate = new Date();
  const reportNumber = `RVR-${data.id}-${format(currentDate, 'yyyyMMdd')}`;

  return (
    <div className={`bg-white text-black p-8 max-w-4xl mx-auto ${className}`} id={`rvr-report-${data.id}`}>
      {/* Cabeçalho */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              RELATÓRIO DE VALOR REFERENCIAL (RVR)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Polícia Rodoviária Federal - PRF
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Relatório Nº: {reportNumber}</p>
            <p className="text-sm">Data: {format(currentDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
          </div>
        </div>
      </div>

      {/* Dados do Imóvel */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
          1. DADOS DO IMÓVEL
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm"><strong>Nome da Unidade:</strong> {data.nome}</p>
            <p className="text-sm"><strong>Tipo de Unidade:</strong> {data.categoria}</p>
            <p className="text-sm"><strong>Situação do Imóvel:</strong> {data.situacaoImovel || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm"><strong>Área Construída:</strong> {data.areaImovel ? `${data.areaImovel} m²` : 'Não informado'}</p>
            <p className="text-sm"><strong>Unidade Gestora:</strong> {data.unidadeGestora || 'Não informado'}</p>
            <p className="text-sm"><strong>Ano CAIP:</strong> {data.anoCAIP || 'Não informado'}</p>
          </div>
        </div>
      </section>

      {/* Parâmetros de Avaliação */}
      {data.parametros && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            2. PARÂMETROS DE AVALIAÇÃO
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm"><strong>CUB (R$/m²):</strong></p>
              <p className="text-lg font-semibold">
                {data.parametros.cub.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p className="text-sm"><strong>Valor m² (R$/m²):</strong></p>
              <p className="text-lg font-semibold">
                {data.parametros.valorM2.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p className="text-sm"><strong>BDI (%):</strong></p>
              <p className="text-lg font-semibold">{data.parametros.bdi.toFixed(2)}%</p>
            </div>
          </div>
        </section>
      )}

      {/* Metodologia */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
          3. METODOLOGIA DE AVALIAÇÃO
        </h2>
        <p className="text-sm text-justify mb-2">
          A avaliação foi realizada utilizando o método comparativo direto de dados de mercado, 
          conforme estabelecido na NBR 14.653-2 da ABNT. Os valores foram calculados considerando:
        </p>
        <ul className="text-sm list-disc list-inside ml-4">
          <li>Valor base por metro quadrado do imóvel</li>
          <li>Fator de localização (1,1)</li>
          <li>Fator de mercado (1,05)</li>
          <li>Benefícios e Despesas Indiretas (BDI)</li>
        </ul>
      </section>

      {/* Resultado da Avaliação */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
          4. RESULTADO DA AVALIAÇÃO
        </h2>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Valor RVR Original:</p>
              <p className="text-xl font-bold text-gray-800">
                {data.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor RVR Avaliado:</p>
              <p className="text-xl font-bold text-blue-600">
                {data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Diferença:</p>
                <p className={`text-lg font-bold ${data.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.diferenca >= 0 ? '+' : ''}{data.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Variação Percentual:</p>
                <p className={`text-lg font-bold ${data.diferenca >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.percentual >= 0 ? '+' : ''}{data.percentual.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusão */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
          5. CONCLUSÃO
        </h2>
        <p className="text-sm text-justify">
          Com base na metodologia aplicada e nos parâmetros utilizados, o valor referencial do imóvel 
          "{data.nome}" foi avaliado em {data.valorAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, 
          representando uma {data.diferenca >= 0 ? 'valorização' : 'desvalorização'} de {Math.abs(data.percentual).toFixed(2)}% 
          em relação ao valor RVR original.
        </p>
      </section>

      {/* Rodapé */}
      <div className="border-t-2 border-gray-800 pt-4 mt-8">
        <div className="text-center">
          <p className="text-xs text-gray-600">
            Relatório gerado automaticamente pelo Sistema de Avaliação de Imóveis - PRF
          </p>
          <p className="text-xs text-gray-600">
            Este documento é válido apenas com assinatura digital ou física do responsável técnico
          </p>
        </div>
      </div>
    </div>
  );
}
