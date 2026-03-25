-- Recovery: Restore environment checkbox fields from manutencao_ambientes data
-- For each record that has maintenance evaluations, set the corresponding checkbox to 'Sim'

-- First, normalize existing "on" values to "Sim" across ALL checkbox fields
UPDATE public.dados_caip
SET 
  almoxarifado = CASE WHEN almoxarifado = 'on' THEN 'Sim' ELSE almoxarifado END,
  alojamento_feminino = CASE WHEN alojamento_feminino = 'on' THEN 'Sim' ELSE alojamento_feminino END,
  alojamento_masculino = CASE WHEN alojamento_masculino = 'on' THEN 'Sim' ELSE alojamento_masculino END,
  alojamento_misto = CASE WHEN alojamento_misto = 'on' THEN 'Sim' ELSE alojamento_misto END,
  area_de_servico = CASE WHEN area_de_servico = 'on' THEN 'Sim' ELSE area_de_servico END,
  area_de_uso_compartilhado_com_outros_orgaos = CASE WHEN area_de_uso_compartilhado_com_outros_orgaos = 'on' THEN 'Sim' ELSE area_de_uso_compartilhado_com_outros_orgaos END,
  arquivo = CASE WHEN arquivo = 'on' THEN 'Sim' ELSE arquivo END,
  auditorio = CASE WHEN auditorio = 'on' THEN 'Sim' ELSE auditorio END,
  banheiro_para_zeladoria = CASE WHEN banheiro_para_zeladoria = 'on' THEN 'Sim' ELSE banheiro_para_zeladoria END,
  banheiro_feminino_para_servidoras = CASE WHEN banheiro_feminino_para_servidoras = 'on' THEN 'Sim' ELSE banheiro_feminino_para_servidoras END,
  banheiro_masculino_para_servidores = CASE WHEN banheiro_masculino_para_servidores = 'on' THEN 'Sim' ELSE banheiro_masculino_para_servidores END,
  banheiro_misto_para_servidores = CASE WHEN banheiro_misto_para_servidores = 'on' THEN 'Sim' ELSE banheiro_misto_para_servidores END,
  box_com_chuveiro_externo = CASE WHEN box_com_chuveiro_externo = 'on' THEN 'Sim' ELSE box_com_chuveiro_externo END,
  box_para_lavagem_de_veiculos = CASE WHEN box_para_lavagem_de_veiculos = 'on' THEN 'Sim' ELSE box_para_lavagem_de_veiculos END,
  canil = CASE WHEN canil = 'on' THEN 'Sim' ELSE canil END,
  casa_de_maquinas = CASE WHEN casa_de_maquinas = 'on' THEN 'Sim' ELSE casa_de_maquinas END,
  central_de_gas = CASE WHEN central_de_gas = 'on' THEN 'Sim' ELSE central_de_gas END,
  cobertura_para_aglomeracao_de_usuarios = CASE WHEN cobertura_para_aglomeracao_de_usuarios = 'on' THEN 'Sim' ELSE cobertura_para_aglomeracao_de_usuarios END,
  cobertura_para_fiscalizacao_de_veiculos = CASE WHEN cobertura_para_fiscalizacao_de_veiculos = 'on' THEN 'Sim' ELSE cobertura_para_fiscalizacao_de_veiculos END,
  copa_e_cozinha = CASE WHEN copa_e_cozinha = 'on' THEN 'Sim' ELSE copa_e_cozinha END,
  deposito_de_lixo = CASE WHEN deposito_de_lixo = 'on' THEN 'Sim' ELSE deposito_de_lixo END,
  deposito_de_materiais_de_descarte_e_baixa = CASE WHEN deposito_de_materiais_de_descarte_e_baixa = 'on' THEN 'Sim' ELSE deposito_de_materiais_de_descarte_e_baixa END,
  deposito_de_material_de_limpeza = CASE WHEN deposito_de_material_de_limpeza = 'on' THEN 'Sim' ELSE deposito_de_material_de_limpeza END,
  deposito_de_material_operacional = CASE WHEN deposito_de_material_operacional = 'on' THEN 'Sim' ELSE deposito_de_material_operacional END,
  estacionamento_para_usuarios = CASE WHEN estacionamento_para_usuarios = 'on' THEN 'Sim' ELSE estacionamento_para_usuarios END,
  garagem_para_servidores = CASE WHEN garagem_para_servidores = 'on' THEN 'Sim' ELSE garagem_para_servidores END,
  garagem_para_viaturas = CASE WHEN garagem_para_viaturas = 'on' THEN 'Sim' ELSE garagem_para_viaturas END,
  lavabo_para_servidores_sem_box_para_chuveiro = CASE WHEN lavabo_para_servidores_sem_box_para_chuveiro = 'on' THEN 'Sim' ELSE lavabo_para_servidores_sem_box_para_chuveiro END,
  local_para_custodia_temporaria_de_detidos = CASE WHEN local_para_custodia_temporaria_de_detidos = 'on' THEN 'Sim' ELSE local_para_custodia_temporaria_de_detidos END,
  local_para_guarda_provisoria_de_animais = CASE WHEN local_para_guarda_provisoria_de_animais = 'on' THEN 'Sim' ELSE local_para_guarda_provisoria_de_animais END,
  patio_de_retencao_de_veiculos = CASE WHEN patio_de_retencao_de_veiculos = 'on' THEN 'Sim' ELSE patio_de_retencao_de_veiculos END,
  plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos = CASE WHEN plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos = 'on' THEN 'Sim' ELSE plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos END,
  ponto_de_pouso_para_aeronaves = CASE WHEN ponto_de_pouso_para_aeronaves = 'on' THEN 'Sim' ELSE ponto_de_pouso_para_aeronaves END,
  rampa_de_fiscalizacao_de_veiculos = CASE WHEN rampa_de_fiscalizacao_de_veiculos = 'on' THEN 'Sim' ELSE rampa_de_fiscalizacao_de_veiculos END,
  recepcao = CASE WHEN recepcao = 'on' THEN 'Sim' ELSE recepcao END,
  sala_administrativa_escritorio = CASE WHEN sala_administrativa_escritorio = 'on' THEN 'Sim' ELSE sala_administrativa_escritorio END,
  sala_de_assepsia = CASE WHEN sala_de_assepsia = 'on' THEN 'Sim' ELSE sala_de_assepsia END,
  sala_de_aula = CASE WHEN sala_de_aula = 'on' THEN 'Sim' ELSE sala_de_aula END,
  sala_de_reuniao = CASE WHEN sala_de_reuniao = 'on' THEN 'Sim' ELSE sala_de_reuniao END,
  sala_de_revista_pessoal = CASE WHEN sala_de_revista_pessoal = 'on' THEN 'Sim' ELSE sala_de_revista_pessoal END,
  sala_operacional_observatorio = CASE WHEN sala_operacional_observatorio = 'on' THEN 'Sim' ELSE sala_operacional_observatorio END,
  sala_tecnica = CASE WHEN sala_tecnica = 'on' THEN 'Sim' ELSE sala_tecnica END,
  sanitario_publico = CASE WHEN sanitario_publico = 'on' THEN 'Sim' ELSE sanitario_publico END,
  telefone_publico = CASE WHEN telefone_publico = 'on' THEN 'Sim' ELSE telefone_publico END,
  torre_de_telecomunicacoes = CASE WHEN torre_de_telecomunicacoes = 'on' THEN 'Sim' ELSE torre_de_telecomunicacoes END,
  vestiario_para_nao_policiais = CASE WHEN vestiario_para_nao_policiais = 'on' THEN 'Sim' ELSE vestiario_para_nao_policiais END,
  vestiario_para_policiais = CASE WHEN vestiario_para_policiais = 'on' THEN 'Sim' ELSE vestiario_para_policiais END,
  -- Also fix infrastructure/systems/security "on" values
  fornecimento_de_agua = CASE WHEN fornecimento_de_agua = 'on' THEN 'Sim' ELSE fornecimento_de_agua END,
  fornecimento_de_energia_eletrica = CASE WHEN fornecimento_de_energia_eletrica = 'on' THEN 'Sim' ELSE fornecimento_de_energia_eletrica END,
  esgotamento_sanitario = CASE WHEN esgotamento_sanitario = 'on' THEN 'Sim' ELSE esgotamento_sanitario END,
  conexao_de_internet = CASE WHEN conexao_de_internet = 'on' THEN 'Sim' ELSE conexao_de_internet END,
  identidade_visual = CASE WHEN identidade_visual = 'on' THEN 'Sim' ELSE identidade_visual END,
  possui_wireless_wifi = CASE WHEN possui_wireless_wifi = 'on' THEN 'Sim' ELSE possui_wireless_wifi END,
  blindagem = CASE WHEN blindagem = 'on' THEN 'Sim' ELSE blindagem END,
  abastecimento_de_agua = CASE WHEN abastecimento_de_agua = 'on' THEN 'Sim' ELSE abastecimento_de_agua END,
  aterramento_e_protecao_contra_descargas_atmosfericas = CASE WHEN aterramento_e_protecao_contra_descargas_atmosfericas = 'on' THEN 'Sim' ELSE aterramento_e_protecao_contra_descargas_atmosfericas END,
  climatizacao_de_ambientes = CASE WHEN climatizacao_de_ambientes = 'on' THEN 'Sim' ELSE climatizacao_de_ambientes END,
  coleta_de_lixo = CASE WHEN coleta_de_lixo = 'on' THEN 'Sim' ELSE coleta_de_lixo END,
  energia_eletrica_de_emergencia = CASE WHEN energia_eletrica_de_emergencia = 'on' THEN 'Sim' ELSE energia_eletrica_de_emergencia END,
  iluminacao_externa = CASE WHEN iluminacao_externa = 'on' THEN 'Sim' ELSE iluminacao_externa END,
  protecao_contra_incendios = CASE WHEN protecao_contra_incendios = 'on' THEN 'Sim' ELSE protecao_contra_incendios END,
  protecao_contra_intrusao = CASE WHEN protecao_contra_intrusao = 'on' THEN 'Sim' ELSE protecao_contra_intrusao END,
  radiocomunicacao = CASE WHEN radiocomunicacao = 'on' THEN 'Sim' ELSE radiocomunicacao END,
  cabeamento_estruturado = CASE WHEN cabeamento_estruturado = 'on' THEN 'Sim' ELSE cabeamento_estruturado END,
  claviculario = CASE WHEN claviculario = 'on' THEN 'Sim' ELSE claviculario END,
  sala_cofre = CASE WHEN sala_cofre = 'on' THEN 'Sim' ELSE sala_cofre END,
  concertina = CASE WHEN concertina = 'on' THEN 'Sim' ELSE concertina END,
  muro_ou_alambrado = CASE WHEN muro_ou_alambrado = 'on' THEN 'Sim' ELSE muro_ou_alambrado END,
  ha_contrato_de_manutencao_predial = CASE WHEN ha_contrato_de_manutencao_predial = 'on' THEN 'Sim' ELSE ha_contrato_de_manutencao_predial END,
  ha_plano_de_manutencao_do_imovel = CASE WHEN ha_plano_de_manutencao_do_imovel = 'on' THEN 'Sim' ELSE ha_plano_de_manutencao_do_imovel END,
  o_trecho_e_concessionado = CASE WHEN o_trecho_e_concessionado = 'on' THEN 'Sim' ELSE o_trecho_e_concessionado END,
  acessibilidade = CASE WHEN acessibilidade = 'on' THEN 'Sim' ELSE acessibilidade END,
  sustentabilidade = CASE WHEN sustentabilidade = 'on' THEN 'Sim' ELSE sustentabilidade END,
  aproveitamento_da_agua_da_chuva = CASE WHEN aproveitamento_da_agua_da_chuva = 'on' THEN 'Sim' ELSE aproveitamento_da_agua_da_chuva END,
  energia_solar = CASE WHEN energia_solar = 'on' THEN 'Sim' ELSE energia_solar END
WHERE ano_caip = '2025';

-- Now restore environment checkboxes from manutencao_ambientes
-- Using the mapping from caderno_ambientes.nome_ambiente to dados_caip column names

UPDATE public.dados_caip dc
SET
  almoxarifado = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Almoxarifado') THEN 'Sim' ELSE dc.almoxarifado END,
  area_de_servico = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Área de serviço') THEN 'Sim' ELSE dc.area_de_servico END,
  area_de_uso_compartilhado_com_outros_orgaos = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente IN ('Área de uso compartilhado', 'Área de uso compartilhado com outros órgãos')) THEN 'Sim' ELSE dc.area_de_uso_compartilhado_com_outros_orgaos END,
  arquivo = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Arquivo') THEN 'Sim' ELSE dc.arquivo END,
  auditorio = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Auditório') THEN 'Sim' ELSE dc.auditorio END,
  banheiro_para_zeladoria = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Banheiro para zeladoria') THEN 'Sim' ELSE dc.banheiro_para_zeladoria END,
  box_com_chuveiro_externo = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Box com chuveiro externo') THEN 'Sim' ELSE dc.box_com_chuveiro_externo END,
  box_para_lavagem_de_veiculos = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Box para lavagem de veículos') THEN 'Sim' ELSE dc.box_para_lavagem_de_veiculos END,
  canil = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Canil') THEN 'Sim' ELSE dc.canil END,
  casa_de_maquinas = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Casa de máquinas') THEN 'Sim' ELSE dc.casa_de_maquinas END,
  central_de_gas = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Central de gás') THEN 'Sim' ELSE dc.central_de_gas END,
  cobertura_para_aglomeracao_de_usuarios = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Cobertura para aglomeração de usuários') THEN 'Sim' ELSE dc.cobertura_para_aglomeracao_de_usuarios END,
  cobertura_para_fiscalizacao_de_veiculos = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Cobertura para fiscalização de veículos') THEN 'Sim' ELSE dc.cobertura_para_fiscalizacao_de_veiculos END,
  copa_e_cozinha = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Copa e cozinha') THEN 'Sim' ELSE dc.copa_e_cozinha END,
  deposito_de_lixo = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Depósito de lixo') THEN 'Sim' ELSE dc.deposito_de_lixo END,
  deposito_de_materiais_de_descarte_e_baixa = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Depósito de materiais de descarte e baixa') THEN 'Sim' ELSE dc.deposito_de_materiais_de_descarte_e_baixa END,
  deposito_de_material_de_limpeza = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Depósito de material de limpeza') THEN 'Sim' ELSE dc.deposito_de_material_de_limpeza END,
  deposito_de_material_operacional = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Depósito de material operacional') THEN 'Sim' ELSE dc.deposito_de_material_operacional END,
  estacionamento_para_usuarios = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Estacionamento para usuários') THEN 'Sim' ELSE dc.estacionamento_para_usuarios END,
  garagem_para_servidores = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Garagem para servidores') THEN 'Sim' ELSE dc.garagem_para_servidores END,
  garagem_para_viaturas = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Garagem para viaturas') THEN 'Sim' ELSE dc.garagem_para_viaturas END,
  lavabo_para_servidores_sem_box_para_chuveiro = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente IN ('Lavabo para servidores sem box para chuveiro', 'Lavabo para servidores')) THEN 'Sim' ELSE dc.lavabo_para_servidores_sem_box_para_chuveiro END,
  local_para_custodia_temporaria_de_detidos = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Local para custódia temporária de detidos') THEN 'Sim' ELSE dc.local_para_custodia_temporaria_de_detidos END,
  local_para_guarda_provisoria_de_animais = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Local para guarda provisória de animais') THEN 'Sim' ELSE dc.local_para_guarda_provisoria_de_animais END,
  patio_de_retencao_de_veiculos = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Pátio de retenção de veículos') THEN 'Sim' ELSE dc.patio_de_retencao_de_veiculos END,
  plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente IN ('Plataforma para fiscalização da parte superior dos veículos', 'Plataforma para fiscalização de veículos')) THEN 'Sim' ELSE dc.plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos END,
  ponto_de_pouso_para_aeronaves = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Ponto de pouso para aeronaves') THEN 'Sim' ELSE dc.ponto_de_pouso_para_aeronaves END,
  rampa_de_fiscalizacao_de_veiculos = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Rampa de fiscalização de veículos') THEN 'Sim' ELSE dc.rampa_de_fiscalizacao_de_veiculos END,
  recepcao = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Recepção') THEN 'Sim' ELSE dc.recepcao END,
  sala_administrativa_escritorio = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente IN ('Sala administrativa/escritório', 'Sala administrativa / Escritório')) THEN 'Sim' ELSE dc.sala_administrativa_escritorio END,
  sala_de_assepsia = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Sala de assepsia') THEN 'Sim' ELSE dc.sala_de_assepsia END,
  sala_de_aula = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Sala de aula') THEN 'Sim' ELSE dc.sala_de_aula END,
  sala_de_reuniao = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Sala de reunião') THEN 'Sim' ELSE dc.sala_de_reuniao END,
  sala_de_revista_pessoal = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Sala de revista pessoal') THEN 'Sim' ELSE dc.sala_de_revista_pessoal END,
  sala_operacional_observatorio = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente IN ('Sala operacional/observatório', 'Sala operacional / Observatório')) THEN 'Sim' ELSE dc.sala_operacional_observatorio END,
  sala_tecnica = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Sala técnica') THEN 'Sim' ELSE dc.sala_tecnica END,
  sanitario_publico = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Sanitário público') THEN 'Sim' ELSE dc.sanitario_publico END,
  telefone_publico = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Telefone público') THEN 'Sim' ELSE dc.telefone_publico END,
  torre_de_telecomunicacoes = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Torre de telecomunicações') THEN 'Sim' ELSE dc.torre_de_telecomunicacoes END,
  vestiario_para_nao_policiais = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Vestiário para não-policiais') THEN 'Sim' ELSE dc.vestiario_para_nao_policiais END,
  vestiario_para_policiais = CASE WHEN EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Vestiário para policiais') THEN 'Sim' ELSE dc.vestiario_para_policiais END
WHERE ano_caip = '2025'
  AND EXISTS (SELECT 1 FROM manutencao_ambientes ma WHERE ma.imovel_id = dc.id);

-- Handle Alojamento (composite: maps to alojamento_masculino, alojamento_feminino, alojamento_misto)
-- If "Alojamento" evaluation exists and ALL three are null/Não, set alojamento_misto to Sim
UPDATE public.dados_caip dc
SET alojamento_misto = 'Sim'
WHERE ano_caip = '2025'
  AND EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Alojamento')
  AND COALESCE(dc.alojamento_masculino, 'Não') != 'Sim'
  AND COALESCE(dc.alojamento_feminino, 'Não') != 'Sim'
  AND COALESCE(dc.alojamento_misto, 'Não') != 'Sim';

-- Handle Banheiro para servidores (composite)
UPDATE public.dados_caip dc
SET banheiro_misto_para_servidores = 'Sim'
WHERE ano_caip = '2025'
  AND EXISTS (SELECT 1 FROM manutencao_ambientes ma JOIN caderno_ambientes ca ON ma.ambiente_id = ca.id WHERE ma.imovel_id = dc.id AND ca.nome_ambiente = 'Banheiro para servidores')
  AND COALESCE(dc.banheiro_masculino_para_servidores, 'Não') != 'Sim'
  AND COALESCE(dc.banheiro_feminino_para_servidoras, 'Não') != 'Sim'
  AND COALESCE(dc.banheiro_misto_para_servidores, 'Não') != 'Sim';