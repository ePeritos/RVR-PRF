import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;
type CadernoAmbientes = Tables<'caderno_ambientes'>;
type ManutencaoAmbientes = Tables<'manutencao_ambientes'>;

interface EnvironmentMaintenanceEvaluationProps {
  imovelData: DadosCAIP;
  onNotaManutencaoChange?: (nota: number) => void;
}

interface AmbienteExistente {
  ambiente: {
    id: string;
    nome_ambiente: string;
    peso: number;
  };
  avaliacao?: ManutencaoAmbientes;
}

export const EnvironmentMaintenanceEvaluation = ({ 
  imovelData, 
  onNotaManutencaoChange 
}: EnvironmentMaintenanceEvaluationProps) => {
  const [ambientesExistentes, setAmbientesExistentes] = useState<AmbienteExistente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mapear campos do formulário para identificar ambientes existentes
  const camposAmbientes = [
    { campo: 'almoxarifado', nomeAmbiente: 'Almoxarifado' },
    { campo: 'alojamento_feminino', nomeAmbiente: 'Alojamento' },
    { campo: 'alojamento_masculino', nomeAmbiente: 'Alojamento' },
    { campo: 'alojamento_misto', nomeAmbiente: 'Alojamento' },
    { campo: 'area_de_servico', nomeAmbiente: 'Área de serviço' },
    { campo: 'area_de_uso_compartilhado_com_outros_orgaos', nomeAmbiente: 'Área de uso compartilhado' },
    { campo: 'arquivo', nomeAmbiente: 'Arquivo' },
    { campo: 'auditorio', nomeAmbiente: 'Auditório' },
    { campo: 'banheiro_para_zeladoria', nomeAmbiente: 'Banheiro para zeladoria' },
    { campo: 'banheiro_feminino_para_servidoras', nomeAmbiente: 'Banheiro para servidores' },
    { campo: 'banheiro_masculino_para_servidores', nomeAmbiente: 'Banheiro para servidores' },
    { campo: 'banheiro_misto_para_servidores', nomeAmbiente: 'Banheiro para servidores' },
    { campo: 'box_com_chuveiro_externo', nomeAmbiente: 'Box com chuveiro externo' },
    { campo: 'box_para_lavagem_de_veiculos', nomeAmbiente: 'Box para lavagem de veículos' },
    { campo: 'casa_de_maquinas', nomeAmbiente: 'Casa de máquinas' },
    { campo: 'central_de_gas', nomeAmbiente: 'Central de gás' },
    { campo: 'cobertura_para_aglomeracao_de_usuarios', nomeAmbiente: 'Cobertura para aglomeração de usuários' },
    { campo: 'cobertura_para_fiscalizacao_de_veiculos', nomeAmbiente: 'Cobertura para fiscalização de veículos' },
    { campo: 'copa_e_cozinha', nomeAmbiente: 'Copa e cozinha' },
    { campo: 'deposito_de_lixo', nomeAmbiente: 'Depósito de lixo' },
    { campo: 'deposito_de_materiais_de_descarte_e_baixa', nomeAmbiente: 'Depósito de materiais de descarte e baixa' },
    { campo: 'deposito_de_material_de_limpeza', nomeAmbiente: 'Depósito de material de limpeza' },
    { campo: 'deposito_de_material_operacional', nomeAmbiente: 'Depósito de material operacional' },
    { campo: 'estacionamento_para_usuarios', nomeAmbiente: 'Estacionamento para usuários' },
    { campo: 'garagem_para_servidores', nomeAmbiente: 'Garagem para servidores' },
    { campo: 'garagem_para_viaturas', nomeAmbiente: 'Garagem para viaturas' },
    { campo: 'lavabo_para_servidores_sem_box_para_chuveiro', nomeAmbiente: 'Lavabo para servidores sem box para chuveiro' },
    { campo: 'local_para_custodia_temporaria_de_detidos', nomeAmbiente: 'Local para custódia temporária de detidos' },
    { campo: 'local_para_guarda_provisoria_de_animais', nomeAmbiente: 'Local para guarda provisória de animais' },
    { campo: 'patio_de_retencao_de_veiculos', nomeAmbiente: 'Pátio de retenção de veículos' },
    { campo: 'plataforma_para_fiscalizacao_da_parte_superior_dos_veiculos', nomeAmbiente: 'Plataforma para fiscalização da parte superior dos veículos' },
    { campo: 'ponto_de_pouso_para_aeronaves', nomeAmbiente: 'Ponto de pouso para aeronaves' },
    { campo: 'rampa_de_fiscalizacao_de_veiculos', nomeAmbiente: 'Rampa de fiscalização de veículos' },
    { campo: 'recepcao', nomeAmbiente: 'Recepção' },
    { campo: 'sala_administrativa_escritorio', nomeAmbiente: 'Sala administrativa/escritório' },
    { campo: 'sala_de_assepsia', nomeAmbiente: 'Sala de assepsia' },
    { campo: 'sala_de_aula', nomeAmbiente: 'Sala de aula' },
    { campo: 'sala_de_reuniao', nomeAmbiente: 'Sala de reunião' },
    { campo: 'sala_de_revista_pessoal', nomeAmbiente: 'Sala de revista pessoal' },
    { campo: 'sala_operacional_observatorio', nomeAmbiente: 'Sala operacional/observatório' },
    { campo: 'sala_tecnica', nomeAmbiente: 'Sala técnica' },
    { campo: 'sanitario_publico', nomeAmbiente: 'Sanitário público' },
    { campo: 'telefone_publico', nomeAmbiente: 'Telefone público' },
    { campo: 'torre_de_telecomunicacoes', nomeAmbiente: 'Torre de telecomunicações' },
    { campo: 'vestiario_para_nao_policiais', nomeAmbiente: 'Vestiário para não policiais' },
    { campo: 'vestiario_para_policiais', nomeAmbiente: 'Vestiário para policiais' }
  ];

  useEffect(() => {
    carregarAmbientesExistentes();
  }, [imovelData]);

  const carregarAmbientesExistentes = async () => {
    if (!imovelData.tipo_de_unidade || !imovelData.id) {
      setLoading(false);
      return;
    }

    try {
      // Buscar ambientes do caderno baseado no tipo de unidade
      const { data: cadernoAmbientes, error: errorCaderno } = await supabase
        .from('caderno_ambientes')
        .select(`
          id,
          nome_ambiente,
          peso,
          tipos_imoveis!inner(nome_tipo)
        `)
        .eq('tipos_imoveis.nome_tipo', imovelData.tipo_de_unidade);

      if (errorCaderno) throw errorCaderno;

      // Buscar avaliações existentes
      const { data: avaliacoes, error: errorAvaliacoes } = await supabase
        .from('manutencao_ambientes')
        .select('*')
        .eq('imovel_id', imovelData.id);

      if (errorAvaliacoes) throw errorAvaliacoes;

      // Filtrar apenas ambientes que existem no imóvel
      const ambientesExistentesData: AmbienteExistente[] = [];

      cadernoAmbientes?.forEach((ambienteData: any) => {
        const campoCorrespondente = camposAmbientes.find(
          c => c.nomeAmbiente === ambienteData.nome_ambiente
        );

        if (campoCorrespondente) {
          const valorCampo = imovelData[campoCorrespondente.campo as keyof DadosCAIP];
          
          if (valorCampo === 'Existente' || valorCampo === 'Sim') {
            const avaliacao = avaliacoes?.find(a => a.ambiente_id === ambienteData.id);
            ambientesExistentesData.push({
              ambiente: {
                id: ambienteData.id,
                nome_ambiente: ambienteData.nome_ambiente,
                peso: ambienteData.peso
              },
              avaliacao
            });
          }
        }
      });

      setAmbientesExistentes(ambientesExistentesData);
    } catch (error) {
      console.error('Erro ao carregar ambientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar ambientes para avaliação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarAvaliacao = async (ambienteId: string, scoreConservacao: number, observacoes?: string) => {
    if (!imovelData.id) return;

    try {
      const { error } = await supabase
        .from('manutencao_ambientes')
        .upsert({
          imovel_id: imovelData.id,
          ambiente_id: ambienteId,
          score_conservacao: scoreConservacao,
          observacoes: observacoes || null
        });

      if (error) throw error;

      // Recarregar dados para atualizar as notas calculadas
      await carregarAmbientesExistentes();
      
      // Buscar a nova nota de manutenção calculada
      const { data: imovelAtualizado } = await supabase
        .from('dados_caip')
        .select('nota_para_manutencao')
        .eq('id', imovelData.id)
        .single();

      if (imovelAtualizado?.nota_para_manutencao && onNotaManutencaoChange) {
        onNotaManutencaoChange(Number(imovelAtualizado.nota_para_manutencao));
      }

      toast({
        title: "Sucesso",
        description: "Avaliação salva com sucesso. Nota de manutenção atualizada.",
      });
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar avaliação.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Avaliação de Manutenção dos Ambientes</h3>
        <p className="text-muted-foreground">Carregando ambientes...</p>
      </Card>
    );
  }

  if (ambientesExistentes.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Avaliação de Manutenção dos Ambientes</h3>
        <p className="text-muted-foreground">
          Nenhum ambiente marcado como "Existente" foi encontrado para este imóvel. 
          Marque os ambientes existentes na seção "Ambientes" para poder avaliá-los.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Avaliação de Manutenção dos Ambientes</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Avalie o estado de conservação de cada ambiente existente no imóvel. 
        A nota de manutenção será calculada automaticamente com base nestas avaliações.
      </p>

      <div className="space-y-4">
        {ambientesExistentes.map(({ ambiente, avaliacao }) => (
          <div key={ambiente.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{ambiente.nome_ambiente}</h4>
                <p className="text-sm text-muted-foreground">Peso: {ambiente.peso}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Estado de Conservação (1 = Péssimo, 5 = Ótimo)</Label>
                <Select
                  value={avaliacao?.score_conservacao?.toString() || ''}
                  onValueChange={(value) => salvarAvaliacao(ambiente.id, parseInt(value), avaliacao?.observacoes)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Péssimo</SelectItem>
                    <SelectItem value="2">2 - Ruim</SelectItem>
                    <SelectItem value="3">3 - Regular</SelectItem>
                    <SelectItem value="4">4 - Bom</SelectItem>
                    <SelectItem value="5">5 - Ótimo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Observações (opcional)</Label>
                <Textarea
                  value={avaliacao?.observacoes || ''}
                  onChange={(e) => {
                    if (avaliacao?.score_conservacao) {
                      salvarAvaliacao(ambiente.id, avaliacao.score_conservacao, e.target.value);
                    }
                  }}
                  placeholder="Observações sobre este ambiente..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};