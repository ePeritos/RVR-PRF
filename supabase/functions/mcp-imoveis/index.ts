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
  name: "list_imoveis",
  description: "Lista imóveis da PRF com dados básicos. Suporta paginação e filtro por unidade gestora, tipo de unidade e ano CAIP.",
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
      .select(BASIC_FIELDS, { count: 'exact' });

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
  description: "Busca imóveis por nome ou endereço (busca textual parcial).",
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
      .select(BASIC_FIELDS)
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
  description: "Busca um imóvel específico pelo ID, retornando dados básicos.",
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
      .select(BASIC_FIELDS)
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
