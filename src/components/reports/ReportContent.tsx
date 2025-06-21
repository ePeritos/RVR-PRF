
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
    
    // Formatação para anos
    if (field.includes('ano') || field.includes('idade')) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue === 0) return 'Não informado';
      return `${numValue} anos`;
    }
    
    const result = String(value);
    console.log(`✅ Campo ${field} - valor final:`, result);
    return result;
  };

  return (
    <div className={`border rounded-lg p-6 bg-white shadow-sm ${className}`} style={{ 
      pageBreakInside: 'avoid',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.4'
    }}>
      {/* Cabeçalho do Relatório */}
      <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{data.titulo}</h1>
        {data.descricao && (
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{data.descricao}</p>
        )}
        <div style={{ fontSize: '11px', color: '#888' }}>
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
          
          // Organizar campos em pares para a tabela de duas colunas
          const fieldPairs: Array<[string, string?]> = [];
          for (let i = 0; i < dataFields.length; i += 2) {
            fieldPairs.push([dataFields[i], dataFields[i + 1]]);
          }
          
          // Organizar imagens em pares para layout duplo
          const imagePairs: Array<[string, string?]> = [];
          for (let i = 0; i < imageFields.length; i += 2) {
            imagePairs.push([imageFields[i], imageFields[i + 1]]);
          }

          return (
            <div key={imovel.id || index} style={{ 
              pageBreakInside: 'avoid', 
              marginBottom: '20px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '16px'
            }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                borderBottom: '1px solid #ddd',
                paddingBottom: '8px',
                pageBreakAfter: 'avoid'
              }}>
                {imovel.nome_da_unidade || `Imóvel ${index + 1}`}
              </h2>
              
              {/* Tabela de dados em colunas duplas */}
              {dataFields.length > 0 && (
                <div className="mb-4">
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    marginBottom: '16px',
                    fontSize: '12px'
                  }}>
                    <tbody>
                      {fieldPairs.map((pair, pairIndex) => {
                        const field1 = pair[0];
                        const field2 = pair[1];
                        const value1 = field1 ? imovel[field1] : '';
                        const value2 = field2 ? imovel[field2] : '';
                        
                        console.log(`🔍 Par ${pairIndex}:`, {
                          field1,
                          value1: value1,
                          field2,
                          value2: value2
                        });
                        
                        return (
                          <tr key={pairIndex}>
                            {/* Primeira coluna */}
                            <td style={{ 
                              width: '25%', 
                              padding: '8px', 
                              verticalAlign: 'top',
                              borderBottom: '1px solid #eee',
                              fontWeight: 'bold',
                              color: '#555',
                              backgroundColor: '#f8f9fa'
                            }}>
                              {field1 ? (fieldLabels[field1] || field1) : ''}
                            </td>
                            <td style={{ 
                              width: '25%', 
                              padding: '8px', 
                              verticalAlign: 'top',
                              borderBottom: '1px solid #eee',
                              borderRight: '1px solid #eee'
                            }}>
                              {field1 ? formatValue(value1, field1) : ''}
                            </td>
                            
                            {/* Segunda coluna */}
                            <td style={{ 
                              width: '25%', 
                              padding: '8px', 
                              verticalAlign: 'top',
                              borderBottom: '1px solid #eee',
                              fontWeight: 'bold',
                              color: '#555',
                              backgroundColor: '#f8f9fa'
                            }}>
                              {field2 ? (fieldLabels[field2] || field2) : ''}
                            </td>
                            <td style={{ 
                              width: '25%', 
                              padding: '8px', 
                              verticalAlign: 'top',
                              borderBottom: '1px solid #eee'
                            }}>
                              {field2 ? formatValue(value2, field2) : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Imagens em colunas duplas */}
              {data.incluir_imagens && imageFields.length > 0 && (
                <div style={{ 
                  marginTop: '16px', 
                  pageBreakBefore: 'auto',
                  pageBreakInside: 'avoid'
                }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    marginBottom: '16px',
                    pageBreakAfter: 'avoid'
                  }}>
                    Imagens
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {imagePairs.map((imagePair, pairIndex) => (
                      <React.Fragment key={pairIndex}>
                        {/* Primeira imagem */}
                        {imagePair[0] && (
                          <div className="space-y-2" style={{ pageBreakInside: 'avoid' }}>
                            <h4 style={{ 
                              fontSize: '12px', 
                              fontWeight: 'bold',
                              textAlign: 'center',
                              color: '#555'
                            }}>
                              {fieldLabels[imagePair[0]] || imagePair[0].replace('imagem_', '').replace('_', ' ')}
                            </h4>
                            {imovel[imagePair[0]] && imovel[imagePair[0]].trim() !== '' && imovel[imagePair[0]] !== '{}' ? (
                              <div className="w-full h-48 border border-gray-300 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                                <img 
                                  src={imovel[imagePair[0]].startsWith('http') ? imovel[imagePair[0]] : `https://sbefwlhezngkwsxybrsj.supabase.co/storage/v1/object/public/caip-images/${imovel[imagePair[0]]}`}
                                  alt={fieldLabels[imagePair[0]] || imagePair[0]}
                                  className="max-w-full max-h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-48 border border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                                <p className="text-xs text-gray-500 text-center p-2">
                                  Imagem não disponível
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Segunda imagem */}
                        {imagePair[1] && (
                          <div className="space-y-2" style={{ pageBreakInside: 'avoid' }}>
                            <h4 style={{ 
                              fontSize: '12px', 
                              fontWeight: 'bold',
                              textAlign: 'center',
                              color: '#555'
                            }}>
                              {fieldLabels[imagePair[1]] || imagePair[1].replace('imagem_', '').replace('_', ' ')}
                            </h4>
                            {imovel[imagePair[1]] && imovel[imagePair[1]].trim() !== '' && imovel[imagePair[1]] !== '{}' ? (
                              <div className="w-full h-48 border border-gray-300 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                                <img 
                                  src={imovel[imagePair[1]].startsWith('http') ? imovel[imagePair[1]] : `https://sbefwlhezngkwsxybrsj.supabase.co/storage/v1/object/public/caip-images/${imovel[imagePair[1]]}`}
                                  alt={fieldLabels[imagePair[1]] || imagePair[1]}
                                  className="max-w-full max-h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-48 border border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                                <p className="text-xs text-gray-500 text-center p-2">
                                  Imagem não disponível
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div style={{ textAlign: 'center', color: '#dc2626', padding: '32px' }}>
          <p style={{ fontWeight: 'bold' }}>❌ Nenhum dado encontrado para exibir</p>
          <p style={{ fontSize: '11px', marginTop: '8px' }}>Verifique se os imóveis foram selecionados corretamente</p>
        </div>
      )}

      {/* Rodapé */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '11px', 
        color: '#888', 
        marginTop: '32px', 
        paddingTop: '16px', 
        borderTop: '1px solid #ccc' 
      }}>
        <p>Sistema Integrado de Gestão de Imóveis - SIGI-PRF</p>
        <p>Relatório gerado automaticamente em {data.data_geracao}</p>
      </div>
    </div>
  );
};
