-- Desabilitar o trigger que calcula automaticamente a nota de adequação
-- para evitar conflito com o cálculo em tempo real no frontend
DROP TRIGGER IF EXISTS calcular_nota_adequacao_trigger ON public.dados_caip;