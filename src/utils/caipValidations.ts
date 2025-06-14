export const validateAnoCAIP = (value: string): string | true => {
  const year = parseInt(value);
  if (isNaN(year) || year % 2 === 0) {
    return 'O Ano CAIP deve ser um número ímpar.';
  }
  return true;
};

export const processFormData = (data: any) => {
  return {
    ...data,
    nota_para_adequacao: data.nota_para_adequacao && data.nota_para_adequacao !== '' ? 
      Math.min(100, parseFloat(data.nota_para_adequacao)) : null,
    nota_para_manutencao: data.nota_para_manutencao && data.nota_para_manutencao !== '' ? 
      Math.min(100, parseFloat(data.nota_para_manutencao)) : null,
    nota_global: data.nota_global && data.nota_global !== '' ? 
      Math.min(100, parseFloat(data.nota_global)) : null,
  };
};