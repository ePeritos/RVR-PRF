

# Plano: Gerar Capítulo DOCX para Manual da PRF — Fluxo CAIP e RVR

## Objetivo
Criar um documento Word (.docx) profissional e detalhado, pronto para inserção no manual institucional da PRF, descrevendo os fluxos operacionais do CAIP e do RVR conforme implementados no sistema.

## Estrutura do Capítulo

O documento terá a seguinte organização:

**1. Introdução**
- Objetivo do capítulo e contextualização dos módulos CAIP e RVR

**2. Módulo CAIP — Cadastro de Avaliação de Imóveis para Programação**
- 2.1 Visão Geral e Finalidade
- 2.2 Perfis de Acesso (Admin vs Usuário Padrão — filtro por unidade gestora)
- 2.3 Fluxo de Cadastro — passo a passo com as 9 seções do formulário:
  1. Informações Básicas (UG, tipo unidade, nome, ano CAIP — anos ímpares)
  2. Registro Fotográfico (10 campos de imagem, limite 5MB)
  3. Localização e Dados do Imóvel (endereço, coordenadas, RIP, matrícula, estado conservação A-H)
  4. Dados Técnicos e Áreas (vida útil, áreas m², idade aparente, checkboxes técnicos)
  5. Infraestrutura e Utilidades (7 itens: água, energia, esgoto, internet, etc.)
  6. Ambientes (40+ ambientes com marcação Sim/Não + avaliação por estrelas obrigatória)
  7. Sistemas e Equipamentos (10 itens: climatização, proteção incêndio, etc.)
  8. Segurança e Proteção (4 itens: claviculário, sala cofre, concertina, muro)
  9. Notas e Avaliação (notas calculadas automaticamente: adequação, manutenção, global)
- 2.4 Sistema de Notas — metodologia de cálculo (pesos UOP vs DEL, fórmula 60/40)
- 2.5 Controle de Edição (lock de registro, barra de progresso)
- 2.6 Filtros e Consulta de Registros
- 2.7 Upload em Lote de Imagens (funcionalidade admin)

**3. Módulo RVR — Relatório de Valor Referencial**
- 3.1 Visão Geral e Finalidade
- 3.2 Fluxo em 3 Etapas:
  - Etapa 1: Seleção de Imóveis (filtros por ano, UG, tipo, nome)
  - Etapa 2: Parâmetros RVR (valor m², CUB/m², BDI, responsável técnico, UF, padrão construtivo)
  - Etapa 3: Relatório RVR (resultados calculados, geração de PDF)
- 3.3 Metodologia de Cálculo (Ross-Heidecke)
  - Custo de Reedição = Área Construída × CUB/m² × (1 + BDI%)
  - Valor do Terreno = Área Terreno × Valor/m²
  - Depreciação via tabela Ross-Heidecke (idade % × estado conservação A-H)
  - Valor do Imóvel = Valor Terreno + Valor Depreciado da Benfeitoria
- 3.4 Geração de Relatório PDF (conteúdo: dados gerais, resultados, memorial de cálculo, responsabilidade técnica)

**4. Integração entre Módulos**
- CAIP alimenta o RVR com dados cadastrais
- Vistorias de Manutenção complementam com avaliações de terceirizados
- Fluxo ponta-a-ponta: Cadastro CAIP → Vistoria → Reavaliação RVR

**5. Controle de Acesso e Segurança**
- Autenticação Google Workspace (@prf.gov.br)
- RLS por unidade gestora
- Perfis: admin, usuario_padrao, terceirizado

## Detalhes Técnicos da Implementação

- Usar `docx-js` (npm) para gerar o DOCX
- Formatação profissional: fonte Arial, títulos hierárquicos, tabelas formatadas
- Paleta de cores institucional (azul PRF)
- Cabeçalho com referência "Manual PRF — Capítulo: Fluxo CAIP e RVR"
- Rodapé com numeração de páginas
- Tabelas para campos do formulário e parâmetros
- Saída em `/mnt/documents/capitulo_caip_rvr.docx`

