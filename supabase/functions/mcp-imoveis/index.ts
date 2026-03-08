import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { McpServer, StreamableHttpTransport } from "npm:mcp-lite@^0.10.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ALL_FIELDS = 'id, nome_da_unidade, endereco, unidade_gestora, tipo_de_unidade, tipo_de_imovel, ano_caip, estado_de_conservacao, area_construida_m2, area_do_terreno_m2, area_do_patio_para_retencao_de_veiculos_m2, area_da_cobertura_de_pista_m2, area_da_cobertura_para_fiscalizacao_de_veiculos_m2, rip, matricula_do_imovel, situacao_do_imovel, coordenadas, zona, implantacao_da_unidade, processo_sei, servo2_pdi, nota_global, nota_para_adequacao, nota_para_manutencao, vida_util_estimada_anos, idade_aparente_do_imovel, rvr, ano_da_ultima_reavaliacao_rvr, ano_da_ultima_intervencao_na_infraestrutura_do_imovel, tempo_de_intervencao, precisaria_de_qual_intervencao, ha_contrato_de_manutencao_predial, ha_plano_de_manutencao_do_imovel, o_trecho_e_concessionado, acessibilidade, sustentabilidade, aproveitamento_da_agua_da_chuva, energia_solar, fornecimento_de_agua, fornecimento_de_energia_eletrica, esgotamento_sanitario, conexao_de_internet, possui_wireless_wifi, identidade_visual, blindagem, observacoes, almoxarifado, alojamento_feminino, alojamento_masculino, alojamento_misto, area_de_servico, area_de_uso_compartilhado_com_outros_orgaos, arquivo, auditorio, banheiro_para_zeladoria, banheiro_feminino_para_servidoras, banheiro_masculino_para_servidores, banheiro_misto_para_servidores, box_com_chuveiro_externo, box_para_lavagem_de_veiculos, canil, casa_de_maquinas, central_de_gas, cobertura_para_aglomeracao_de_usuarios, cobertura_para_fiscalizacao_de_veiculos, copa_e_cozinha, deposito_de_lixo, deposito_de_materiais_de_descarte_e_baixa, deposito_de_material_de_limpeza, deposito_de_material_operacional, estacionamento_para_usuarios, garagem_para_servidores, garagem_para_viaturas, lavabo_para_servidores_sem_box_para_chuveiro, local_para_custodia_temporaria_de_detidos, local_para_guarda_provisoria_de_animais, patio_de_retencao_de_veiculos, plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos, ponto_de_pouso_para_aeronaves, rampa_de_fiscalizacao_de_veiculos, recepcao, sala_administrativa_escritorio, sala_de_assepsia, sala_de_aula, sala_de_reuniao, sala_de_revista_pessoal, sala_operacional_observatorio, sala_tecnica, sanitario_publico, telefone_publico, torre_de_telecomunicacoes, vestiario_para_nao_policiais, vestiario_para_policiais, abastecimento_de_agua, aterramento_e_protecao_contra_descargas_atmosfericas, climatizacao_de_ambientes, coleta_de_lixo, energia_eletrica_de_emergencia, iluminacao_externa, protecao_contra_incendios, protecao_contra_intrusao, radiocomunicacao, cabeamento_estruturado, claviculario, sala_cofre, concertina, muro_ou_alambrado, imagem_geral, imagem_fachada, imagem_lateral_1, imagem_lateral_2, imagem_fundos, imagem_sala_cofre, imagem_cofre, imagem_interna_alojamento_masculino, imagem_interna_alojamento_feminino, imagem_interna_plantao_uop, preenchido, percentual_preenchimento, cadastrador, alterador, ultima_alteracao, created_at, updated_at';

const app = new Hono();

const mcpServer = new McpServer({
  name: "sigi-prf-imoveis",
  version: "1.0.0",
});

mcpServer.tool({
  name: "get_campos_disponiveis",
  description: "Retorna a lista de todos os campos disponíveis nos imóveis da PRF, com descrição e tipo de cada campo. Use para saber quais dados podem ser usados para preencher formulários.",
  inputSchema: { type: "object", properties: {} },
  handler: async () => {
    const campos = [
      { campo: "id", tipo: "uuid", descricao: "Identificador único do imóvel" },
      { campo: "nome_da_unidade", tipo: "text", descricao: "Nome do imóvel/unidade" },
      { campo: "endereco", tipo: "text", descricao: "Endereço completo do imóvel" },
      { campo: "coordenadas", tipo: "text", descricao: "Coordenadas geográficas (lat, lng)" },
      { campo: "zona", tipo: "text", descricao: "Zona (urbana/rural)" },
      { campo: "unidade_gestora", tipo: "text", descricao: "Unidade gestora responsável (ex: SPRF/SC)" },
      { campo: "tipo_de_unidade", tipo: "text", descricao: "Tipo de unidade (UOP, DEL, Sede Administrativa, Centro de Treinamento)" },
      { campo: "tipo_de_imovel", tipo: "text", descricao: "Tipo do imóvel (próprio, alugado, cedido, etc.)" },
      { campo: "situacao_do_imovel", tipo: "text", descricao: "Situação atual do imóvel" },
      { campo: "estado_de_conservacao", tipo: "text", descricao: "Estado de conservação (A-H)" },
      { campo: "ano_caip", tipo: "text", descricao: "Ano do CAIP" },
      { campo: "rip", tipo: "text", descricao: "Registro Imobiliário Patrimonial" },
      { campo: "matricula_do_imovel", tipo: "text", descricao: "Matrícula do imóvel no cartório" },
      { campo: "processo_sei", tipo: "text", descricao: "Número do processo SEI" },
      { campo: "implantacao_da_unidade", tipo: "text", descricao: "Tipo de implantação da unidade" },
      { campo: "area_construida_m2", tipo: "number", descricao: "Área construída em metros quadrados" },
      { campo: "area_do_terreno_m2", tipo: "number", descricao: "Área do terreno em metros quadrados" },
      { campo: "area_do_patio_para_retencao_de_veiculos_m2", tipo: "number", descricao: "Área do pátio para retenção de veículos (m²)" },
      { campo: "area_da_cobertura_de_pista_m2", tipo: "number", descricao: "Área da cobertura de pista (m²)" },
      { campo: "vida_util_estimada_anos", tipo: "number", descricao: "Vida útil estimada em anos" },
      { campo: "idade_aparente_do_imovel", tipo: "number", descricao: "Idade aparente do imóvel em anos (pode ser usado como Ano de Construção)" },
      { campo: "rvr", tipo: "number", descricao: "Valor de Referência do Imóvel (RVR) em reais" },
      { campo: "ano_da_ultima_reavaliacao_rvr", tipo: "text", descricao: "Ano da última reavaliação RVR" },
      { campo: "nota_global", tipo: "number", descricao: "Nota global do imóvel (0-100)" },
      { campo: "nota_para_adequacao", tipo: "text", descricao: "Nota de adequação (0-100)" },
      { campo: "nota_para_manutencao", tipo: "text", descricao: "Nota de manutenção (0-100)" },
      { campo: "ano_da_ultima_intervencao_na_infraestrutura_do_imovel", tipo: "text", descricao: "Ano da última intervenção na infraestrutura" },
      { campo: "tempo_de_intervencao", tipo: "text", descricao: "Tempo da intervenção" },
      { campo: "precisaria_de_qual_intervencao", tipo: "text", descricao: "Tipo de intervenção necessária" },
      { campo: "ha_contrato_de_manutencao_predial", tipo: "text", descricao: "Possui contrato de manutenção predial (Sim/Não)" },
      { campo: "ha_plano_de_manutencao_do_imovel", tipo: "text", descricao: "Possui plano de manutenção (Sim/Não)" },
      { campo: "observacoes", tipo: "text", descricao: "Observações gerais sobre o imóvel" },
      // Infraestrutura
      { campo: "fornecimento_de_agua", tipo: "text", descricao: "Tipo de fornecimento de água" },
      { campo: "fornecimento_de_energia_eletrica", tipo: "text", descricao: "Tipo de fornecimento de energia" },
      { campo: "esgotamento_sanitario", tipo: "text", descricao: "Tipo de esgotamento sanitário" },
      { campo: "conexao_de_internet", tipo: "text", descricao: "Tipo de conexão de internet" },
      { campo: "possui_wireless_wifi", tipo: "text", descricao: "Possui WiFi (Sim/Não)" },
      { campo: "energia_solar", tipo: "text", descricao: "Possui energia solar (Sim/Não)" },
      { campo: "acessibilidade", tipo: "text", descricao: "Condição de acessibilidade" },
      { campo: "blindagem", tipo: "text", descricao: "Possui blindagem (Sim/Não)" },
      // Ambientes (Sim/Não)
      { campo: "almoxarifado", tipo: "text", descricao: "Possui almoxarifado (Sim/Não)" },
      { campo: "alojamento_masculino", tipo: "text", descricao: "Possui alojamento masculino (Sim/Não)" },
      { campo: "alojamento_feminino", tipo: "text", descricao: "Possui alojamento feminino (Sim/Não)" },
      { campo: "copa_e_cozinha", tipo: "text", descricao: "Possui copa e cozinha (Sim/Não)" },
      { campo: "garagem_para_viaturas", tipo: "text", descricao: "Possui garagem para viaturas (Sim/Não)" },
      { campo: "sala_administrativa_escritorio", tipo: "text", descricao: "Possui sala administrativa (Sim/Não)" },
      { campo: "sala_de_reuniao", tipo: "text", descricao: "Possui sala de reunião (Sim/Não)" },
      { campo: "auditorio", tipo: "text", descricao: "Possui auditório (Sim/Não)" },
      // Imagens
      { campo: "imagem_geral", tipo: "text", descricao: "URL da imagem geral do imóvel" },
      { campo: "imagem_fachada", tipo: "text", descricao: "URL da imagem da fachada" },
      { campo: "imagem_lateral_1", tipo: "text", descricao: "URL da imagem lateral 1" },
      { campo: "imagem_lateral_2", tipo: "text", descricao: "URL da imagem lateral 2" },
      { campo: "imagem_fundos", tipo: "text", descricao: "URL da imagem dos fundos" },
      // Metadados
      { campo: "cadastrador", tipo: "text", descricao: "Nome de quem cadastrou" },
      { campo: "alterador", tipo: "text", descricao: "Nome de quem alterou por último" },
      { campo: "created_at", tipo: "timestamp", descricao: "Data de criação do registro" },
      { campo: "updated_at", tipo: "timestamp", descricao: "Data da última atualização" },
    ];
    return { content: [{ type: "text", text: JSON.stringify({ total_campos: campos.length, campos }, null, 2) }] };
  },
});

mcpServer.tool({
  name: "list_imoveis",
  description: "Lista imóveis da PRF com TODOS os dados disponíveis. Suporta paginação e filtro por unidade gestora, tipo de unidade e ano CAIP.",
  inputSchema: {
    type: "object",
    properties: {
      unidade_gestora: { type: "string", description: "Filtrar por unidade gestora (ex: SPRF/SC)" },
      tipo_de_unidade: { type: "string", description: "Filtrar por tipo (UOP, DEL, Sede Administrativa, Centro de Treinamento)" },
      ano_caip: { type: "string", description: "Filtrar por ano CAIP (ex: 2025)" },
      limit: { type: "number", description: "Quantidade máxima de registros (padrão: 50, máx: 200)" },
      offset: { type: "number", description: "Offset para paginação (padrão: 0)" },
    },
  },
  handler: async ({ unidade_gestora, tipo_de_unidade, ano_caip, limit, offset }: any) => {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const pageLimit = Math.min(limit || 50, 200);
    const pageOffset = offset || 0;

    let query = supabase
      .from('dados_caip')
      .select(ALL_FIELDS, { count: 'exact' });

    if (unidade_gestora) query = query.eq('unidade_gestora', unidade_gestora);
    if (tipo_de_unidade) query = query.eq('tipo_de_unidade', tipo_de_unidade);
    if (ano_caip) query = query.eq('ano_caip', ano_caip);

    const { data, error, count } = await query
      .order('nome_da_unidade')
      .range(pageOffset, pageOffset + pageLimit - 1);

    if (error) {
      return { content: [{ type: "text", text: `Erro: ${error.message}` }] };
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ total: count, limit: pageLimit, offset: pageOffset, data }, null, 2),
      }],
    };
  },
});

mcpServer.tool({
  name: "search_imoveis",
  description: "Busca imóveis por nome ou endereço (busca textual parcial). Retorna todos os campos disponíveis.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Termo de busca (nome ou endereço do imóvel)" },
      limit: { type: "number", description: "Quantidade máxima de resultados (padrão: 20, máx: 100)" },
    },
    required: ["query"],
  },
  handler: async ({ query, limit }: any) => {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const pageLimit = Math.min(limit || 20, 100);
    const searchTerm = `%${query}%`;

    const { data, error } = await supabase
      .from('dados_caip')
      .select(ALL_FIELDS)
      .or(`nome_da_unidade.ilike.${searchTerm},endereco.ilike.${searchTerm}`)
      .order('nome_da_unidade')
      .limit(pageLimit);

    if (error) {
      return { content: [{ type: "text", text: `Erro: ${error.message}` }] };
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ total: data?.length || 0, data }, null, 2),
      }],
    };
  },
});

mcpServer.tool({
  name: "get_imovel",
  description: "Busca um imóvel específico pelo ID, retornando todos os campos disponíveis.",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "UUID do imóvel" },
    },
    required: ["id"],
  },
  handler: async ({ id }: any) => {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('dados_caip')
      .select(ALL_FIELDS)
      .eq('id', id)
      .single();

    if (error) {
      return { content: [{ type: "text", text: `Erro: ${error.message}` }] };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  },
});

const transport = new StreamableHttpTransport();

app.all("/*", async (c) => {
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const response = await transport.handleRequest(c.req.raw, mcpServer);

  // Add CORS headers to the response
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
});

Deno.serve(app.fetch);
