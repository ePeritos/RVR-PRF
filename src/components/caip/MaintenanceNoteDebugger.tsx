import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceNoteDebuggerProps {
  imovelId?: string;
}

export const MaintenanceNoteDebugger = ({ imovelId }: MaintenanceNoteDebuggerProps) => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [testId, setTestId] = useState(imovelId || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testMaintenanceCalculation = async () => {
    if (!testId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDebugInfo('Iniciando teste de cálculo de manutenção...\n\n');

    try {
      // 1. Verificar se o imóvel existe
      const { data: imovel, error: imovelError } = await supabase
        .from('dados_caip')
        .select('id, nome_da_unidade, tipo_de_unidade, nota_para_adequacao, nota_para_manutencao, nota_global')
        .eq('id', testId)
        .single();

      if (imovelError) {
        setDebugInfo(prev => prev + `❌ Erro ao buscar imóvel: ${imovelError.message}\n\n`);
        return;
      }

      setDebugInfo(prev => prev + `✅ Imóvel encontrado:\n${JSON.stringify(imovel, null, 2)}\n\n`);

      // 2. Verificar avaliações existentes
      const { data: avaliacoes, error: avaliacoesError } = await supabase
        .from('manutencao_ambientes')
        .select(`
          score_conservacao,
          caderno_ambientes!inner(
            nome_ambiente,
            peso,
            tipos_imoveis!inner(nome_tipo)
          )
        `)
        .eq('imovel_id', testId);

      if (avaliacoesError) {
        setDebugInfo(prev => prev + `❌ Erro ao buscar avaliações: ${avaliacoesError.message}\n\n`);
        return;
      }

      setDebugInfo(prev => prev + `📊 Avaliações encontradas (${avaliacoes?.length || 0}):\n${JSON.stringify(avaliacoes, null, 2)}\n\n`);

      // 3. Testar função de cálculo
      const { data: notaCalculada, error: calculoError } = await supabase
        .rpc('calcular_nota_manutencao', { p_imovel_id: testId });

      if (calculoError) {
        setDebugInfo(prev => prev + `❌ Erro no cálculo: ${calculoError.message}\n\n`);
        return;
      }

      setDebugInfo(prev => prev + `🔢 Nota calculada pela função: ${notaCalculada}\n\n`);

      // 4. Verificar triggers
      setDebugInfo(prev => prev + `⚙️ Testando triggers...\n`);
      
      // Forçar um update para testar o trigger
      const { error: updateError } = await supabase
        .from('dados_caip')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testId);

      if (updateError) {
        setDebugInfo(prev => prev + `❌ Erro ao testar trigger: ${updateError.message}\n\n`);
        return;
      }

      // 5. Verificar dados após trigger
      await new Promise(resolve => setTimeout(resolve, 500)); // Aguardar trigger

      const { data: dadosAtualizados, error: dadosError } = await supabase
        .from('dados_caip')
        .select('nota_para_adequacao, nota_para_manutencao, nota_global')
        .eq('id', testId)
        .single();

      if (dadosError) {
        setDebugInfo(prev => prev + `❌ Erro ao buscar dados atualizados: ${dadosError.message}\n\n`);
        return;
      }

      setDebugInfo(prev => prev + `✅ Dados após trigger:\n${JSON.stringify(dadosAtualizados, null, 2)}\n\n`);

      // 6. Conclusões
      setDebugInfo(prev => prev + `🎯 DIAGNÓSTICO:\n`);
      
      if (avaliacoes && avaliacoes.length > 0) {
        setDebugInfo(prev => prev + `✅ Existem ${avaliacoes.length} avaliações de ambientes\n`);
      } else {
        setDebugInfo(prev => prev + `⚠️ Nenhuma avaliação de ambiente encontrada\n`);
      }

      if (notaCalculada !== null && notaCalculada > 0) {
        setDebugInfo(prev => prev + `✅ Função de cálculo retorna: ${notaCalculada}\n`);
      } else {
        setDebugInfo(prev => prev + `⚠️ Função de cálculo retorna 0 ou null\n`);
      }

      if (dadosAtualizados.nota_para_manutencao) {
        setDebugInfo(prev => prev + `✅ Nota no banco: ${dadosAtualizados.nota_para_manutencao}\n`);
      } else {
        setDebugInfo(prev => prev + `❌ Nota no banco está nula ou zero\n`);
      }

      toast({
        title: "Teste concluído",
        description: "Verifique o relatório de debug para detalhes.",
      });

    } catch (error) {
      setDebugInfo(prev => prev + `💥 Erro geral: ${error}\n\n`);
      toast({
        title: "Erro no teste",
        description: "Erro durante o teste de manutenção.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo('');
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🔧 Debugger - Nota de Manutenção</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="test-id">ID do Imóvel para Teste:</Label>
          <Input
            id="test-id"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            placeholder="Digite o ID do imóvel"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testMaintenanceCalculation}
            disabled={isLoading || !testId}
          >
            {isLoading ? "Testando..." : "Testar Cálculo"}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearDebugInfo}
          >
            Limpar
          </Button>
        </div>

        {debugInfo && (
          <div>
            <Label>Relatório de Debug:</Label>
            <Textarea
              value={debugInfo}
              readOnly
              className="h-96 font-mono text-xs"
            />
          </div>
        )}
      </div>
    </Card>
  );
};