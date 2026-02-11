-- Fix calcular_nota_global: nota_para_manutencao is text, needs CAST
CREATE OR REPLACE FUNCTION public.calcular_nota_global(p_imovel_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_nota_adequacao numeric := 0;
    v_nota_manutencao numeric := 0;
    v_nota_global numeric := 0;
BEGIN
    SELECT 
        COALESCE(CAST(nota_para_adequacao AS numeric), 0),
        COALESCE(CAST(nota_para_manutencao AS numeric), 0)
    INTO v_nota_adequacao, v_nota_manutencao
    FROM public.dados_caip
    WHERE id = p_imovel_id;
    
    v_nota_global := (v_nota_adequacao * 0.6) + (v_nota_manutencao * 0.4);
    
    RETURN ROUND(v_nota_global, 2);
END;
$function$;

-- Also fix the trigger to cast numeric to text when setting nota_para_manutencao
CREATE OR REPLACE FUNCTION public.trigger_atualizar_nota_manutencao()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_imovel_id uuid;
    v_nova_nota_manutencao numeric;
    v_nova_nota_global numeric;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_imovel_id := OLD.imovel_id;
    ELSE
        v_imovel_id := NEW.imovel_id;
    END IF;
    
    v_nova_nota_manutencao := public.calcular_nota_manutencao(v_imovel_id);
    
    UPDATE public.dados_caip
    SET nota_para_manutencao = v_nova_nota_manutencao::text
    WHERE id = v_imovel_id;
    
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
$function$;