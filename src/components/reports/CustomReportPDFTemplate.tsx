import React from 'react';

interface CustomReportData {
  titulo: string;
  descricao?: string;
  campos_incluidos: string[];
  incluir_imagens: boolean;
  dados: any[];
  total_imoveis: number;
  data_geracao: string;
  gerado_por: string;
}

interface CustomReportPDFTemplateProps {
  data: CustomReportData;
  className?: string;
}

export const CustomReportPDFTemplate: React.FC<CustomReportPDFTemplateProps> = ({
  data,
  className = ""
}) => {
  const fieldLabels: Record<string, string> = {
    // Básico
    'nome_da_unidade': 'Nome da Unidade',
    'tipo_de_unidade': 'Tipo de Unidade', 
    'unidade_gestora': 'Unidade Gestora',
    'endereco': 'Endereço',
    'ano_caip': 'Ano CAIP',
    'processo_sei': 'Processo SEI',
    'servo2_pdi': 'Servo2/PDI',
    'coordenadas': 'Coordenadas',
    'zona': 'Zona',
    'rip': 'RIP',
    'matricula_do_imovel': 'Matrícula do Imóvel',
    
    // Dimensões
    'area_construida_m2': 'Área Construída (m²)',
    'area_do_terreno_m2': 'Área do Terreno (m²)',
    'area_do_patio_para_retencao_de_veiculos_m2': 'Área do Pátio para Retenção (m²)',
    'area_da_cobertura_de_pista_m2': 'Área da Cobertura de Pista (m²)',
    'area_da_cobertura_para_fiscalizacao_de_veiculos_m2': 'Área Cobertura Fiscalização (m²)',
    
    // Avaliação
    'estado_de_conservacao': 'Estado de Conservação',
    'idade_aparente_do_imovel': 'Idade Aparente (anos)',
    'nota_global': 'Nota Global',
    'vida_util_estimada_anos': 'Vida Útil Estimada (anos)',
    'nota_para_adequacao': 'Nota para Adequação',
    'nota_para_manutencao': 'Nota para Manutenção',
    
    // Financeiro
    'rvr': 'RVR',
    
    // Propriedade
    'tipo_de_imovel': 'Tipo de Imóvel',
    'situacao_do_imovel': 'Situação do Imóvel',
    'implantacao_da_unidade': 'Implantação da Unidade',
    
    // Infraestrutura
    'fornecimento_de_agua': 'Fornecimento de Água',
    'fornecimento_de_energia_eletrica': 'Energia Elétrica',
    'esgotamento_sanitario': 'Esgotamento Sanitário',
    'conexao_de_internet': 'Conexão de Internet',
    'possui_wireless_wifi': 'WiFi',
    'abastecimento_de_agua': 'Abastecimento de Água',
    'energia_eletrica_de_emergencia': 'Energia de Emergência',
    'iluminacao_externa': 'Iluminação Externa',
    'radiocomunicacao': 'Radiocomunicação',
    'cabeamento_estruturado': 'Cabeamento Estruturado',
    
    // Segurança
    'blindagem': 'Blindagem',
    'protecao_contra_incendios': 'Proteção Contra Incêndios',
    'protecao_contra_intrusao': 'Proteção Contra Intrusão',
    'aterramento_e_protecao_contra_descargas_atmosfericas': 'Proteção Descargas',
    'claviculario': 'Claviculário',
    'sala_cofre': 'Sala Cofre',
    'concertina': 'Concertina',
    'muro_ou_alambrado': 'Muro/Alambrado',
    
    // Sustentabilidade
    'acessibilidade': 'Acessibilidade',
    'sustentabilidade': 'Sustentabilidade', 
    'aproveitamento_da_agua_da_chuva': 'Aproveitamento Água da Chuva',
    'energia_solar': 'Energia Solar',
    
    // Manutenção
    'ano_da_ultima_reavaliacao_rvr': 'Última Reavaliação RVR',
    'ano_da_ultima_intervencao_na_infraestrutura_do_imovel': 'Última Intervenção',
    'tempo_de_intervencao': 'Tempo de Intervenção',
    'ha_contrato_de_manutencao_predial': 'Contrato Manutenção',
    'ha_plano_de_manutencao_do_imovel': 'Plano de Manutenção',
    'precisaria_de_qual_intervencao': 'Intervenção Necessária',
    
     // Imagens
     'imagem_geral': 'Imagem Geral',
     'imagem_fachada': 'Imagem da Fachada',
     'imagem_lateral_1': 'Imagem Lateral 1',
     'imagem_lateral_2': 'Imagem Lateral 2',
     'imagem_fundos': 'Imagem dos Fundos',
     'imagem_sala_cofre': 'Imagem Sala Cofre',
     'imagem_cofre': 'Imagem do Cofre',
     'imagem_interna_alojamento_masculino': 'Imagem Alojamento Masculino',
     'imagem_interna_alojamento_feminino': 'Imagem Alojamento Feminino',
     'imagem_interna_plantao_uop': 'Imagem Plantão UOP',
     
     // Outras
     'o_trecho_e_concessionado': 'Trecho Concessionado',
     'adere_ao_pgprf_teletrabalho': 'PGPRF Teletrabalho',
     'identidade_visual': 'Identidade Visual',
     'climatizacao_de_ambientes': 'Climatização',
     'coleta_de_lixo': 'Coleta de Lixo',
     'observacoes': 'Observações'
  };

  const imageFields = [
    'imagem_geral',
    'imagem_fachada', 
    'imagem_lateral_1',
    'imagem_lateral_2',
    'imagem_fundos',
    'imagem_sala_cofre',
    'imagem_cofre',
    'imagem_interna_alojamento_masculino',
    'imagem_interna_alojamento_feminino',
    'imagem_interna_plantao_uop'
  ];

  const formatValue = (value: any, field: string): string => {
    if (value === null || value === undefined || value === '') return 'Não informado';
    
    if (field.includes('area_') || field.includes('m2')) {
      return `${Number(value).toLocaleString('pt-BR')} m²`;
    }
    
    if (field === 'rvr') {
      return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    
    return String(value);
  };

  return (
    <div className={`bg-white text-black p-6 max-w-4xl mx-auto font-sans text-sm leading-relaxed ${className}`}>
      {/* Cabeçalho */}
      <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-2">{data.titulo}</h1>
        {data.descricao && (
          <p className="text-sm text-gray-600 mb-2">{data.descricao}</p>
        )}
        <div className="text-xs text-gray-500">
          <p>Gerado em: {data.data_geracao}</p>
          <p>Por: {data.gerado_por}</p>
          <p>Total de imóveis: {data.total_imoveis}</p>
        </div>
      </div>

      {/* Conteúdo dos imóveis */}
      {data.dados.map((imovel, index) => (
        <div key={imovel.id || index} className="mb-8 border border-gray-300 rounded p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {imovel.nome_da_unidade || `Imóvel ${index + 1}`}
          </h2>
          
          {/* Campos de dados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {data.campos_incluidos
              .filter(campo => !imageFields.includes(campo))
              .map(campo => (
                <div key={campo} className="flex flex-col">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    {fieldLabels[campo] || campo}
                  </span>
                  <span className="text-sm text-gray-800">
                    {formatValue(imovel[campo], campo)}
                  </span>
                </div>
              ))}
          </div>

          {/* Imagens */}
          {data.incluir_imagens && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Imagens</h3>
              <div className="grid grid-cols-2 gap-3">
                {imageFields
                  .filter(campo => {
                    // Se campos de imagem foram especificamente selecionados, mostrar apenas esses
                    const hasSelectedImageFields = data.campos_incluidos.some(field => imageFields.includes(field));
                    
                    if (hasSelectedImageFields) {
                      return data.campos_incluidos.includes(campo);
                    } else {
                      // Se nenhum campo de imagem foi selecionado, mostrar todas as imagens que têm valor
                      return imovel[campo] && imovel[campo].trim() !== '';
                    }
                  })
                  .map(campo => (
                    <div key={campo} className="text-center">
                      <p className="text-xs text-gray-600 mb-1 font-medium">
                        {fieldLabels[campo] || campo.replace('imagem_', '').replace('_', ' ')}
                      </p>
                      {imovel[campo] && imovel[campo].trim() !== '' ? (
                        <img 
                          src={imovel[campo]} 
                          alt={fieldLabels[campo] || campo}
                          className="w-full h-32 object-cover border border-gray-200 rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center border border-gray-300 rounded bg-gray-50">
                          <p className="text-xs text-gray-500 text-center px-2">
                            Imagem não disponível no banco de dados
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              {imageFields.filter(campo => imovel[campo] && imovel[campo].trim() !== '').length === 0 && (
                <p className="text-sm text-gray-500 italic">Nenhuma imagem disponível para este imóvel.</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Rodapé */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-300">
        <p>Sistema Integrado de Gestão de Imóveis - SIGI-PRF</p>
        <p>Relatório gerado automaticamente em {data.data_geracao}</p>
      </div>
    </div>
  );
};