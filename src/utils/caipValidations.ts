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

  // Process image files
  for (const field of imageFields) {
    const fileValue = data[field];
    console.log(`Processando campo ${field}:`, fileValue);
    
    if (fileValue && fileValue instanceof File) {
      try {
        console.log(`Convertendo arquivo ${fileValue.name} para base64...`);
        const base64 = await fileToBase64(fileValue);
        processedData[field] = base64;
        console.log(`✅ Campo ${field} convertido para base64`);
      } catch (error) {
        console.error(`Erro ao converter ${field}:`, error);
        processedData[field] = null;
      }
    } else if (fileValue && typeof fileValue === 'string') {
      // Keep existing URLs/base64 strings
      console.log(`Campo ${field} já é string, mantendo valor`);
      processedData[field] = fileValue;
    } else if (!fileValue || fileValue === null) {
      // Remove empty values
      console.log(`Campo ${field} vazio, definindo como null`);
      processedData[field] = null;
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