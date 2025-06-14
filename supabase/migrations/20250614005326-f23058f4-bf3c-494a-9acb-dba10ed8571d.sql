-- Criar nova tabela manutencao_ambientes
CREATE TABLE public.manutencao_ambientes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    imovel_id uuid NOT NULL REFERENCES public.dados_caip(id) ON DELETE CASCADE,
    ambiente_id uuid NOT NULL REFERENCES public.caderno_ambientes(id) ON DELETE CASCADE,
    score_conservacao SMALLINT NOT NULL CHECK (score_conservacao BETWEEN 1 AND 5),
    observacoes TEXT,
    data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (imovel_id, ambiente_id)
);

COMMENT ON TABLE public.manutencao_ambientes IS 'Armazena a nota de estado de conservação (1 a 5) para cada ambiente existente de um imóvel.';
COMMENT ON COLUMN public.manutencao_ambientes.imovel_id IS 'Referência ao imóvel na tabela dados_caip.';
COMMENT ON COLUMN public.manutencao_ambientes.ambiente_id IS 'Referência ao ambiente padrão na tabela caderno_ambientes.';
COMMENT ON COLUMN public.manutencao_ambientes.score_conservacao IS 'Nota de 1 (Péssimo) a 5 (Ótimo) para o estado de conservação.';

-- Adicionar novas colunas à tabela dados_caip
ALTER TABLE public.dados_caip
ADD COLUMN IF NOT EXISTS nota_para_manutencao NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS nota_global NUMERIC(5, 2);

COMMENT ON COLUMN public.dados_caip.nota_para_manutencao IS 'Nota de 0 a 100 que representa o estado de conservação geral do imóvel.';
COMMENT ON COLUMN public.dados_caip.nota_global IS 'Nota final ponderada: (Adequação * 0.6) + (Manutenção * 0.4).';

-- Habilitar RLS na nova tabela
ALTER TABLE public.manutencao_ambientes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para manutencao_ambientes
CREATE POLICY "Todos podem visualizar avaliações de manutenção"
ON public.manutencao_ambientes
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem inserir avaliações"
ON public.manutencao_ambientes
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar avaliações"
ON public.manutencao_ambientes
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar avaliações"
ON public.manutencao_ambientes
FOR DELETE
USING (auth.uid() IS NOT NULL);