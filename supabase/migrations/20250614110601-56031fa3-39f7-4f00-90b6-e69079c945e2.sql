-- Criar trigger para atualizar automaticamente a nota de manutenção
DROP TRIGGER IF EXISTS trigger_atualizar_nota_manutencao ON public.manutencao_ambientes;

CREATE TRIGGER trigger_atualizar_nota_manutencao
    AFTER INSERT OR UPDATE OR DELETE ON public.manutencao_ambientes
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_atualizar_nota_manutencao();

-- Verificar se a função existe e funciona corretamente
-- Testar a função manualmente
SELECT public.calcular_nota_manutencao('00000000-0000-0000-0000-000000000000'::uuid) as teste_funcao;