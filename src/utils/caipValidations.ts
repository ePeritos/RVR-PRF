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

// Convert File to base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const processFormData = async (data: any) => {
  console.log('=== PROCESSING FORM DATA ===');
  console.log('Dados originais:', data);
  
  const processedData = { ...data };
  
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
    console.log(`Processando campo de imagem ${field}:`, value);
    
    if (value && typeof value === 'string' && value.trim() !== '') {
      // Keep URLs (both storage URLs and base64)
      processedData[field] = value;
      console.log(`✅ Campo ${field} mantido como URL`);
    } else {
      // Remove empty values
      processedData[field] = null;
      console.log(`Campo ${field} vazio, definindo como null`);
    }
  }

  // Process numeric fields
  processedData.nota_para_adequacao = data.nota_para_adequacao && data.nota_para_adequacao !== '' ? 
    Math.min(100, parseFloat(data.nota_para_adequacao)) : null;
  processedData.nota_para_manutencao = data.nota_para_manutencao && data.nota_para_manutencao !== '' ? 
    Math.min(100, parseFloat(data.nota_para_manutencao)) : null;
  processedData.nota_global = data.nota_global && data.nota_global !== '' ? 
    Math.min(100, parseFloat(data.nota_global)) : null;

  console.log('Dados processados final:', processedData);
  return processedData;
};