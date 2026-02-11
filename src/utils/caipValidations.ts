export const validateAnoCAIP = (ano: string): string | true => {
  if (!ano) return "Ano CAIP é obrigatório";
  
  const anoNumero = parseInt(ano);
  
  if (isNaN(anoNumero)) {
    return "Ano CAIP deve ser um número válido";
  }
  
  if (ano.length !== 4) {
    return "Ano CAIP deve ter 4 dígitos";
  }
  
  if (anoNumero % 2 === 0) {
    return "Ano CAIP deve ser um número ímpar";
  }
  
  const anoAtual = new Date().getFullYear();
  if (anoNumero < 2020 || anoNumero > anoAtual + 10) {
    return "Ano CAIP deve estar entre 2020 e " + (anoAtual + 10);
  }
  
  return true;
};

// List of numeric fields in dados_caip
const NUMERIC_FIELDS = [
  'area_construida_m2', 'area_do_terreno_m2', 'area_da_cobertura_de_pista_m2',
  'area_da_cobertura_para_fiscalizacao_de_veiculos_m2', 'area_do_patio_para_retencao_de_veiculos_m2',
  'idade_aparente_do_imovel', 'vida_util_estimada_anos', 'rvr', 'nota_global'
];

// Fields that should NOT be sent in insert/update operations
const EXCLUDED_FIELDS = ['id', 'created_at', 'updated_at'];

export const processFormData = async (data: any) => {
  console.log('=== PROCESSING FORM DATA ===');
  
  const processedData = { ...data };
  
  // Remove fields that shouldn't be in the payload
  EXCLUDED_FIELDS.forEach(field => {
    delete processedData[field];
  });

  // List of image fields
  const imageFields = [
    'imagem_geral', 'imagem_fachada', 'imagem_lateral_1', 'imagem_lateral_2',
    'imagem_fundos', 'imagem_sala_cofre', 'imagem_cofre', 
    'imagem_interna_alojamento_masculino', 'imagem_interna_alojamento_feminino',
    'imagem_interna_plantao_uop'
  ];

  // Process image fields - now they should contain URLs or null
  for (const field of imageFields) {
    const value = data[field];
    if (value && typeof value === 'string' && value.trim() !== '' && value.startsWith('http')) {
      processedData[field] = value;
    } else {
      processedData[field] = null;
    }
  }

  // Process numeric fields - convert empty strings to null
  NUMERIC_FIELDS.forEach(field => {
    const value = processedData[field];
    if (value === '' || value === undefined) {
      processedData[field] = null;
    } else if (typeof value === 'string') {
      const parsed = parseFloat(value);
      processedData[field] = isNaN(parsed) ? null : parsed;
    }
  });

  // Process nota_para_adequacao and nota_para_manutencao as strings
  if (processedData.nota_para_adequacao === '' || processedData.nota_para_adequacao === undefined) {
    processedData.nota_para_adequacao = null;
  } else if (typeof processedData.nota_para_adequacao === 'number') {
    processedData.nota_para_adequacao = String(Math.min(100, processedData.nota_para_adequacao));
  } else if (typeof processedData.nota_para_adequacao === 'string' && processedData.nota_para_adequacao.trim() !== '') {
    const val = parseFloat(processedData.nota_para_adequacao);
    processedData.nota_para_adequacao = isNaN(val) ? null : String(Math.min(100, val));
  }

  if (processedData.nota_para_manutencao === '' || processedData.nota_para_manutencao === undefined) {
    processedData.nota_para_manutencao = null;
  } else if (typeof processedData.nota_para_manutencao === 'number') {
    processedData.nota_para_manutencao = String(Math.min(100, processedData.nota_para_manutencao));
  } else if (typeof processedData.nota_para_manutencao === 'string' && processedData.nota_para_manutencao.trim() !== '') {
    const val = parseFloat(processedData.nota_para_manutencao);
    processedData.nota_para_manutencao = isNaN(val) ? null : String(Math.min(100, val));
  }

  // Clean any remaining empty string fields that might be sent to non-text columns
  Object.keys(processedData).forEach(key => {
    if (processedData[key] === '') {
      processedData[key] = null;
    }
  });

  console.log('Dados processados final:', processedData);
  return processedData;
};
