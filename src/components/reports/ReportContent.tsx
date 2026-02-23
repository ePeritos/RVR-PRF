
import React from 'react';

interface ReportContentData {
  titulo: string;
  descricao?: string;
  campos_incluidos: string[];
  incluir_imagens: boolean;
  incluir_agregacao?: boolean;
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
  console.log('=== DEBUG ReportContent ===');
  console.log('Data recebida:', data);
  console.log('Dados:', data.dados);
  console.log('Campos incluídos:', data.campos_incluidos);
  
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
    'idade_aparente_do_imovel': 'Idade Aparente do Imóvel',
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
    console.log(`🔍 Formatando campo ${field}:`, { value, type: typeof value });
    
    // Verificações mais robustas para valores vazios
    if (value === null || value === undefined) {
      console.log(`❌ Campo ${field} é null/undefined`);
      return 'Não informado';
    }
    if (typeof value === 'string' && value.trim() === '') {
      console.log(`❌ Campo ${field} é string vazia`);
      return 'Não informado';
    }
    
    // Campos especiais - Ano CAIP e Idade (SEM "anos")
    if (field === 'ano_caip' || field === 'idade_aparente_do_imovel') {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue === 0) return 'Não informado';
      return String(numValue); // Apenas o número, sem "anos"
    }
    
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
      console.log(`✅ Campo boolean ${field} - valor processado:`, strValue);
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
    
    // Formatação para outros campos com anos (vida útil estimada)
    if (field === 'vida_util_estimada_anos') {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue === 0) return 'Não informado';
      return `${numValue} anos`;
    }
    
    const result = String(value);
    console.log(`✅ Campo ${field} - valor final:`, result);
    return result;
  };

  return (
    <div 
      className={`border rounded-lg p-6 bg-white shadow-sm ${className}`} 
      style={{ 
        pageBreakInside: 'avoid',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        minHeight: '100vh',
        width: '210mm',
        maxWidth: '210mm',
        margin: '0 auto',
        padding: '15mm'
      }}
    >
      {/* Cabeçalho do Relatório */}
      <div 
        className="text-center mb-8 border-b-2 border-gray-800 pb-4"
        style={{
          pageBreakAfter: 'avoid',
          pageBreakInside: 'avoid'
        }}
      >
        <h1 className="text-lg font-bold mb-2">{data.titulo}</h1>
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
        data.dados.map((imovel: any, index: number) => {
          console.log(`=== PROCESSANDO IMÓVEL ${index + 1} ===`);
          console.log('📋 Dados do imóvel:', imovel);
          console.log('🔑 Chaves disponíveis:', Object.keys(imovel));
          
          const dataFields = data.campos_incluidos?.filter((campo: string) => !campo.startsWith('imagem_')) || [];
          const imageFields = data.campos_incluidos?.filter((campo: string) => campo.startsWith('imagem_')) || [];
          
          console.log('📊 Campos de dados:', dataFields);
          console.log('🖼️ Campos de imagem:', imageFields);

          return (
            <div 
              key={imovel.id || index} 
              className="mb-8 border border-gray-300 rounded p-4" 
              style={{ 
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                marginBottom: '30px'
              }}
            >
              <h2 
                className="text-base font-bold mb-4 pb-2 border-b border-gray-300" 
                style={{ 
                  pageBreakAfter: 'avoid',
                  pageBreakInside: 'avoid'
                }}
              >
                {imovel.nome_da_unidade || `Imóvel ${index + 1}`}
              </h2>
              
              {/* Grid de dados em duas colunas */}
              {dataFields.length > 0 && (
                <div 
                  className="mb-6"
                  style={{
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <div 
                    className="grid grid-cols-2 gap-4"
                    style={{
                      display: 'block',
                      pageBreakInside: 'avoid'
                    }}
                  >
                    {dataFields.map((field: string, fieldIndex: number) => {
                      const value = imovel[field];
                      const formattedValue = formatValue(value, field);
                      
                      console.log(`🔍 Campo ${field}:`, {
                        rawValue: value,
                        formattedValue: formattedValue
                      });
                      
                      return (
                        <div 
                          key={fieldIndex} 
                          className="border-b border-gray-100 pb-2 mb-2"
                          style={{
                            display: 'inline-block',
                            width: '48%',
                            marginRight: '2%',
                            verticalAlign: 'top',
                            pageBreakInside: 'avoid'
                          }}
                        >
                          <div className="text-xs font-semibold text-gray-600 mb-1">
                            {fieldLabels[field] || field}
                          </div>
                          <div className="text-sm text-gray-800">
                            {formattedValue}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Imagens em grid */}
              {data.incluir_imagens && imageFields.length > 0 && (
                <div 
                  className="mt-6" 
                  style={{ 
                    pageBreakBefore: 'auto',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <h3 
                    className="text-sm font-bold mb-4" 
                    style={{ 
                      pageBreakAfter: 'avoid'
                    }}
                  >
                    Imagens
                  </h3>
                  
                  <div 
                    className="grid grid-cols-2 gap-4"
                    style={{
                      display: 'block',
                      pageBreakInside: 'avoid'
                    }}
                  >
                    {imageFields.map((imageField: string, imgIndex: number) => (
                      <div 
                        key={imgIndex} 
                        className="space-y-2" 
                        style={{ 
                          pageBreakInside: 'avoid',
                          display: 'inline-block',
                          width: '48%',
                          marginRight: '2%',
                          marginBottom: '10px',
                          verticalAlign: 'top'
                        }}
                      >
                        <h4 className="text-xs font-semibold text-center text-gray-600">
                          {fieldLabels[imageField] || imageField.replace('imagem_', '').replace('_', ' ')}
                        </h4>
                        {imovel[imageField] && imovel[imageField].trim() !== '' && imovel[imageField] !== '{}' ? (
                          <div 
                            className="w-full border border-gray-300 rounded overflow-hidden bg-gray-50 flex items-center justify-center"
                            style={{
                              height: '180px',
                              pageBreakInside: 'avoid'
                            }}
                          >
                            <img 
                              src={imovel[imageField].startsWith('http') ? imovel[imageField] : `https://sbefwlhezngkwsxybrsj.supabase.co/storage/v1/object/public/caip-images/${imovel[imageField]}`}
                              alt={fieldLabels[imageField] || imageField}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                pageBreakInside: 'avoid'
                              }}
                              crossOrigin="anonymous"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-full border border-gray-300 rounded bg-gray-50 flex items-center justify-center"
                            style={{
                              height: '180px',
                              pageBreakInside: 'avoid'
                            }}
                          >
                            <p className="text-xs text-gray-500 text-center p-2">
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
          );
        })
      ) : (
        <div className="text-center text-red-600 py-8">
          <p className="font-bold">❌ Nenhum dado encontrado para exibir</p>
          <p className="text-xs mt-2">Verifique se os imóveis foram selecionados corretamente</p>
        </div>
      )}

      {/* Seção de Resumo Agregado */}
      {data.incluir_agregacao && data.dados && data.dados.length > 0 && (() => {
        const booleanFields = [
          'almoxarifado', 'alojamento_feminino', 'alojamento_masculino', 'alojamento_misto',
          'area_de_servico', 'area_de_uso_compartilhado_com_outros_orgaos', 'arquivo', 'auditorio',
          'banheiro_para_zeladoria', 'banheiro_feminino_para_servidoras', 'banheiro_masculino_para_servidores',
          'banheiro_misto_para_servidores', 'box_com_chuveiro_externo', 'box_para_lavagem_de_veiculos',
          'canil', 'casa_de_maquinas', 'central_de_gas', 'cobertura_para_aglomeracao_de_usuarios',
          'cobertura_para_fiscalizacao_de_veiculos', 'copa_e_cozinha', 'deposito_de_lixo',
          'deposito_de_materiais_de_descarte_e_baixa', 'deposito_de_material_de_limpeza',
          'deposito_de_material_operacional', 'estacionamento_para_usuarios', 'garagem_para_servidores',
          'garagem_para_viaturas', 'lavabo_para_servidores_sem_box_para_chuveiro',
          'local_para_custodia_temporaria_de_detidos', 'local_para_guarda_provisoria_de_animais',
          'patio_de_retencao_de_veiculos', 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos',
          'ponto_de_pouso_para_aeronaves', 'rampa_de_fiscalizacao_de_veiculos', 'recepcao',
          'sala_administrativa_escritorio', 'sala_de_assepsia', 'sala_de_aula', 'sala_de_reuniao',
          'sala_de_revista_pessoal', 'sala_operacional_observatorio', 'sala_tecnica', 'sanitario_publico',
          'telefone_publico', 'torre_de_telecomunicacoes', 'vestiario_para_nao_policiais',
          'vestiario_para_policiais', 'fornecimento_de_agua', 'fornecimento_de_energia_eletrica',
          'esgotamento_sanitario', 'conexao_de_internet', 'possui_wireless_wifi', 'identidade_visual',
          'blindagem', 'abastecimento_de_agua', 'energia_eletrica_de_emergencia', 'iluminacao_externa',
          'protecao_contra_incendios', 'protecao_contra_intrusao', 'radiocomunicacao',
          'cabeamento_estruturado', 'claviculario', 'sala_cofre', 'concertina', 'muro_ou_alambrado',
          'acessibilidade', 'sustentabilidade', 'aproveitamento_da_agua_da_chuva', 'energia_solar',
          'climatizacao_de_ambientes', 'coleta_de_lixo', 'ha_contrato_de_manutencao_predial',
          'ha_plano_de_manutencao_do_imovel', 'o_trecho_e_concessionado', 'adere_ao_pgprf_teletrabalho'
        ];

        const selectedBooleanFields = (data.campos_incluidos || []).filter((f: string) => booleanFields.includes(f));
        if (selectedBooleanFields.length === 0) return null;

        const total = data.dados.length;

        return (
          <div
            className="mt-8 border border-gray-300 rounded p-4"
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            <h2 className="text-base font-bold mb-4 pb-2 border-b border-gray-300">
              Resumo Agregado — Campos Sim/Não
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Base: {total} imóveis selecionados
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #d1d5db' }}>Campo</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '2px solid #d1d5db' }}>Sim</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '2px solid #d1d5db' }}>Não</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '2px solid #d1d5db' }}>N/I</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', borderBottom: '2px solid #d1d5db' }}>% Sim</th>
                </tr>
              </thead>
              <tbody>
                {selectedBooleanFields.map((field: string, idx: number) => {
                  let simCount = 0;
                  let naoCount = 0;
                  let niCount = 0;

                  data.dados.forEach((item: any) => {
                    const val = String(item[field] || '').toLowerCase().trim();
                    if (val === 'sim' || val === 'on' || val === 'true' || val === '1') {
                      simCount++;
                    } else if (val === 'não' || val === 'nao' || val === 'off' || val === 'false' || val === '0') {
                      naoCount++;
                    } else {
                      niCount++;
                    }
                  });

                  const pctSim = total > 0 ? ((simCount / total) * 100).toFixed(1) : '0.0';
                  const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';

                  return (
                    <tr key={field} style={{ backgroundColor: bgColor }}>
                      <td style={{ padding: '5px 8px', borderBottom: '1px solid #e5e7eb' }}>
                        {fieldLabels[field] || field}
                      </td>
                      <td style={{ textAlign: 'center', padding: '5px 8px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#16a34a' }}>
                        {simCount}
                      </td>
                      <td style={{ textAlign: 'center', padding: '5px 8px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#dc2626' }}>
                        {naoCount}
                      </td>
                      <td style={{ textAlign: 'center', padding: '5px 8px', borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                        {niCount}
                      </td>
                      <td style={{ textAlign: 'center', padding: '5px 8px', borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>
                        {simCount} ({pctSim}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Rodapé - Sempre na última página */}
      <div 
        className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-300"
        style={{
          pageBreakBefore: 'avoid',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          marginTop: '40px',
          position: 'relative'
        }}
      >
        <p>Sistema Integrado de Gestão de Imóveis - SIGI-PRF</p>
        <p>Relatório gerado automaticamente em {data.data_geracao}</p>
      </div>
    </div>
  );
};
