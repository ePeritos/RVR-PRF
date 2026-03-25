

## Diagnóstico: Lógica do Percentual de Preenchimento na aba "Preenchimento"

### Como funciona hoje

**1. Cálculo do percentual (`useCAIPCalculations.tsx`)**

Quando um formulário CAIP é salvo, o sistema conta quantos campos da tabela `dados_caip` estão preenchidos (não nulos, não vazios) e divide pelo total de campos. O resultado é salvo como string inteira — por exemplo, `"75"` significa 75%.

```text
percentual = (camposPreenchidos / totalCampos) × 100
→ salvo como "75" no banco
```

**2. Leitura no Dashboard (`CompletionDashboard.tsx`)**

O dashboard lê esse valor e **multiplica por 100 novamente**:

```text
const pct = parseFloat(item.percentual_preenchimento || '0') * 100;
→ "75" × 100 = 7500
→ Math.min(7500, 100) = 100  ← tudo vira 100%!
```

### O problema

Existe uma **inconsistência de formato**: o cálculo salva como inteiro (ex: `"75"`), mas o dashboard interpreta como decimal (ex: `"0.75"`). O `Math.min(..., 100)` mascara o bug, fazendo quase todos os imóveis aparecerem como "Completo (≥80%)".

### Classificação dos imóveis

| Faixa | Status |
|-------|--------|
| ≥ 80% | Completo (verde) |
| 50–79% | Parcial (amarelo) |
| < 50% | Baixo (vermelho) |

### Outros pontos de atenção

- **Todos os ~100+ campos** são contados igualmente, incluindo metadados como `cadastrador`, `alterador`, `ultima_alteracao`, que são preenchidos automaticamente e inflam o percentual.
- Os campos de imagem e notas calculadas também entram na contagem.

### Plano de correção

1. **Arquivo `src/components/dashboard/CompletionDashboard.tsx`** — Remover a multiplicação por 100 na leitura do `percentual_preenchimento`, já que o valor já está em formato inteiro (0–100).

2. **Arquivo `src/hooks/useCAIPCalculations.tsx`** *(opcional, recomendado)* — Excluir campos de metadados da contagem para que o percentual reflita apenas os campos substantivos do formulário (dados do imóvel, ambientes, infraestrutura, etc.).

