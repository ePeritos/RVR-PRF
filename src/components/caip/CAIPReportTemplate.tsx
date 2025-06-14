import React from 'react';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

interface CAIPReportTemplateProps {
  data: DadosCAIP;
}

export const CAIPReportTemplate: React.FC<CAIPReportTemplateProps> = ({ data }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatArea = (value: number | null) => {
    if (!value) return 'Não informado';
    return `${value.toLocaleString('pt-BR')} m²`;
  };

  const yesNoFormat = (value: string | null) => {
    return value === 'Sim' ? 'SIM' : 'NÃO';
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black font-sans">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-blue-800">POLÍCIA RODOVIÁRIA FEDERAL</h1>
        </div>
        <h2 className="text-lg font-bold mb-4">
          Detalhamento CAIP - {data.ano_caip || 'Não informado'}
        </h2>
        <div className="mb-4">
          <p><strong>Unidade Gestora:</strong> {data.unidade_gestora || 'Não informado'}</p>
          <p><strong>Tipo de unidade:</strong> {data.tipo_de_unidade || 'Não informado'}</p>
          <p><strong>Nome da Unidade:</strong> {data.nome_da_unidade || 'Não informado'}</p>
        </div>
        <p className="text-sm italic">
          Relatório do Coeficiente de Adequação da Infraestrutura Predial (CAIP), realizado de forma bianual.
        </p>
      </div>

      {/* Seção DADOS GERAIS */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-gray-200 p-2">DADOS GERAIS</h3>
        <table className="w-full border-collapse border border-gray-400">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Última alteração</td>
              <td className="border border-gray-400 p-2">{data.ultima_alteracao || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Processo SEI</td>
              <td className="border border-gray-400 p-2">{data.processo_sei || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">RVR</td>
              <td className="border border-gray-400 p-2">{formatCurrency(data.rvr)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">RIP</td>
              <td className="border border-gray-400 p-2">{data.rip || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Servo2 (PDI)</td>
              <td className="border border-gray-400 p-2">{data.servo2_pdi || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Tipo de imóvel</td>
              <td className="border border-gray-400 p-2">{data.tipo_de_imovel || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Situação do imóvel</td>
              <td className="border border-gray-400 p-2">{data.situacao_do_imovel || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Endereço</td>
              <td className="border border-gray-400 p-2">{data.endereco || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Implantação da Unidade</td>
              <td className="border border-gray-400 p-2">{data.implantacao_da_unidade || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Idade aparente do imóvel</td>
              <td className="border border-gray-400 p-2">{data.idade_aparente_do_imovel ? `${data.idade_aparente_do_imovel} anos` : 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Ano da última intervenção</td>
              <td className="border border-gray-400 p-2">{data.ano_da_ultima_intervencao_na_infraestrutura_do_imovel || 'Não informado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">O trecho é concessionado?</td>
              <td className="border border-gray-400 p-2">{yesNoFormat(data.o_trecho_e_concessionado)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Identidade visual?</td>
              <td className="border border-gray-400 p-2">{yesNoFormat(data.identidade_visual)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Blindagem?</td>
              <td className="border border-gray-400 p-2">{yesNoFormat(data.blindagem)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Energia Solar?</td>
              <td className="border border-gray-400 p-2">{yesNoFormat(data.energia_solar)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Sustentabilidade?</td>
              <td className="border border-gray-400 p-2">{yesNoFormat(data.sustentabilidade)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Fornecimento de Água?</td>
              <td className="border border-gray-400 p-2">{yesNoFormat(data.fornecimento_de_agua)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Há contrato de manutenção predial?</td>
              <td className="border border-gray-400 p-2">{yesNoFormat(data.ha_contrato_de_manutencao_predial)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Há plano de manutenção do imóvel?</td>
              <td className="border border-gray-400 p-2">{yesNoFormat(data.ha_plano_de_manutencao_do_imovel)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Seção NOTAS */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-gray-200 p-2">NOTAS</h3>
        <table className="w-full border-collapse border border-gray-400">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Nota para Adequação</td>
              <td className="border border-gray-400 p-2">{data.nota_para_adequacao || 'Não calculado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Nota para Manutenção</td>
              <td className="border border-gray-400 p-2">{data.nota_para_manutencao || 'Não calculado'}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Nota Global</td>
              <td className="border border-gray-400 p-2">{data.nota_global || 'Não calculado'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Seção de Áreas */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-gray-200 p-2">ÁREAS</h3>
        <table className="w-full border-collapse border border-gray-400">
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Área do Terreno (m²)</td>
              <td className="border border-gray-400 p-2">{formatArea(data.area_do_terreno_m2)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Área construída (m²)</td>
              <td className="border border-gray-400 p-2">{formatArea(data.area_construida_m2)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Área do pátio para retenção de veículos (m²)</td>
              <td className="border border-gray-400 p-2">{formatArea(data.area_do_patio_para_retencao_de_veiculos_m2)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Área da cobertura para fiscalização de veículos (m²)</td>
              <td className="border border-gray-400 p-2">{formatArea(data.area_da_cobertura_para_fiscalizacao_de_veiculos_m2)}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-semibold bg-gray-100">Área da cobertura de pista (m²)</td>
              <td className="border border-gray-400 p-2">{formatArea(data.area_da_cobertura_de_pista_m2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Seção de Observações */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-gray-200 p-2">OBSERVAÇÕES</h3>
        <div className="border border-gray-400 p-4">
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Precisaria de qual intervenção?</h4>
            <p>{data.precisaria_de_qual_intervencao || 'Não informado'}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Observações</h4>
            <p>{data.observacoes || 'Não informado'}</p>
          </div>
        </div>
      </div>

      {/* Tabela de Ambientes e Infraestrutura */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-gray-200 p-2">AMBIENTES E INFRAESTRUTURA</h3>
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-left">Ambiente</th>
              <th className="border border-gray-400 p-2 text-center">Possui?</th>
              <th className="border border-gray-400 p-2 text-center">UOP</th>
              <th className="border border-gray-400 p-2 text-center">DEL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2">Almoxarifado</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.almoxarifado)}</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Alojamento misto</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.alojamento_misto)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Específico</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Alojamento Feminino</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.alojamento_feminino)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Específico</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Alojamento masculino</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.alojamento_masculino)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Específico</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Área de serviço</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.area_de_servico)}</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Área de uso compartilhado</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.area_de_uso_compartilhado_com_outros_orgaos)}</td>
              <td className="border border-gray-400 p-2 text-center">Específico</td>
              <td className="border border-gray-400 p-2 text-center">Específico</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Arquivo</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.arquivo)}</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Auditório</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.auditorio)}</td>
              <td className="border border-gray-400 p-2 text-center">Específico</td>
              <td className="border border-gray-400 p-2 text-center">Específico</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Banheiro para zeladoria</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.banheiro_para_zeladoria)}</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Banheiro para servidores</td>
              <td className="border border-gray-400 p-2 text-center">
                {(data.banheiro_feminino_para_servidoras === 'Sim' || 
                  data.banheiro_masculino_para_servidores === 'Sim' || 
                  data.banheiro_misto_para_servidores === 'Sim') ? 'SIM' : 'NÃO'}
              </td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Recepção</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.recepcao)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Sala administrativa/escritório</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.sala_administrativa_escritorio)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Sala operacional/observatório</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.sala_operacional_observatorio)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Específico</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Garagem para viaturas</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.garagem_para_viaturas)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Acessibilidade</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.acessibilidade)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Climatização de ambientes</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.climatizacao_de_ambientes)}</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Energia elétrica de emergência</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.energia_eletrica_de_emergencia)}</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
              <td className="border border-gray-400 p-2 text-center">Importante</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Proteção contra incêndios</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.protecao_contra_incendios)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
            <tr>
              <td className="border border-gray-400 p-2">Proteção contra intrusão</td>
              <td className="border border-gray-400 p-2 text-center">{yesNoFormat(data.protecao_contra_intrusao)}</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
              <td className="border border-gray-400 p-2 text-center">Essencial</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rodapé */}
      <div className="text-center mt-8 pt-4 border-t border-gray-400">
        <p className="text-sm">
          Gerado em: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
};