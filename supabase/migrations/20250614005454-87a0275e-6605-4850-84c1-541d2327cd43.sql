-- Função para calcular a nota de manutenção
CREATE OR REPLACE FUNCTION public.calcular_nota_manutencao(p_imovel_id uuid)
RETURNS numeric AS $$
DECLARE
    v_potencial_maximo numeric := 0;
    v_score_efetivo numeric := 0;
    v_nota_final numeric := 0;
    v_tipo_unidade text;
    ambiente_record RECORD;
BEGIN
    -- Buscar o tipo de unidade do imóvel
    SELECT tipo_de_unidade INTO v_tipo_unidade
    FROM public.dados_caip
    WHERE id = p_imovel_id;
    
    -- Se não encontrar o imóvel ou tipo, retorna 0
    IF v_tipo_unidade IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Iterar sobre todos os ambientes avaliados para este imóvel
    FOR ambiente_record IN
        SELECT ma.score_conservacao, ca.nome_ambiente, ca.peso
        FROM public.manutencao_ambientes ma
        JOIN public.caderno_ambientes ca ON ma.ambiente_id = ca.id
        JOIN public.tipos_imoveis ti ON ca.tipo_imovel_id = ti.id
        WHERE ma.imovel_id = p_imovel_id
          AND ti.nome_tipo = v_tipo_unidade
    LOOP
        -- Calcular potencial máximo (peso * 5)
        v_potencial_maximo := v_potencial_maximo + (ambiente_record.peso * 5);
        
        -- Calcular score efetivo (peso * score_conservacao)
        v_score_efetivo := v_score_efetivo + (ambiente_record.peso * ambiente_record.score_conservacao);
    END LOOP;
    
    -- Calcular a nota final
    IF v_potencial_maximo > 0 THEN
        v_nota_final := (v_score_efetivo / v_potencial_maximo) * 100;
    ELSE
        v_nota_final := 0;
    END IF;
    
    -- Garantir que não ultrapasse 100
    v_nota_final := LEAST(v_nota_final, 100);
    
    RETURN ROUND(v_nota_final, 2);
END;
$$ LANGUAGE plpgsql;

-- Função para calcular a nota global
CREATE OR REPLACE FUNCTION public.calcular_nota_global(p_imovel_id uuid)
RETURNS numeric AS $$
DECLARE
    v_nota_adequacao numeric := 0;
    v_nota_manutencao numeric := 0;
    v_nota_global numeric := 0;
BEGIN
    -- Buscar as notas do imóvel
    SELECT 
        COALESCE(nota_para_adequacao::numeric, 0),
        COALESCE(nota_para_manutencao, 0)
    INTO v_nota_adequacao, v_nota_manutencao
    FROM public.dados_caip
    WHERE id = p_imovel_id;
    
    -- Calcular nota global: (Adequação * 0.6) + (Manutenção * 0.4)
    v_nota_global := (v_nota_adequacao * 0.6) + (v_nota_manutencao * 0.4);
    
    RETURN ROUND(v_nota_global, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger function para atualizar nota de manutenção
CREATE OR REPLACE FUNCTION public.trigger_atualizar_nota_manutencao()
RETURNS trigger AS $$
DECLARE
    v_imovel_id uuid;
    v_nova_nota_manutencao numeric;
    v_nova_nota_global numeric;
BEGIN
    -- Determinar o imovel_id baseado na operação
    IF TG_OP = 'DELETE' THEN
        v_imovel_id := OLD.imovel_id;
    ELSE
        v_imovel_id := NEW.imovel_id;
    END IF;
    
    -- Calcular nova nota de manutenção
    v_nova_nota_manutencao := public.calcular_nota_manutencao(v_imovel_id);
    
    -- Atualizar a nota de manutenção
    UPDATE public.dados_caip
    SET nota_para_manutencao = v_nova_nota_manutencao
    WHERE id = v_imovel_id;
    
    -- Calcular e atualizar a nota global
    v_nova_nota_global := public.calcular_nota_global(v_imovel_id);
    
    UPDATE public.dados_caip
    SET nota_global = v_nova_nota_global
    WHERE id = v_imovel_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function para atualizar nota global quando adequação mudar
CREATE OR REPLACE FUNCTION public.trigger_atualizar_nota_global()
RETURNS trigger AS $$
DECLARE
    v_nova_nota_global numeric;
BEGIN
    -- Apenas atualizar se as notas relevantes mudaram
    IF OLD.nota_para_adequacao IS DISTINCT FROM NEW.nota_para_adequacao 
       OR OLD.nota_para_manutencao IS DISTINCT FROM NEW.nota_para_manutencao THEN
        
        -- Calcular nova nota global
        v_nova_nota_global := public.calcular_nota_global(NEW.id);
        
        -- Atualizar apenas se a nova nota for diferente
        IF v_nova_nota_global IS DISTINCT FROM NEW.nota_global THEN
            NEW.nota_global := v_nova_nota_global;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
CREATE TRIGGER trigger_manutencao_ambientes_nota
    AFTER INSERT OR UPDATE OR DELETE
    ON public.manutencao_ambientes
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_atualizar_nota_manutencao();

CREATE TRIGGER trigger_dados_caip_nota_global
    BEFORE UPDATE
    ON public.dados_caip
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_atualizar_nota_global();