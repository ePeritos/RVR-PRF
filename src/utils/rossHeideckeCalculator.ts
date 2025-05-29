
interface RossHeideckeResult {
  coeficiente: number;
  idadePercentual: number;
  depreciacao: number;
  valorDepreciado: number;
}

export function calculateRossHeidecke(
  custoRedicao: number,
  idadeAparente: number,
  vidaUtil: number,
  estadoConservacao: string
): RossHeideckeResult {
  // Calcular idade percentual
  const idadePercentual = (idadeAparente / vidaUtil) * 100;
  
  // Determinar coeficiente K baseado na tabela Ross-Heidecke
  let coeficiente = 0;
  const estado = estadoConservacao.toUpperCase();
  
  if (estado.includes('NOVO') || estado.includes('EXCELENTE')) {
    if (idadePercentual <= 5) coeficiente = 0.00;
    else if (idadePercentual <= 10) coeficiente = 0.03;
    else if (idadePercentual <= 15) coeficiente = 0.06;
    else if (idadePercentual <= 20) coeficiente = 0.10;
    else if (idadePercentual <= 25) coeficiente = 0.14;
    else if (idadePercentual <= 30) coeficiente = 0.18;
    else if (idadePercentual <= 40) coeficiente = 0.26;
    else if (idadePercentual <= 50) coeficiente = 0.35;
    else if (idadePercentual <= 60) coeficiente = 0.45;
    else if (idadePercentual <= 70) coeficiente = 0.55;
    else if (idadePercentual <= 80) coeficiente = 0.65;
    else if (idadePercentual <= 90) coeficiente = 0.75;
    else coeficiente = 0.85;
  } else if (estado.includes('BOM')) {
    if (idadePercentual <= 5) coeficiente = 0.02;
    else if (idadePercentual <= 10) coeficiente = 0.05;
    else if (idadePercentual <= 15) coeficiente = 0.09;
    else if (idadePercentual <= 20) coeficiente = 0.13;
    else if (idadePercentual <= 25) coeficiente = 0.17;
    else if (idadePercentual <= 30) coeficiente = 0.22;
    else if (idadePercentual <= 40) coeficiente = 0.31;
    else if (idadePercentual <= 50) coeficiente = 0.40;
    else if (idadePercentual <= 60) coeficiente = 0.50;
    else if (idadePercentual <= 70) coeficiente = 0.60;
    else if (idadePercentual <= 80) coeficiente = 0.70;
    else if (idadePercentual <= 90) coeficiente = 0.80;
    else coeficiente = 0.90;
  } else if (estado.includes('REGULAR') || estado.includes('MÉDIO')) {
    if (idadePercentual <= 5) coeficiente = 0.05;
    else if (idadePercentual <= 10) coeficiente = 0.08;
    else if (idadePercentual <= 15) coeficiente = 0.12;
    else if (idadePercentual <= 20) coeficiente = 0.16;
    else if (idadePercentual <= 25) coeficiente = 0.21;
    else if (idadePercentual <= 30) coeficiente = 0.26;
    else if (idadePercentual <= 40) coeficiente = 0.36;
    else if (idadePercentual <= 50) coeficiente = 0.46;
    else if (idadePercentual <= 60) coeficiente = 0.56;
    else if (idadePercentual <= 70) coeficiente = 0.66;
    else if (idadePercentual <= 80) coeficiente = 0.76;
    else if (idadePercentual <= 90) coeficiente = 0.86;
    else coeficiente = 0.95;
  } else if (estado.includes('RUIM') || estado.includes('MAU')) {
    if (idadePercentual <= 5) coeficiente = 0.08;
    else if (idadePercentual <= 10) coeficiente = 0.12;
    else if (idadePercentual <= 15) coeficiente = 0.16;
    else if (idadePercentual <= 20) coeficiente = 0.21;
    else if (idadePercentual <= 25) coeficiente = 0.26;
    else if (idadePercentual <= 30) coeficiente = 0.31;
    else if (idadePercentual <= 40) coeficiente = 0.42;
    else if (idadePercentual <= 50) coeficiente = 0.53;
    else if (idadePercentual <= 60) coeficiente = 0.64;
    else if (idadePercentual <= 70) coeficiente = 0.74;
    else if (idadePercentual <= 80) coeficiente = 0.84;
    else if (idadePercentual <= 90) coeficiente = 0.94;
    else coeficiente = 1.00;
  } else { // PESSIMO ou outros
    if (idadePercentual <= 5) coeficiente = 0.12;
    else if (idadePercentual <= 10) coeficiente = 0.16;
    else if (idadePercentual <= 15) coeficiente = 0.21;
    else if (idadePercentual <= 20) coeficiente = 0.26;
    else if (idadePercentual <= 25) coeficiente = 0.31;
    else if (idadePercentual <= 30) coeficiente = 0.37;
    else if (idadePercentual <= 40) coeficiente = 0.48;
    else if (idadePercentual <= 50) coeficiente = 0.60;
    else if (idadePercentual <= 60) coeficiente = 0.71;
    else if (idadePercentual <= 70) coeficiente = 0.82;
    else if (idadePercentual <= 80) coeficiente = 0.93;
    else coeficiente = 1.00;
  }
  
  const depreciacao = custoRedicao * coeficiente;
  const valorDepreciado = custoRedicao - depreciacao;
  
  return {
    coeficiente,
    idadePercentual,
    depreciacao,
    valorDepreciado
  };
}
