# Guia de Migração do Banco de Dados - Aplicação RVR

## 1. Visão Geral da Arquitetura de Dados

Este documento fornece instruções completas para exportar, importar e configurar o banco de dados PostgreSQL da aplicação RVR em uma VPS na nuvem.

### 1.1. Informações Importantes

- **SGBD:** PostgreSQL 15 ou superior
- **Extensões Necessárias:** `uuid-ossp`, `pgcrypto`
- **Schemas:** `public`, `auth` (Supabase Auth)
- **Total de Tabelas:** 9 tabelas principais
- **Total de Functions:** 13 funções customizadas
- **Total de Triggers:** 3 triggers ativos

---

## 2. Estrutura das Tabelas

### 2.1. Diagrama de Relacionamentos

```
profiles (usuários)
    ↓
dados_caip (imóveis) ← manutencao_ambientes
    ↓                       ↓
tipos_imoveis          caderno_ambientes
    ↓
imoveis → imovel_ambientes_existentes

avaliacoes_historico
responsaveis_tecnicos
valores_cub
security_audit_log
```

### 2.2. Tabelas por Ordem de Criação

**IMPORTANTE:** Respeite esta ordem ao criar as tabelas para evitar erros de foreign key.

#### **Passo 1: Criar ENUM Types**

```sql
-- Tipo ENUM para perfis de usuário
CREATE TYPE public.app_role AS ENUM ('usuario_padrao', 'admin');
```

#### **Passo 2: Tabelas Independentes (sem foreign keys)**

1. **profiles** - Perfis de usuários
2. **responsaveis_tecnicos** - Responsáveis técnicos
3. **valores_cub** - Valores CUB por UF
4. **tipos_imoveis** - Tipos de imóveis (UOP, Delegacia, etc.)
5. **avaliacoes_historico** - Histórico de avaliações RVR

#### **Passo 3: Tabelas Dependentes**

6. **dados_caip** - Cadastro completo de imóveis
7. **caderno_ambientes** - Ambientes por tipo de imóvel
8. **imoveis** - Cadastro básico de imóveis
9. **manutencao_ambientes** - Avaliações de manutenção
10. **imovel_ambientes_existentes** - Ambientes existentes por imóvel
11. **security_audit_log** - Log de auditoria de segurança

---

## 3. Exportação do Banco Atual (Supabase)

### 3.1. Via Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/sbefwlhezngkwsxybrsj
2. Vá em **Database** → **Backups**
3. Clique em **Create backup** (backup manual)
4. Após conclusão, clique em **Download** ao lado do backup

### 3.2. Via pg_dump (CLI)

```bash
# Instalar PostgreSQL client se necessário
sudo apt-get install postgresql-client

# Exportar schema + dados
pg_dump -h db.sbefwlhezngkwsxybrsj.supabase.co \
  -U postgres \
  -d postgres \
  -n public \
  --clean \
  --if-exists \
  -f rvr_backup_$(date +%Y%m%d).sql

# Exportar apenas schema (estrutura)
pg_dump -h db.sbefwlhezngkwsxybrsj.supabase.co \
  -U postgres \
  -d postgres \
  -n public \
  --schema-only \
  -f rvr_schema_$(date +%Y%m%d).sql

# Exportar apenas dados
pg_dump -h db.sbefwlhezngkwsxybrsj.supabase.co \
  -U postgres \
  -d postgres \
  -n public \
  --data-only \
  -f rvr_data_$(date +%Y%m%d).sql
```

### 3.3. Exportar Tabelas Específicas

```bash
# Exportar apenas tabelas selecionadas
pg_dump -h db.sbefwlhezngkwsxybrsj.supabase.co \
  -U postgres \
  -d postgres \
  -t public.profiles \
  -t public.dados_caip \
  -t public.manutencao_ambientes \
  --clean \
  --if-exists \
  -f rvr_tabelas_principais_$(date +%Y%m%d).sql
```

---

## 4. Preparação da VPS

### 4.1. Instalação do PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar versão (deve ser 15+)
psql --version
```

### 4.2. Configuração Inicial

```bash
# Acessar PostgreSQL como superusuário
sudo -u postgres psql

# Criar usuário para a aplicação
CREATE USER rvr_app WITH PASSWORD 'senha_forte_aqui';

# Criar database
CREATE DATABASE rvr_database OWNER rvr_app;

# Conectar ao database
\c rvr_database

# Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE rvr_database TO rvr_app;
GRANT ALL PRIVILEGES ON SCHEMA public TO rvr_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rvr_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rvr_app;

# Sair
\q
```

### 4.3. Configuração de Segurança (pg_hba.conf)

```bash
# Editar arquivo de autenticação
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Adicionar estas linhas (ajustar IPs conforme necessário):
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    rvr_database    rvr_app         10.0.0.0/8              scram-sha-256
host    rvr_database    rvr_app         127.0.0.1/32            scram-sha-256

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 4.4. Configuração de Rede (postgresql.conf)

```bash
# Editar configuração principal
sudo nano /etc/postgresql/15/main/postgresql.conf

# Permitir conexões externas (cuidado!)
listen_addresses = '*'  # ou especificar IPs: 'localhost,10.0.0.5'

# Otimizações recomendadas
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

## 5. Importação do Banco de Dados

### 5.1. Importação Completa

```bash
# Método 1: Via psql
psql -h localhost \
  -U rvr_app \
  -d rvr_database \
  -f rvr_backup_20251008.sql

# Método 2: Via pg_restore (se for arquivo custom)
pg_restore -h localhost \
  -U rvr_app \
  -d rvr_database \
  --clean \
  --if-exists \
  rvr_backup.dump
```

### 5.2. Importação Manual (Passo a Passo)

Se preferir criar manualmente, siga esta ordem:

```bash
# 1. Conectar ao banco
psql -h localhost -U rvr_app -d rvr_database

-- 2. Criar ENUMs
CREATE TYPE public.app_role AS ENUM ('usuario_padrao', 'admin');

-- 3. Executar script de criação de tabelas
\i /caminho/para/create_tables.sql

-- 4. Executar script de functions
\i /caminho/para/create_functions.sql

-- 5. Executar script de triggers
\i /caminho/para/create_triggers.sql

-- 6. Executar script de RLS policies
\i /caminho/para/create_rls_policies.sql

-- 7. Importar dados
\i /caminho/para/insert_data.sql
```

### 5.3. Verificação Pós-Importação

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verificar RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Contar registros em cada tabela
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM public.profiles) as count_profiles,
  (SELECT COUNT(*) FROM public.dados_caip) as count_dados_caip,
  (SELECT COUNT(*) FROM public.valores_cub) as count_valores_cub;
```

---

## 6. Scripts SQL Essenciais

### 6.1. Script de Criação de Tabelas

Disponível no diretório: `supabase/migrations/`

**Ordem de Execução:**
1. `00001_create_enums.sql`
2. `00002_create_profiles.sql`
3. `00003_create_valores_cub.sql`
4. `00004_create_tipos_imoveis.sql`
5. `00005_create_dados_caip.sql`
6. `00006_create_caderno_ambientes.sql`
7. `00007_create_manutencao_ambientes.sql`
8. `00008_create_security_audit_log.sql`
9. `00009_create_functions.sql`
10. `00010_create_triggers.sql`
11. `00011_create_rls_policies.sql`

### 6.2. Functions Críticas

**IMPORTANTE:** Estas functions são essenciais para o funcionamento:

1. **has_role(user_id, role)** - Verificação de perfil
2. **is_admin()** - Verifica se usuário é admin
3. **calcular_nota_manutencao(imovel_id)** - Calcula nota de manutenção
4. **calcular_nota_global(imovel_id)** - Calcula nota global
5. **trigger_atualizar_nota_manutencao()** - Atualiza notas automaticamente
6. **log_role_changes()** - Registra alterações de perfil

### 6.3. Triggers Ativos

1. **trigger_atualizar_nota_manutencao** em `manutencao_ambientes`
2. **log_role_changes_trigger** em `profiles`
3. **update_updated_at** em tabelas com timestamp

---

## 7. Políticas RLS (Row Level Security)

### 7.1. Importância do RLS

O RLS é **CRÍTICO** para a segurança da aplicação. Garante que:
- Usuários só vejam dados de sua unidade gestora
- Administradores tenham acesso total
- Não haja escalação de privilégios

### 7.2. Habilitar RLS em Todas as Tabelas

```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_caip ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencao_ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valores_cub ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsaveis_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caderno_ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imovel_ambientes_existentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
```

### 7.3. Políticas Principais

Consulte o arquivo completo em: `supabase/migrations/00011_create_rls_policies.sql`

**Exemplo de política crítica:**

```sql
-- Prevenir escalação de privilégios
CREATE POLICY "users_cannot_change_own_role"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);
```

---

## 8. Autenticação (Supabase Auth vs. Custom Auth)

### 8.1. Usando Supabase Auth (Recomendado)

Se continuar usando Supabase apenas para autenticação:

```typescript
// Manter integração Supabase apenas para auth
const supabase = createClient(
  'https://sbefwlhezngkwsxybrsj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

// Conectar ao banco próprio para dados
const pool = new Pool({
  host: 'sua-vps.com',
  database: 'rvr_database',
  user: 'rvr_app',
  password: 'senha_forte',
  port: 5432
});
```

### 8.2. Implementar Autenticação Própria

Se quiser autenticação 100% própria:

1. Implementar tabela `auth.users`
2. Criar sistema de JWT
3. Adaptar todas as policies que usam `auth.uid()`
4. Implementar OAuth2 com Google

**Referência:** Consulte `docs/implementacao-auth-propria.md` (criar se necessário)

---

## 9. Migrações e Versionamento

### 9.1. Controle de Versões do Schema

Recomenda-se usar ferramentas como:

- **Flyway** (Java-based)
- **Liquibase** (XML/JSON)
- **Sqitch** (Git-like para SQL)
- **Alembic** (Python)

### 9.2. Exemplo com Flyway

```bash
# Instalar Flyway
wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.22.0/flyway-commandline-9.22.0-linux-x64.tar.gz | tar xvz

# Configurar
cat > flyway.conf <<EOF
flyway.url=jdbc:postgresql://localhost:5432/rvr_database
flyway.user=rvr_app
flyway.password=senha_forte
flyway.locations=filesystem:./sql/migrations
EOF

# Executar migrações
./flyway migrate

# Ver histórico
./flyway info
```

---

## 10. Backup e Recuperação

### 10.1. Script de Backup Automático

```bash
#!/bin/bash
# /usr/local/bin/backup_rvr.sh

BACKUP_DIR="/var/backups/postgresql/rvr"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/rvr_backup_$TIMESTAMP.sql"

# Criar diretório se não existe
mkdir -p $BACKUP_DIR

# Executar backup
pg_dump -h localhost \
  -U rvr_app \
  -d rvr_database \
  --clean \
  --if-exists \
  -f $BACKUP_FILE

# Comprimir
gzip $BACKUP_FILE

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "rvr_backup_*.sql.gz" -mtime +30 -delete

# Log
echo "$(date): Backup concluído - $BACKUP_FILE.gz" >> /var/log/rvr_backup.log
```

### 10.2. Cron para Backup Diário

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup às 2h da manhã todos os dias)
0 2 * * * /usr/local/bin/backup_rvr.sh
```

### 10.3. Restauração de Backup

```bash
# Descomprimir
gunzip rvr_backup_20251008_020000.sql.gz

# Restaurar
psql -h localhost \
  -U rvr_app \
  -d rvr_database \
  -f rvr_backup_20251008_020000.sql
```

---

## 11. Monitoramento e Manutenção

### 11.1. Queries Úteis para Monitoramento

```sql
-- Tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Conexões ativas
SELECT 
  count(*),
  state,
  usename
FROM pg_stat_activity
WHERE datname = 'rvr_database'
GROUP BY state, usename;

-- Queries lentas (últimas 24h)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE datname = 'rvr_database')
ORDER BY mean_time DESC
LIMIT 20;

-- Índices não utilizados
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public';
```

### 11.2. Manutenção Regular

```sql
-- Análise e limpeza semanal
VACUUM ANALYZE;

-- Reindexação mensal
REINDEX DATABASE rvr_database;

-- Atualizar estatísticas
ANALYZE;
```

---

## 12. Segurança Adicional

### 12.1. Configurar SSL/TLS

```bash
# Gerar certificados
sudo openssl req -new -text -nodes \
  -keyout /etc/ssl/private/server.key \
  -out /etc/ssl/certs/server.crt \
  -days 3650

# Configurar postgresql.conf
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
```

### 12.2. Firewall (UFW)

```bash
# Permitir apenas IPs específicos
sudo ufw allow from 203.0.113.5 to any port 5432
sudo ufw enable
```

### 12.3. Auditoria de Acesso

```sql
-- Habilitar log de conexões
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_duration = 'on';
ALTER SYSTEM SET log_statement = 'ddl';

-- Recarregar configuração
SELECT pg_reload_conf();
```

---

## 13. Checklist de Implantação

- [ ] PostgreSQL 15+ instalado
- [ ] Extensões uuid-ossp e pgcrypto criadas
- [ ] Usuário `rvr_app` criado
- [ ] Database `rvr_database` criada
- [ ] Backup do Supabase baixado
- [ ] ENUMs criados
- [ ] Tabelas importadas (ordem correta)
- [ ] Functions importadas
- [ ] Triggers criados
- [ ] RLS habilitado em todas as tabelas
- [ ] Policies RLS configuradas
- [ ] Dados importados
- [ ] Testes de conexão bem-sucedidos
- [ ] Backup automático configurado
- [ ] SSL/TLS configurado (produção)
- [ ] Firewall configurado
- [ ] Monitoramento configurado
- [ ] Documentação atualizada

---

## 14. Troubleshooting

### 14.1. Erro: "relation does not exist"

```sql
-- Verificar schema correto
SET search_path TO public;

-- Recriar tabela
\i create_table_nome.sql
```

### 14.2. Erro: "permission denied"

```sql
-- Conceder permissões
GRANT ALL ON TABLE nome_tabela TO rvr_app;
GRANT USAGE ON SCHEMA public TO rvr_app;
```

### 14.3. Erro: "RLS policy violated"

```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'nome_tabela';

-- Testar com admin
SET ROLE rvr_app;
SELECT * FROM nome_tabela;
```

---

## 15. Contato e Suporte

**Desenvolvedor:** Daniel Nunes de Ávila  
**E-mail:** daniel.avila@prf.gov.br  
**Telefone:** 81 97116-8618  
**Unidade:** DEL03/SPRF/PE  

---

**Versão do Documento:** 1.0  
**Data:** 08/10/2025  
**Última Atualização:** 08/10/2025  

*Documento técnico elaborado conforme padrões da PRF.*
