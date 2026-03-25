

# Plano: Diagnóstico e Recuperação de Dados CAIP 2025

## Problema Identificado

Após análise do código, identifiquei um **bug na interação entre `register()` e `onCheckedChange`** nos checkboxes. Todas as seções (Ambientes, Infraestrutura, Sistemas, Segurança, Dados Técnicos) usam este padrão:

```jsx
<Checkbox 
  {...register(key)}              // ← register injeta onChange que grava boolean
  checked={value === 'Sim'}
  onCheckedChange={(checked) => setValue(key, checked ? 'Sim' : 'Não')}
/>
```

O `{...register(key)}` do react-hook-form injeta um `onChange` que pode gravar `true`/`false` (boolean) no formulário, competindo com o `onCheckedChange` que grava `'Sim'`/`'Não'`. Dependendo da ordem de execução, o valor final pode ser `true` em vez de `'Sim'`. Ao salvar, `processFormData` converte `true` para `null` (pois não é string vazia mas também não é tratado), e o campo é persistido como `null` no banco.

Na próxima edição, valores `null` não são carregados no formulário (linha 49: `if (value !== null)`), resultando em checkboxes desmarcados.

## Plano de Ação

### 1. Diagnóstico — Consultar dados no banco
Executar query para verificar o estado real dos campos checkbox nos registros CAIP 2025 e cruzar com `manutencao_ambientes` para confirmar a inconsistência.

### 2. Script de Recuperação via SQL
Criar uma migration que reconstrói os campos de ambientes a partir de `manutencao_ambientes`:
- Se existe registro em `manutencao_ambientes` para um `imovel_id` com `nome_ambiente = 'Almoxarifado'`, então `dados_caip.almoxarifado` deveria ser `'Sim'`
- Aplicar para todos os 40+ campos de ambientes
- Registros afetados: CAIP 2025 onde campos estão `null` mas `manutencao_ambientes` tem dados

### 3. Correção do Bug no Código
Remover `{...register(key)}` de TODOS os checkboxes nas 5 seções, mantendo apenas `checked` + `onCheckedChange` com `setValue`. Arquivos afetados:
- `EnvironmentsSection.tsx`
- `InfrastructureSection.tsx`
- `SystemsSection.tsx`
- `SecuritySection.tsx`
- `TechnicalDataSection.tsx`

### 4. Proteção adicional em `processFormData`
Adicionar tratamento para valores booleanos — converter `true` → `'Sim'` e `false` → `'Não'` — como camada de segurança extra.

## Limitações da Recuperação
- **Ambientes**: Recuperação total possível via `manutencao_ambientes`
- **Infraestrutura, Sistemas, Segurança, Dados Técnicos**: Estes checkboxes NÃO têm tabela auxiliar — se foram perdidos, não há fonte de dados para recuperar. Será necessário que os usuários remarquem manualmente esses campos.
- Podemos gerar um relatório (CSV) listando quais registros CAIP 2025 têm campos de infraestrutura/sistemas/segurança como `null` para que os usuários identifiquem quais precisam revisar.

