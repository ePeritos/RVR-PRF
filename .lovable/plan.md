

## Plano: Adicionar lista de imóveis individuais na aba Preenchimento

### Problema
Atualmente, a aba "Preenchimento" mostra apenas dados agregados por regional (média, contagem). Quando o usuário filtra por uma unidade gestora, não consegue ver quais imóveis específicos precisam de atenção.

### Solução
Adicionar uma seção "Detalhamento por Imóvel" no `CompletionDashboard.tsx` que lista cada imóvel individualmente com seu percentual de preenchimento, status e campos faltantes. A seção aparece sempre, mas é mais útil quando filtrado por unidade gestora.

### Alterações

**Arquivo: `src/components/dashboard/CompletionDashboard.tsx`**

1. Adicionar uma nova seção abaixo da tabela "Detalhamento por Regional" com uma tabela de imóveis individuais contendo:
   - Nome da unidade (`nome_da_unidade`)
   - Tipo de unidade (`tipo_de_unidade`)
   - Unidade gestora (abreviada)
   - Percentual de preenchimento com barra de progresso
   - Badge de status (Completo/Parcial/Baixo)

2. A tabela será ordenada por percentual de preenchimento (menor primeiro) para priorizar onde atuar.

3. Adicionar paginação simples (mostrar 20 por vez com botão "Carregar mais") para não sobrecarregar a tela com centenas de registros.

4. Adicionar campo de busca por nome do imóvel para facilitar a localização.

5. Adicionar filtro por status (Completo/Parcial/Baixo) via botões de toggle para focar nos que precisam de atenção.

### Detalhes técnicos
- Usa `useMemo` para calcular a lista de imóveis com percentual parseado
- Estado local para paginação (`visibleCount`), busca (`searchTerm`) e filtro de status (`statusFilter`)
- Importar `Search` do lucide-react e `Input` do UI
- Reutilizar `getCompletionBadge` já existente
- Dados vêm do mesmo prop `data` já passado ao componente

