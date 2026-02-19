export const UNIDADES_GESTORAS = [
  'SPRF/AC', 'SPRF/AL', 'SPRF/AP', 'SPRF/AM', 'SPRF/BA', 'SPRF/CE',
  'SPRF/DF', 'SPRF/ES', 'SPRF/GO', 'SPRF/MA', 'SPRF/MT', 'SPRF/MS',
  'SPRF/MG', 'SPRF/PA', 'SPRF/PB', 'SPRF/PR', 'SPRF/PE', 'SPRF/PI',
  'SPRF/RJ', 'SPRF/RN', 'SPRF/RS', 'SPRF/RO', 'SPRF/RR', 'SPRF/SC',
  'SPRF/SP', 'SPRF/SE', 'SPRF/TO', 'SEDE NACIONAL', 'UNIPRF'
];

export const TIPOS_UNIDADE = [
  'UOP', 'DEL', 'Sede Administrativa',
  'Centro de Treinamento'
];

export const ESTADOS_CONSERVACAO = [
  { value: 'A', label: 'A - Novo' },
  { value: 'B', label: 'B - Entre novo e regular' },
  { value: 'C', label: 'C - Regular' },
  { value: 'D', label: 'D - Entre regular e reparos simples' },
  { value: 'E', label: 'E - Reparos simples' },
  { value: 'F', label: 'F - Entre reparos simples e importantes' },
  { value: 'G', label: 'G - Reparos importantes' },
  { value: 'H', label: 'H - Entre reparos importantes e sem valor' }
];

export const AMBIENTES_UOP = {
  almoxarifado: 6, area_de_servico: 6, area_de_uso_compartilhado_com_outros_orgaos: 0,
  arquivo: 6, auditorio: 0, banheiro_para_zeladoria: 0, box_com_chuveiro_externo: 0,
  box_para_lavagem_de_veiculos: 3, canil: 0, casa_de_maquinas: 6, central_de_gas: 6,
  cobertura_para_aglomeracao_de_usuarios: 6, cobertura_para_fiscalizacao_de_veiculos: 6,
  copa_e_cozinha: 6, deposito_de_lixo: 0, deposito_de_materiais_de_descarte_e_baixa: 3,
  deposito_de_material_de_limpeza: 6, deposito_de_material_operacional: 6,
  estacionamento_para_usuarios: 6, garagem_para_servidores: 3, garagem_para_viaturas: 6,
  lavabo_para_servidores_sem_box_para_chuveiro: 3, local_para_custodia_temporaria_de_detidos: 6,
  local_para_guarda_provisoria_de_animais: 0, patio_de_retencao_de_veiculos: 10,
  plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos: 6, ponto_de_pouso_para_aeronaves: 3,
  rampa_de_fiscalizacao_de_veiculos: 10, recepcao: 3, sala_administrativa_escritorio: 6,
  sala_de_assepsia: 0, sala_de_aula: 3, sala_de_reuniao: 0, sala_de_revista_pessoal: 0,
  sala_operacional_observatorio: 10, sala_tecnica: 6, sanitario_publico: 10,
  telefone_publico: 3, torre_de_telecomunicacoes: 6, vestiario_para_nao_policiais: 3,
  vestiario_para_policiais: 6
};

export const AMBIENTES_DELEGACIA = {
  almoxarifado: 10, area_de_servico: 6, area_de_uso_compartilhado_com_outros_orgaos: 0,
  arquivo: 0, auditorio: 3, banheiro_para_zeladoria: 3, box_com_chuveiro_externo: 3,
  box_para_lavagem_de_veiculos: 0, canil: 0, casa_de_maquinas: 6, central_de_gas: 6,
  cobertura_para_aglomeracao_de_usuarios: 0, cobertura_para_fiscalizacao_de_veiculos: 0,
  copa_e_cozinha: 6, deposito_de_lixo: 6, deposito_de_materiais_de_descarte_e_baixa: 0,
  deposito_de_material_de_limpeza: 3, deposito_de_material_operacional: 3,
  estacionamento_para_usuarios: 6, garagem_para_servidores: 6, garagem_para_viaturas: 10,
  lavabo_para_servidores_sem_box_para_chuveiro: 0, local_para_custodia_temporaria_de_detidos: 0,
  local_para_guarda_provisoria_de_animais: 0, patio_de_retencao_de_veiculos: 0,
  plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos: 0, ponto_de_pouso_para_aeronaves: 0,
  rampa_de_fiscalizacao_de_veiculos: 0, recepcao: 10, sala_administrativa_escritorio: 10,
  sala_de_assepsia: 0, sala_de_aula: 3, sala_de_reuniao: 6, sala_de_revista_pessoal: 0,
  sala_operacional_observatorio: 0, sala_tecnica: 6, sanitario_publico: 10,
  telefone_publico: 3, torre_de_telecomunicacoes: 10, vestiario_para_nao_policiais: 6,
  vestiario_para_policiais: 6
};

// Mapeamento entre tipo_de_unidade do formulário e nome_tipo da tabela tipos_imoveis
const TIPO_UNIDADE_MAP: {[key: string]: string} = {
  'UOP': 'UOP',
  'Unidade Operacional': 'UOP',
  'Posto de Fiscalização': 'UOP',
  'Delegacia': 'DEL',
  'DEL': 'DEL',
  'Sede Administrativa': 'Sede Administrativa',
  'Centro de Treinamento': 'Centro de Treinamento',
  'Núcleo de Capacitação': 'UOP', // legado - mapeia para UOP
};

export const mapTipoUnidadeToNomeTipo = (tipoUnidade: string): string => {
  return TIPO_UNIDADE_MAP[tipoUnidade] || tipoUnidade;
};

export const CAMPOS_JA_CALCULADOS = [
  'alojamento_masculino', 'alojamento_feminino', 'alojamento_misto',
  'banheiro_masculino_para_servidores', 'banheiro_feminino_para_servidoras', 'banheiro_misto_para_servidores'
];
