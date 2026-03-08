# MCP Server — SIGI PRF Imóveis

## Visão Geral

Servidor MCP (Model Context Protocol) que expõe dados dos imóveis da PRF para integração com aplicações externas (ex: assistentes de IA, sistemas de laudos).

- **Protocolo:** MCP Streamable HTTP (JSON-RPC 2.0)
- **Autenticação:** Nenhuma (acesso público, somente leitura)
- **URL:** `https://sbefwlhezngkwsxybrsj.supabase.co/functions/v1/mcp-imoveis`

---

## Como Conectar

### Headers obrigatórios (POST)

```
Content-Type: application/json
Accept: application/json, text/event-stream
```

### Fluxo de inicialização

**1. Initialize**

```json
POST /functions/v1/mcp-imoveis

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": { "name": "meu-app", "version": "1.0.0" }
  }
}
```

**Resposta:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "capabilities": { "tools": { "listChanged": true } },
    "protocolVersion": "2025-03-26",
    "serverInfo": { "name": "sigi-prf-imoveis", "version": "1.0.0" }
  }
}
```

**2. Listar tools disponíveis**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

**3. Chamar uma tool**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_imoveis",
    "arguments": { "query": "Florianópolis" }
  }
}
```

---

## Tools Disponíveis

### `get_campos_disponiveis`

Retorna a lista completa de campos disponíveis nos imóveis, com tipo e descrição de cada um.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| *(nenhum)* | — | — | — |

**Exemplo de resposta (resumida):**

```json
{
  "total_campos": 55,
  "campos": [
    { "campo": "nome_da_unidade", "tipo": "text", "descricao": "Nome do imóvel/unidade" },
    { "campo": "area_construida_m2", "tipo": "number", "descricao": "Área construída em metros quadrados" }
  ]
}
```

---

### `list_imoveis`

Lista imóveis com paginação e filtros opcionais. Retorna todos os campos.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `unidade_gestora` | string | Não | Filtrar por UG (ex: `SPRF/SC`) |
| `tipo_de_unidade` | string | Não | Filtrar por tipo (`UOP`, `DEL`, `Sede Administrativa`, `Centro de Treinamento`) |
| `ano_caip` | string | Não | Filtrar por ano CAIP (ex: `2025`) |
| `limit` | number | Não | Máx. registros (padrão: 50, máx: 200) |
| `offset` | number | Não | Offset para paginação (padrão: 0) |

**Exemplo:**

```json
{
  "arguments": {
    "unidade_gestora": "SPRF/SC",
    "tipo_de_unidade": "UOP",
    "limit": 10
  }
}
```

**Resposta:**

```json
{
  "total": 42,
  "limit": 10,
  "offset": 0,
  "data": [
    {
      "id": "uuid-...",
      "nome_da_unidade": "UOP Barra Velha",
      "endereco": "BR-101, km 89",
      "area_construida_m2": 350,
      "nota_global": 72.5,
      "estado_de_conservacao": "C",
      "..."
    }
  ]
}
```

---

### `search_imoveis`

Busca textual parcial por nome ou endereço.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `query` | string | **Sim** | Termo de busca |
| `limit` | number | Não | Máx. resultados (padrão: 20, máx: 100) |

---

### `get_imovel`

Busca um imóvel específico pelo UUID.

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | string | **Sim** | UUID do imóvel |

---

## Campos Retornados

### Identificação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | Identificador único |
| `nome_da_unidade` | text | Nome do imóvel/unidade |
| `endereco` | text | Endereço completo |
| `coordenadas` | text | Coordenadas geográficas |
| `zona` | text | Urbana/Rural |
| `unidade_gestora` | text | UG responsável |
| `tipo_de_unidade` | text | UOP, DEL, Sede, etc. |
| `tipo_de_imovel` | text | Próprio, alugado, cedido |
| `situacao_do_imovel` | text | Situação atual |
| `rip` | text | Registro Imobiliário Patrimonial |
| `matricula_do_imovel` | text | Matrícula no cartório |
| `processo_sei` | text | Número do processo SEI |
| `implantacao_da_unidade` | text | Tipo de implantação |
| `ano_caip` | text | Ano do CAIP |

### Áreas e Métricas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `area_construida_m2` | number | Área construída (m²) |
| `area_do_terreno_m2` | number | Área do terreno (m²) |
| `area_do_patio_para_retencao_de_veiculos_m2` | number | Área do pátio (m²) |
| `area_da_cobertura_de_pista_m2` | number | Cobertura de pista (m²) |
| `vida_util_estimada_anos` | number | Vida útil estimada |
| `idade_aparente_do_imovel` | number | Idade aparente (anos) |

### Avaliação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `estado_de_conservacao` | text | Estado (A-H) |
| `nota_global` | number | Nota global (0-100) |
| `nota_para_adequacao` | text | Nota de adequação |
| `nota_para_manutencao` | text | Nota de manutenção |
| `rvr` | number | Valor de Referência (R$) |
| `ano_da_ultima_reavaliacao_rvr` | text | Ano da última reavaliação |

### Infraestrutura

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `fornecimento_de_agua` | text | Tipo de fornecimento |
| `fornecimento_de_energia_eletrica` | text | Tipo de energia |
| `esgotamento_sanitario` | text | Tipo de esgoto |
| `conexao_de_internet` | text | Tipo de internet |
| `possui_wireless_wifi` | text | Sim/Não |
| `energia_solar` | text | Sim/Não |
| `acessibilidade` | text | Condição |
| `blindagem` | text | Sim/Não |
| `abastecimento_de_agua` | text | Sistema de abastecimento |
| `climatizacao_de_ambientes` | text | Sistema de climatização |
| `energia_eletrica_de_emergencia` | text | Sistema emergencial |
| `protecao_contra_incendios` | text | Sistema contra incêndio |
| `protecao_contra_intrusao` | text | Sistema contra intrusão |
| `cabeamento_estruturado` | text | Rede cabeada |
| `radiocomunicacao` | text | Sistema de rádio |

### Segurança

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `sala_cofre` | text | Sim/Não |
| `claviculario` | text | Sim/Não |
| `concertina` | text | Sim/Não |
| `muro_ou_alambrado` | text | Sim/Não |

### Ambientes (todos Sim/Não)

`almoxarifado`, `alojamento_feminino`, `alojamento_masculino`, `alojamento_misto`, `area_de_servico`, `area_de_uso_compartilhado_com_outros_orgaos`, `arquivo`, `auditorio`, `banheiro_para_zeladoria`, `banheiro_feminino_para_servidoras`, `banheiro_masculino_para_servidores`, `banheiro_misto_para_servidores`, `box_com_chuveiro_externo`, `box_para_lavagem_de_veiculos`, `canil`, `casa_de_maquinas`, `central_de_gas`, `cobertura_para_aglomeracao_de_usuarios`, `cobertura_para_fiscalizacao_de_veiculos`, `copa_e_cozinha`, `deposito_de_lixo`, `deposito_de_materiais_de_descarte_e_baixa`, `deposito_de_material_de_limpeza`, `deposito_de_material_operacional`, `estacionamento_para_usuarios`, `garagem_para_servidores`, `garagem_para_viaturas`, `lavabo_para_servidores_sem_box_para_chuveiro`, `local_para_custodia_temporaria_de_detidos`, `local_para_guarda_provisoria_de_animais`, `patio_de_retencao_de_veiculos`, `plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos`, `ponto_de_pouso_para_aeronaves`, `rampa_de_fiscalizacao_de_veiculos`, `recepcao`, `sala_administrativa_escritorio`, `sala_de_assepsia`, `sala_de_aula`, `sala_de_reuniao`, `sala_de_revista_pessoal`, `sala_operacional_observatorio`, `sala_tecnica`, `sanitario_publico`, `telefone_publico`, `torre_de_telecomunicacoes`, `vestiario_para_nao_policiais`, `vestiario_para_policiais`

### Imagens

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `imagem_geral` | text | URL da imagem geral |
| `imagem_fachada` | text | URL da fachada |
| `imagem_lateral_1` | text | URL lateral 1 |
| `imagem_lateral_2` | text | URL lateral 2 |
| `imagem_fundos` | text | URL dos fundos |
| `imagem_sala_cofre` | text | URL da sala cofre |
| `imagem_cofre` | text | URL do cofre |
| `imagem_interna_alojamento_masculino` | text | URL alojamento masculino |
| `imagem_interna_alojamento_feminino` | text | URL alojamento feminino |
| `imagem_interna_plantao_uop` | text | URL plantão UOP |

### Manutenção

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ano_da_ultima_intervencao_na_infraestrutura_do_imovel` | text | Ano da última intervenção |
| `tempo_de_intervencao` | text | Tempo da intervenção |
| `precisaria_de_qual_intervencao` | text | Intervenção necessária |
| `ha_contrato_de_manutencao_predial` | text | Sim/Não |
| `ha_plano_de_manutencao_do_imovel` | text | Sim/Não |

### Metadados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `preenchido` | text | Status de preenchimento |
| `percentual_preenchimento` | text | % de preenchimento |
| `cadastrador` | text | Quem cadastrou |
| `alterador` | text | Quem alterou por último |
| `ultima_alteracao` | text | Data da última alteração |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

---

## Testando com MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Informe a URL: `https://sbefwlhezngkwsxybrsj.supabase.co/functions/v1/mcp-imoveis`

---

## Mapeamento para Formulários de Laudos

| Campo do Formulário | Campo MCP |
|---------------------|-----------|
| Nome do imóvel | `nome_da_unidade` |
| Endereço | `endereco` |
| Coordenadas | `coordenadas` |
| Unidade Gestora | `unidade_gestora` |
| Tipo de Unidade | `tipo_de_unidade` |
| Tipo de Imóvel | `tipo_de_imovel` |
| RIP | `rip` |
| Matrícula | `matricula_do_imovel` |
| Área Construída | `area_construida_m2` |
| Área do Terreno | `area_do_terreno_m2` |
| Idade Aparente / Ano de Construção | `idade_aparente_do_imovel` |
| Vida Útil Estimada | `vida_util_estimada_anos` |
| Estado de Conservação | `estado_de_conservacao` |
| Nota Global | `nota_global` |
| RVR | `rvr` |
| Imagem Geral | `imagem_geral` |
| Imagem Fachada | `imagem_fachada` |
