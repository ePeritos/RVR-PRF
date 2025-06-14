-- Corrigir função calcular_nota_global para usar o tipo correto
CREATE OR REPLACE FUNCTION public.calcular_nota_global(p_imovel_id uuid)
RETURNS numeric AS $$
DECLARE
    v_nota_adequacao numeric := 0;
    v_nota_manutencao numeric := 0;
    v_nota_global numeric := 0;
BEGIN
    -- Buscar as notas do imóvel
    SELECT 
        COALESCE(CAST(nota_para_adequacao AS numeric), 0),
        COALESCE(nota_para_manutencao, 0)
    INTO v_nota_adequacao, v_nota_manutencao
    FROM public.dados_caip
    WHERE id = p_imovel_id;
    
    -- Calcular nota global: (Adequação * 0.6) + (Manutenção * 0.4)
    v_nota_global := (v_nota_adequacao * 0.6) + (v_nota_manutencao * 0.4);
    
    RETURN ROUND(v_nota_global, 2);
END;
$$ LANGUAGE plpgsql;