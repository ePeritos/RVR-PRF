# Documentação Técnica – Aplicação RVR

## 1. Arquitetura da Solução

### 1.1. Objetivo

A aplicação RVR foi desenvolvida como uma ferramenta interna para otimizar processos específicos da Polícia Rodoviária Federal, proporcionando uma interface web moderna e segura para reavaliação de valores contábeis de imóveis utilizando o método Ross-Heideck, facilitando a atualização dos valores patrimoniais e auxiliando na solução de eventuais restrições contábeis.

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

**Sistema de Autenticação:** A aplicação utiliza o sistema de autenticação do Supabase, que implementa padrões de segurança reconhecidos internacionalmente.

**Processo de Login:** autenticação por e-mail Google.

**Perfis de Usuário:** Usuário Padrão

**Controle de Acesso:** Implementação de Row Level Security (RLS) garantindo que cada usuário acesse apenas os dados autorizados conforme seu perfil e permissões.

### 2.2. Segurança de Dados em Trânsito

- **Protocolo:** HTTPS com certificado SSL/TLS válido
- **Criptografia:** TLS 1.2 ou superior para toda comunicação
- **Verificação:** Certificado digital validado por autoridade certificadora reconhecida
- **Headers de Segurança:** Implementação de headers HTTP de segurança (HSTS, CSP, X-Frame-Options)

### 2.3. Segurança de Dados em Repouso

- **Criptografia:** Os dados são armazenados no Supabase com criptografia padrão AES-256
- **Backup:** Sistema automatizado de backup gerenciado pelo Supabase
- **Localização:** Dados armazenados em data centers com certificações de segurança internacionais
- **RLS (Row Level Security):** Políticas implementadas a nível de banco de dados garantindo isolamento de dados por usuário

### 2.4. Tratamento de Dados Sensíveis

A aplicação não armazena dados classificados como sensíveis pela LGPD. Os dados processados são limitados a informações funcionais necessárias para o cumprimento das atividades institucionais da PRF.



### 2.5. Monitoramento e Auditoria

- **Logs de Acesso:** Registro de todas as operações de login e acesso
- **Logs de Aplicação:** Monitoramento de erros e atividades da aplicação
- **Retenção:** Logs mantidos por período adequado conforme políticas de segurança

## 3. Fluxo de Dados

### 3.1. Dados Coletados

A aplicação coleta os seguintes tipos de dados:

**Dados de Identificação:**
- Nome completo, Matrícula funcional, E-mail institucional

**Dados Funcionais:**
- Registros de avaliações imobiliárias (método Ross-Heideck)
- Relatórios gerados para atualização do valor contábil de cada imóvel
- Histórico de cálculos e parâmetros utilizados
- Dados dos imóveis do CAIP (Cadastro de Avaliação de Imóveis Próprios)

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

- **Tempo de Resposta:** < 3 segundos para operações de cálculo RVR
- **Concorrência:** Suporte para até 50 usuários simultâneos
- **Disponibilidade:** 99.5% de uptime garantido pela infraestrutura Supabase/Hostinger

### 4.2. Manutenção

- **Atualizações:** Deploy contínuo via Git com rollback automático
- **Monitoramento:** Supabase Analytics + logs de aplicação integrados
- **Suporte:** Desenvolvedor interno com conhecimento completo da aplicação

### 4.3. Conformidade

- **LGPD:** Aplicação desenvolvida em conformidade com a Lei Geral de Proteção de Dados
- **Padrões de Segurança:** Seguimento das boas práticas de desenvolvimento seguro
- **Políticas Internas:** Alinhamento com as diretrizes de TI da PRF

---

*Documento técnico elaborado conforme padrões de documentação da Polícia Rodoviária Federal.*

**Versão:** 1.0  
**Data:** 12/06/2025 
**Responsável:** Daniel Nunes de Ávila