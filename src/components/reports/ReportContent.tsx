import React from 'react';

interface ReportContentData {
  titulo: string;
  descricao?: string;
  campos_incluidos: string[];
  incluir_imagens: boolean;
  dados: any[];
  total_imoveis: number;
  data_geracao: string;
  gerado_por: string;
}

interface ReportContentProps {
  data: ReportContentData;
  className?: string;
}

export const ReportContent: React.FC<ReportContentProps> = ({
  data,
  className = ""
}) => {
  // Labels para os campos (versão expandida)
  const fieldLabels: Record<string, string> = {
    'nome_da_unidade': 'Nome da Unidade',
    'tipo_de_unidade': 'Tipo de Unidade', 
    'unidade_gestora': 'Unidade Gestora',
    'endereco': 'Endereço',
    'ano_caip': 'Ano CAIP',
    'area_construida_m2': 'Área Construída (m²)',
    'area_do_terreno_m2': 'Área do Terreno (m²)',
    'estado_de_conservacao': 'Estado de Conservação',
    'alojamento_feminino': 'Alojamento Feminino',
    'alojamento_masculino': 'Alojamento Masculino',
    'alojamento_misto': 'Alojamento Misto',
    'rvr': 'RVR',
    'nota_global': 'Nota Global',
    'vida_util_estimada_anos': 'Vida Útil Estimada (anos)',
    'processo_sei': 'Processo SEI',
    'servo2_pdi': 'Servo2/PDI',
    'coordenadas': 'Coordenadas',
    'zona': 'Zona',
    'rip': 'RIP',
    'matricula_do_imovel': 'Matrícula do Imóvel',
    'imagem_geral': 'Imagem Geral',
    'imagem_fachada': 'Imagem da Fachada',
    'imagem_lateral_1': 'Imagem Lateral 1',
    'imagem_lateral_2': 'Imagem Lateral 2',
    'imagem_fundos': 'Imagem dos Fundos',
    'imagem_sala_cofre': 'Imagem Sala Cofre',
    'imagem_cofre': 'Imagem do Cofre',
    'imagem_interna_alojamento_masculino': 'Imagem Alojamento Masculino',
    'imagem_interna_alojamento_feminino': 'Imagem Alojamento Feminino',
    'imagem_interna_plantao_uop': 'Imagem Plantão UOP'
  };

  const formatValue = (value: any, field: string): string => {
    // Verificações mais robustas para valores vazios
    if (value === null || value === undefined) return 'Não informado';
    if (typeof value === 'string' && value.trim() === '') return 'Não informado';
    
    // Campos que representam presença/ausência de características (Sim/Não)
    const booleanFields = [
      'alojamento_feminino', 'alojamento_masculino', 'alojamento_misto',
      'almoxarifado', 'area_de_servico', 'arquivo', 'auditorio',
      'banheiro_para_zeladoria', 'banheiro_feminino_para_servidoras', 
      'banheiro_masculino_para_servidores', 'banheiro_misto_para_servidores',
      'box_com_chuveiro_externo', 'box_para_lavagem_de_veiculos',
      'canil', 'casa_de_maquinas', 'central_de_gas',
      'cobertura_para_aglomeracao_de_usuarios', 'cobertura_para_fiscalizacao_de_veiculos',
      'copa_e_cozinha', 'deposito_de_lixo', 'deposito_de_materiais_de_descarte_e_baixa',
      'deposito_de_material_de_limpeza', 'deposito_de_material_operacional',
      'estacionamento_para_usuarios', 'garagem_para_servidores', 'garagem_para_viaturas',
      'lavabo_para_servidores_sem_box_para_chuveiro', 'local_para_custodia_temporaria_de_detidos',
      'local_para_guarda_provisoria_de_animais', 'patio_de_retencao_de_veiculos',
      'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos',
      'ponto_de_pouso_para_aeronaves', 'rampa_de_fiscalizacao_de_veiculos',
      'recepcao', 'sala_administrativa_escritorio', 'sala_de_assepsia',
      'sala_de_aula', 'sala_de_reuniao', 'sala_de_revista_pessoal',
      'sala_operacional_observatorio', 'sala_tecnica', 'sanitario_publico',
      'telefone_publico', 'torre_de_telecomunicacoes', 'vestiario_para_nao_policiais',
      'vestiario_para_policiais', 'fornecimento_de_agua', 'fornecimento_de_energia_eletrica',
      'esgotamento_sanitario', 'conexao_de_internet', 'possui_wireless_wifi',
      'identidade_visual', 'blindagem', 'abastecimento_de_agua',
      'energia_eletrica_de_emergencia', 'iluminacao_externa', 'protecao_contra_incendios',
      'protecao_contra_intrusao', 'radiocomunicacao', 'cabeamento_estruturado',
      'claviculario', 'sala_cofre', 'concertina', 'muro_ou_alambrado',
      'acessibilidade', 'sustentabilidade', 'aproveitamento_da_agua_da_chuva',
      'energia_solar', 'climatizacao_de_ambientes', 'coleta_de_lixo',
      'ha_contrato_de_manutencao_predial', 'ha_plano_de_manutencao_do_imovel',
      'o_trecho_e_concessionado', 'adere_ao_pgprf_teletrabalho'
    ];
    
    if (booleanFields.includes(field)) {
      const strValue = String(value).toLowerCase().trim();
      // Valores que representam "Sim"
      if (strValue === 'sim' || strValue === 'on' || strValue === 'true' || strValue === '1') {
        return 'Sim';
      }
      // Valores que representam "Não"
      if (strValue === 'não' || strValue === 'nao' || strValue === 'off' || strValue === 'false' || strValue === '0') {
        return 'Não';
      }
      return 'Não informado';
    }
    
    // Formatação para campos de área
    if (field.includes('area_') || field.includes('m2')) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue === 0) return 'Não informado';
      return `${numValue.toLocaleString('pt-BR')} m²`;
    }
    
    // Formatação para RVR
    if (field === 'rvr') {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue === 0) return 'Não informado';
      return `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    
    // Formatação para anos
    if (field.includes('ano') || field.includes('idade')) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue === 0) return 'Não informado';
      return `${numValue} anos`;
    }
    
    return String(value);
  };

  return (
    <div className={`border rounded-lg p-6 bg-white shadow-sm ${className}`}>
      {/* Cabeçalho do Relatório */}
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

      {/* Dados dos Imóveis */}
      {data.dados && data.dados.length > 0 ? (
        data.dados.map((imovel: any, index: number) => (
          <div key={imovel.id || index} className="mb-8 border border-gray-300 rounded p-4" style={{ pageBreakInside: 'avoid', marginBottom: '20px' }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2" style={{ pageBreakAfter: 'avoid' }}>
              {imovel.nome_da_unidade || `Imóvel ${index + 1}`}
            </h2>
            
            {/* Campos de dados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {data.campos_incluidos
                ?.filter((campo: string) => !campo.startsWith('imagem_'))
                ?.map((campo: string) => (
                  <div key={campo} className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {fieldLabels[campo] || campo}
                    </span>
                    <span className="text-sm text-gray-800 mt-1">
                      {formatValue(imovel[campo], campo)}
                    </span>
                  </div>
                ))}
            </div>

            {/* Imagens */}
            {data.incluir_imagens && (
              <div className="mt-6" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3" style={{ pageBreakAfter: 'avoid' }}>Imagens</h3>
                <div className="grid grid-cols-2 gap-3">
                  {data.campos_incluidos
                    ?.filter((campo: string) => campo.startsWith('imagem_'))
                    ?.map((campo: string) => (
                      <div key={campo} className="text-center">
                        <p className="text-xs text-gray-600 mb-1 font-medium">
                          {fieldLabels[campo] || campo.replace('imagem_', '').replace('_', ' ')}
                        </p>
                        {imovel[campo] && imovel[campo].trim() !== '' && imovel[campo] !== '{}' ? (
                          <div className="w-full h-40 border border-gray-200 rounded overflow-hidden mb-2">
                            <img 
                              src={imovel[campo].startsWith('http') ? imovel[campo] : `https://sbefwlhezngkwsxybrsj.supabase.co/storage/v1/object/public/caip-images/${imovel[campo]}`}
                              alt={fieldLabels[campo] || campo}
                              className="w-full h-full object-contain bg-gray-50"
                              crossOrigin="anonymous"
                              style={{ pageBreakInside: 'avoid' }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center border border-gray-300 rounded bg-gray-50 mb-2">
                            <p className="text-xs text-gray-500 text-center px-2">
                              Imagem não disponível
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-red-600 p-8">
          <p className="font-semibold">❌ Nenhum dado encontrado para exibir</p>
          <p className="text-sm mt-2">Verifique se os imóveis foram selecionados corretamente</p>
        </div>
      )}

      {/* Rodapé */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-300">
        <p>Sistema Integrado de Gestão de Imóveis - SIGI-PRF</p>
        <p>Relatório gerado automaticamente em {data.data_geracao}</p>
      </div>
    </div>
  );
};