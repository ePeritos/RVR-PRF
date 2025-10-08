# Documentação Técnica – Aplicação RVR

## 1. Arquitetura da Solução

### 1.1. Objetivo

A aplicação RVR foi desenvolvida como uma ferramenta interna para otimizar processos específicos da Polícia Rodoviária Federal, proporcionando uma interface web moderna e segura para:

- **Reavaliação de Valores Contábeis (RVR):** Cálculo automático utilizando o método Ross-Heideck para atualização de valores patrimoniais
- **Cadastro de Avaliação de Imóveis Próprios (CAIP):** Registro completo de informações técnicas, estruturais e fotográficas dos imóveis da PRF
- **Dashboards Customizáveis:** Visualização de dados com gráficos interativos e tabelas ordenáveis por coluna
- **Gestão Documental:** Geração automatizada de relatórios técnicos em PDF
- **Controle de Acesso:** Sistema robusto de autenticação e permissões por unidade gestora

### 1.2. Diagrama de Arquitetura Simplificado

```
┌─────────────────┐    HTTPS/TLS    ┌─────────────────────┐    API Segura    ┌─────────────────┐
│                 │ ◄──────────────► │                     │ ◄───────────────► │                 │
│ Usuário         │                  │ Servidor Aplicação  │                   │ Banco de Dados  │
│ (Navegador Web) │                  │ (VPS Hostinger)     │                   │ (Supabase)      │
│                 │                  │                     │                   │                 │
└─────────────────┘                  └─────────────────────┘                   └─────────────────┘
```

### 1.3. Componentes Técnicos

#### **Frontend**
- **Tecnologia:** React 18, TypeScript, HTML5, CSS3
- **Build Tool:** Vite com React SWC Plugin
- **Framework de UI:** Tailwind CSS + Shadcn UI Components
- **Roteamento:** React Router DOM v6
- **Estado Global:** TanStack React Query
- **Responsividade:** Interface adaptável para diferentes dispositivos
- **Compatibilidade:** Navegadores modernos (Chrome, Firefox, Safari, Edge)

#### **Backend**
- **Tecnologia:** Supabase (Backend-as-a-Service)
- **Framework:** PostgreSQL com Row Level Security (RLS)
- **API:** REST API automática gerada pelo Supabase
- **Servidor Web:** Infraestrutura gerenciada pelo Supabase
- **Runtime Environment:** Serverless Functions (Edge Functions)

#### **Banco de Dados**
- **Plataforma:** Supabase (Backend-as-a-Service)
- **Engine:** PostgreSQL
- **Recursos Utilizados:**
  - Autenticação integrada
  - Row Level Security (RLS)
  - API REST automática
  - Realtime subscriptions (se aplicável)

#### **Hospedagem**
- **Provedor:** Hostinger
- **Tipo:** VPS (Virtual Private Server)
- **Sistema Operacional:** Linux (distribuição gerenciada pelo provedor)
- **Recursos:** VPS com recursos escaláveis conforme demanda

## 2. Segurança da Informação

### 2.1. Autenticação e Autorização

**Sistema de Autenticação:** A aplicação utiliza o sistema de autenticação do Supabase com OAuth2/OpenID Connect, implementando padrões de segurança reconhecidos internacionalmente.

**Processo de Login:** Autenticação via Google Workspace (@prf.gov.br) com validação de domínio institucional.

**Perfis de Usuário:** 
- **Usuário Padrão:** Acesso aos dados de sua unidade gestora
- **Administrador:** Acesso completo ao sistema e gestão de todas as unidades

**Controle de Acesso Granular:** 
- Implementação de Row Level Security (RLS) em todas as tabelas
- Políticas específicas por perfil (usuário/administrador)
- Isolamento de dados por unidade gestora (unidade_gestora)
- Proteção contra escalação de privilégios
- Auditoria de alterações de perfil registradas em `security_audit_log`

### 2.2. Segurança de Dados em Trânsito

- **Protocolo:** HTTPS com certificado SSL/TLS válido
- **Criptografia:** TLS 1.2 ou superior para toda comunicação
- **Verificação:** Certificado digital validado por autoridade certificadora reconhecida
- **Headers de Segurança:** Implementação de headers HTTP de segurança (HSTS, CSP, X-Frame-Options)

### 2.3. Segurança de Dados em Repouso

- **Criptografia:** Os dados são armazenados no Supabase com criptografia padrão AES-256
- **Backup:** Sistema automatizado de backup gerenciado pelo Supabase com redundância
- **Localização:** Dados armazenados em data centers com certificações de segurança internacionais
- **RLS (Row Level Security):** Políticas implementadas e auditadas em todas as tabelas:
  - Prevenção de escalação de privilégios no campo `role` da tabela `profiles`
  - Isolamento por unidade gestora em `dados_caip`, `manutencao_ambientes`
  - Políticas específicas para administradores e usuários padrão
  - Proteção em cascata em tabelas relacionadas (`caderno_ambientes`, `imoveis`, etc.)
- **Proteção de Funções:** Todas as funções PostgreSQL utilizam `search_path` explícito prevenindo ataques de manipulação de schema

### 2.4. Tratamento de Dados Sensíveis

A aplicação não armazena dados classificados como sensíveis pela LGPD. Os dados processados são limitados a informações funcionais necessárias para o cumprimento das atividades institucionais da PRF.



### 2.5. Monitoramento e Auditoria

- **Logs de Acesso:** Registro automático de todas as operações de login via Supabase Auth
- **Logs de Aplicação:** Monitoramento contínuo de erros, warnings e atividades via Supabase Analytics
- **Auditoria de Segurança:** Tabela dedicada `security_audit_log` registrando:
  - Alterações de perfil de usuários (role changes)
  - Timestamp e identificação do usuário responsável
  - Valores anteriores e novos para rastreabilidade completa
- **Triggers Automáticos:** Gatilhos em nível de banco de dados para registro automático de eventos críticos
- **Retenção:** Logs mantidos indefinidamente para conformidade com políticas de segurança da PRF

## 3. Fluxo de Dados

### 3.1. Dados Coletados

A aplicação coleta os seguintes tipos de dados:

**Dados de Identificação:**
- Nome completo, Matrícula funcional, E-mail institucional

**Dados Funcionais:**
- Registros de avaliações imobiliárias (método Ross-Heideck)
- Relatórios gerados para atualização do valor contábil de cada imóvel (RVR)
- Histórico de cálculos e parâmetros utilizados
- Dados completos dos imóveis do CAIP (Cadastro de Avaliação de Imóveis Próprios):
  - Informações cadastrais e localização
  - Características técnicas e estruturais
  - Sistemas de infraestrutura (elétrica, hidráulica, climatização, etc.)
  - Ambientes e áreas construídas
  - Imagens e documentação fotográfica
  - Notas de adequação e manutenção
- Configurações de dashboards e gráficos customizados
- Unidade gestora de vinculação do usuário

**Dados Técnicos:**
- Endereço IP (para fins de segurança)
- Logs de acesso e auditoria
- Timestamps de operações

### 3.2. Finalidade da Coleta

Todos os dados coletados têm como finalidade exclusiva:
- Autenticação e controle de acesso à aplicação
- Execução das funcionalidades específicas da ferramenta
- Auditoria e segurança da informação
- Cumprimento das atividades institucionais da PRF

### 3.3. Compartilhamento de Dados

**Princípio Geral:** Os dados não são compartilhados com terceiros para fins comerciais, publicitários ou não relacionados à finalidade institucional.

**Operadores de Dados:**
- **Hostinger (Hospedagem):** Acesso limitado aos dados necessários para manutenção da infraestrutura
- **Supabase (Banco de Dados):** Acesso aos dados conforme contrato de prestação de serviços, atuando como operador de dados

**Contratos de Operação:** Ambos os provedores operam sob contratos que garantem confidencialidade e uso adequado dos dados conforme LGPD.

## 4. Especificações Técnicas Complementares

### 4.1. Performance

- **Tempo de Resposta:** 
  - Operações de cálculo RVR: < 2 segundos
  - Consultas ao banco de dados: < 1 segundo (com RLS otimizado)
  - Geração de relatórios PDF: < 5 segundos
  - Renderização de dashboards: < 2 segundos
- **Concorrência:** Suporte para até 100 usuários simultâneos (escalável via Supabase)
- **Disponibilidade:** 99.5% de uptime garantido pela infraestrutura Supabase/Hostinger
- **Otimizações:**
  - Lazy loading de imagens e componentes
  - Cache de queries com TanStack React Query
  - Índices em colunas críticas do banco de dados
  - Compressão de assets via Vite

### 4.2. Manutenção

- **Atualizações:** 
  - Deploy contínuo via Git com integração Lovable
  - Rollback automático em caso de falhas
  - Versionamento semântico (SemVer)
  - Testes automatizados antes de deployment
- **Monitoramento:** 
  - Supabase Analytics para métricas de banco de dados
  - Logs de aplicação em tempo real
  - Alertas automáticos para erros críticos
  - Dashboard de performance e uso
- **Suporte:** Desenvolvedor interno (Daniel Nunes de Ávila) com conhecimento completo da stack
- **Documentação:** Código documentado + docs técnicas atualizadas + knowledge base no projeto

### 4.3. Conformidade

- **LGPD:** Aplicação desenvolvida em conformidade com a Lei Geral de Proteção de Dados
- **Padrões de Segurança:** Seguimento das boas práticas de desenvolvimento seguro
- **Políticas Internas:** Alinhamento com as diretrizes de TI da PRF

## 5. Funcionalidades Principais

### 5.1. Módulo RVR (Reavaliação de Valores)
- Cálculo automatizado usando método Ross-Heideck
- Importação de dados via planilhas Excel
- Geração de relatórios em PDF
- Histórico de avaliações

### 5.2. Módulo CAIP (Cadastro de Avaliação de Imóveis)
- Formulário completo de cadastro com 9 seções principais
- Upload e gerenciamento de imagens
- Cálculo automático de notas de adequação
- Sistema de manutenção e avaliação de ambientes
- Geração de relatórios técnicos com fotos

### 5.3. Dashboard Analytics
- Visualizações customizáveis (gráficos de barras, pizza, linha, área, scatter)
- Tabelas interativas com ordenação por colunas (A-Z)
- Filtros dinâmicos por campo
- Salvamento de configurações de gráficos
- Exportação de dados

### 5.4. Gestão de Relatórios
- Templates profissionais pré-configurados
- Exportação em PDF otimizado
- Impressão direta do navegador
- Personalização de campos incluídos

---

*Documento técnico elaborado conforme padrões de documentação da Polícia Rodoviária Federal.*

**Versão:** 2.0  
**Data:** 08/10/2025  
**Última Atualização:** 08/10/2025 (Inclusão de melhorias de segurança e novas funcionalidades)  
**Responsável:** Daniel Nunes de Ávila

## Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | 12/06/2025 | Versão inicial da documentação |
| 2.0 | 08/10/2025 | Atualização com melhorias de segurança (RLS aprimorado, auditoria), novas funcionalidades (ordenação de tabelas, dashboards customizáveis) e expansão das especificações técnicas |