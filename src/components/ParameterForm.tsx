
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRow } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useValoresCUB } from '@/hooks/useValoresCUB';

interface ResponsavelTecnico {
  id: string;
  nome_completo: string;
  numero_registro: string;
  conselho: string;
  formacao: string;
  uf: string;
}


interface ParameterFormProps {
  onSubmit: (parameters: any) => void;
  selectedData: DataRow[];
}

export const ParameterForm = ({ onSubmit, selectedData }: ParameterFormProps) => {
  const [responsaveisTecnicos, setResponsaveisTecnicos] = useState<ResponsavelTecnico[]>([]);
  const [loadingResponsaveis, setLoadingResponsaveis] = useState(true);
  const { toast } = useToast();
  const { valoresCUB, getValorCUB, getUfsDisponiveis } = useValoresCUB();
  
  const [parameters, setParameters] = useState({
    valorM2: 150,
    cubM2: 2100,
    bdi: 25,
    dataReferencia: new Date().toISOString().split('T')[0],
    fonteValorTerreno: 'Planta Genérica de Valores do Município',
    justificativaValores: 'Valores baseados em pesquisa de mercado local e dados oficiais do município.',
    responsavelTecnicoId: '',
    padraoConstrutivo: 'R8-N',
    uf: 'AP'
  });

  useEffect(() => {
    fetchResponsaveisTecnicos();
  }, []);

  // Atualizar CUB automaticamente quando padrão ou UF mudar
  useEffect(() => {
    if (parameters.padraoConstrutivo && parameters.uf) {
      const valorCUB = getValorCUB(parameters.uf, parameters.padraoConstrutivo);
      if (valorCUB) {
        setParameters(prev => ({
          ...prev,
          cubM2: valorCUB.valor_m2
        }));
      }
    }
  }, [parameters.padraoConstrutivo, parameters.uf, getValorCUB]);

  const fetchResponsaveisTecnicos = async () => {
    try {
      setLoadingResponsaveis(true);
      const { data, error } = await supabase
        .from('responsaveis_tecnicos')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo');

      if (error) {
        console.error('Erro ao buscar responsáveis técnicos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar responsáveis técnicos.",
          variant: "destructive",
        });
        return;
      }

      console.log('Responsáveis técnicos carregados:', data);
      setResponsaveisTecnicos(data || []);
      
      // Automatically select "Thaise Bernardo Bessa" if found
      const thaise = data?.find(resp => resp.nome_completo.toLowerCase().includes('thaise'));
      if (thaise) {
        console.log('Thaise encontrada, selecionando automaticamente:', thaise);
        setParameters(prev => ({
          ...prev,
          responsavelTecnicoId: thaise.id
        }));
      } else {
        console.log('Thaise não encontrada. Responsáveis disponíveis:', data?.map(r => r.nome_completo));
      }
    } catch (error) {
      console.error('Erro ao buscar responsáveis técnicos:', error);
    } finally {
      setLoadingResponsaveis(false);
    }
  };


  // Definir opções de padrões construtivos organizadas por categoria
  const padroesConstrutivos = {
    'Residencial Baixo': [
      { value: 'R1-B', label: 'R1-B - Residencial Unifamiliar Baixo' },
      { value: 'PP-4-B', label: 'PP-4-B - Prédio Popular 4 Pavimentos Baixo' },
      { value: 'R8-B', label: 'R8-B - Residencial 8 Pavimentos Baixo' },
      { value: 'PIS', label: 'PIS - Projeto de Interesse Social' }
    ],
    'Residencial Normal': [
      { value: 'R1-N', label: 'R1-N - Residencial Unifamiliar Normal' },
      { value: 'PP-4-N', label: 'PP-4-N - Prédio Popular 4 Pavimentos Normal' },
      { value: 'R8-N', label: 'R8-N - Residencial 8 Pavimentos Normal' },
      { value: 'R16-N', label: 'R16-N - Residencial 16 Pavimentos Normal' }
    ],
    'Residencial Alto': [
      { value: 'R1-A', label: 'R1-A - Residencial Unifamiliar Alto' },
      { value: 'R8-A', label: 'R8-A - Residencial 8 Pavimentos Alto' },
      { value: 'R16-A', label: 'R16-A - Residencial 16 Pavimentos Alto' }
    ],
    'Comercial Normal': [
      { value: 'CAL-8-N', label: 'CAL-8-N - Comercial Andares Livres 8 Pavimentos Normal' },
      { value: 'CSL-8-N', label: 'CSL-8-N - Comercial Salas Livres 8 Pavimentos Normal' },
      { value: 'CSL-16-N', label: 'CSL-16-N - Comercial Salas Livres 16 Pavimentos Normal' }
    ],
    'Comercial Alto': [
      { value: 'CAL-8-A', label: 'CAL-8-A - Comercial Andares Livres 8 Pavimentos Alto' },
      { value: 'CSL-8-A', label: 'CSL-8-A - Comercial Salas Livres 8 Pavimentos Alto' },
      { value: 'CSL-16-A', label: 'CSL-16-A - Comercial Salas Livres 16 Pavimentos Alto' }
    ],
    'Outros': [
      { value: 'RP1Q', label: 'RP1Q - Residência Popular 1 Quarto' },
      { value: 'GI', label: 'GI - Galpão Industrial' }
    ]
  };

  // UFs disponíveis serão obtidas dinamicamente do banco de dados
  const ufsDisponiveis = getUfsDisponiveis();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parameters.responsavelTecnicoId) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione um responsável técnico.",
        variant: "destructive",
      });
      return;
    }

    const responsavelSelecionado = responsaveisTecnicos.find(
      resp => resp.id === parameters.responsavelTecnicoId
    );

    const parametersWithResponsavel = {
      ...parameters,
      responsavelTecnico: responsavelSelecionado
    };

    console.log('Parâmetros finais sendo enviados do ParameterForm:', parametersWithResponsavel);
    onSubmit(parametersWithResponsavel);
  };

  const totalArea = selectedData.reduce((sum, item) => sum + (item.area_construida_m2 || 0), 0);
  const totalBenfeitoria = selectedData.reduce((sum, item) => {
    const area = item.area_construida_m2 || 0;
    return sum + (parameters.cubM2 * area);
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Imóveis Selecionados</CardTitle>
          <CardDescription>
            {selectedData.length} imóveis • Área total: {totalArea.toFixed(2)} m² • Benfeitoria estimada: R$ {totalBenfeitoria.toLocaleString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {selectedData.map((item) => (
              <div key={item.id} className="p-3 border rounded-md bg-muted/30">
                <h4 className="font-medium text-sm truncate">{item.nome_da_unidade || 'Nome não informado'}</h4>
                <p className="text-xs text-muted-foreground">{item.tipo_de_unidade}</p>
                <p className="text-xs font-medium">Área Construída: {item.area_construida_m2 || 0} m²</p>
                <p className="text-xs font-medium">Área Terreno: {item.area_do_terreno_m2 || 0} m²</p>
                <p className="text-xs text-muted-foreground">Idade Aparente: {item.idade_aparente_do_imovel || 'Não informado'} anos</p>
                <p className="text-xs text-muted-foreground">Estado de Conservação: {item.estado_de_conservacao || 'Não informado'}</p>
                <p className="text-xs text-muted-foreground">Vida Útil: {item.vida_util_estimada_anos || 'Não informado'} anos</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parâmetros para Cálculo do RVR</CardTitle>
          <CardDescription>
            Configure os parâmetros técnicos para avaliação dos imóveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="responsavelTecnico" className="text-sm font-medium">
                Responsável Técnico *
              </Label>
              <Select
                value={parameters.responsavelTecnicoId}
                onValueChange={(value) => {
                  console.log('Responsável técnico selecionado manualmente:', value);
                  setParameters({...parameters, responsavelTecnicoId: value});
                }}
                disabled={loadingResponsaveis}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={loadingResponsaveis ? "Carregando..." : "Selecione o responsável técnico"} />
                </SelectTrigger>
                <SelectContent>
                  {responsaveisTecnicos.map((responsavel) => (
                    <SelectItem key={responsavel.id} value={responsavel.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{responsavel.nome_completo}</span>
                        <span className="text-xs text-muted-foreground">
                          {responsavel.conselho} - {responsavel.numero_registro} ({responsavel.uf})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {responsaveisTecnicos.length === 0 && !loadingResponsaveis && (
                <p className="text-xs text-orange-600">
                  Nenhum responsável técnico cadastrado. Cadastre um responsável técnico primeiro.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="uf" className="text-sm font-medium">
                Estado (UF) *
              </Label>
              <Select
                value={parameters.uf}
                onValueChange={(value) => setParameters({...parameters, uf: value})}
              >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={ufsDisponiveis.length > 0 ? "Selecione o estado" : "Carregando estados..."} />
              </SelectTrigger>
                <SelectContent>
                  {ufsDisponiveis.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="padraoConstrutivo" className="text-sm font-medium">
                Padrão Construtivo (CUB) *
              </Label>
              <Select
                value={parameters.padraoConstrutivo}
                onValueChange={(value) => setParameters({...parameters, padraoConstrutivo: value})}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o padrão construtivo" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {Object.entries(padroesConstrutivos).map(([categoria, padroes]) => (
                    <div key={categoria}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                        {categoria}
                      </div>
                      {padroes.map((padrao) => (
                        <SelectItem key={padrao.value} value={padrao.value}>
                          {padrao.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Baseado nos padrões CUB/SINDUSCON. O valor CUB/m² será preenchido automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorM2" className="text-sm font-medium">Valor por m² do Terreno (R$)</Label>
                <Input
                  id="valorM2"
                  type="number"
                  value={parameters.valorM2}
                  onChange={(e) => setParameters({...parameters, valorM2: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                  required
                  className="h-9"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cubM2" className="text-sm font-medium">CUB/m² (R$)</Label>
                <Input
                  id="cubM2"
                  type="number"
                  value={parameters.cubM2}
                  onChange={(e) => setParameters({...parameters, cubM2: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                  required
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">
                  Preenchido automaticamente baseado no padrão construtivo e UF selecionados
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bdi" className="text-sm font-medium">BDI (%)</Label>
                <Input
                  id="bdi"
                  type="number"
                  value={parameters.bdi}
                  onChange={(e) => setParameters({...parameters, bdi: Number(e.target.value)})}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  className="h-9"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataReferencia" className="text-sm font-medium">Data de Referência</Label>
                <Input
                  id="dataReferencia"
                  type="date"
                  value={parameters.dataReferencia}
                  onChange={(e) => setParameters({...parameters, dataReferencia: e.target.value})}
                  required
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fonteValorTerreno" className="text-sm font-medium">Fonte do Valor Unitário do Terreno</Label>
              <Input
                id="fonteValorTerreno"
                type="text"
                value={parameters.fonteValorTerreno}
                onChange={(e) => setParameters({...parameters, fonteValorTerreno: e.target.value})}
                required
                className="h-9"
                placeholder="Ex: Planta Genérica de Valores do Município"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-11 text-base font-medium">
                Calcular RVR e Gerar Relatório
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
