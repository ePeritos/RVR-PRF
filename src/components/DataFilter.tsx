
import { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface FilterData {
  anoCAIP: string;
  unidadeGestora: string;
  tipoUnidade: string;
  nomeUnidade: string;
}

interface DataFilterProps {
  onFilterChange: (filters: FilterData) => void;
}

export function DataFilter({ onFilterChange }: DataFilterProps) {
  const [filters, setFilters] = useState<FilterData>({
    anoCAIP: '',
    unidadeGestora: '',
    tipoUnidade: '',
    nomeUnidade: ''
  });

  const [anosDisponiveis, setAnosDisponiveis] = useState<string[]>([]);
  const [tiposUnidade, setTiposUnidade] = useState<string[]>([]);
  const [unidadesGestoras, setUnidadesGestoras] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar todos os valores únicos independentemente
  const fetchAllFilterValues = async () => {
    try {
      setLoading(true);

      // Buscar todos os anos disponíveis com logs detalhados
      console.log('🔍 Buscando anos disponíveis...');
      const { data: anosData, error: anosError } = await supabase
        .from('dados_caip')
        .select('ano_caip');
      
      console.log('📊 Total de registros retornados:', anosData?.length);
      console.log('❌ Erro ao buscar anos:', anosError);
      
      if (anosData) {
        // Log dos primeiros registros para debug
        console.log('📝 Primeiros 10 registros:', anosData.slice(0, 10));
        
        // Criar um objeto para contar ocorrências de cada ano
        const contadorAnos: { [key: string]: number } = {};
        anosData.forEach(item => {
          const ano = item.ano_caip;
          if (ano && ano.trim() !== '') {
            contadorAnos[ano] = (contadorAnos[ano] || 0) + 1;
          }
        });
        
        console.log('📈 Contador de anos encontrados:', contadorAnos);
        
        // Filtrar valores nulos/vazios e remover duplicatas
        const todosAnos = anosData
          .map(item => item.ano_caip)
          .filter(ano => ano && ano.trim() !== '');
        
        console.log('✅ Total de anos válidos após filtrar nulos:', todosAnos.length);
        
        const anosUnicos = [...new Set(todosAnos)].sort();
        console.log('🎯 Anos únicos ordenados final:', anosUnicos);
        
        // Verificar especificamente se 2025 existe
        const tem2025 = anosData.some(item => item.ano_caip === '2025');
        console.log('🔎 Existe ano 2025 na base?', tem2025);
        
        setAnosDisponiveis(anosUnicos);
      }

      // Buscar todas as unidades gestoras disponíveis
      const { data: unidadesData } = await supabase
        .from('dados_caip')
        .select('unidade_gestora')
        .not('unidade_gestora', 'is', null);
      
      if (unidadesData) {
        const unidadesUnicas = [...new Set(unidadesData.map(item => item.unidade_gestora).filter(Boolean))].sort();
        setUnidadesGestoras(unidadesUnicas);
      }

      // Buscar todos os tipos de unidade disponíveis
      const { data: tiposData } = await supabase
        .from('dados_caip')
        .select('tipo_de_unidade')
        .not('tipo_de_unidade', 'is', null);
      
      if (tiposData) {
        const tiposUnicos = [...new Set(tiposData.map(item => item.tipo_de_unidade).filter(Boolean))].sort();
        setTiposUnidade(tiposUnicos);
      }

    } catch (err) {
      console.error('💥 Erro ao carregar valores únicos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar valores únicos na inicialização
  useEffect(() => {
    fetchAllFilterValues();
  }, []);

  // Atualizar filtros quando qualquer valor mudar
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterData, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    const emptyFilters = { anoCAIP: '', unidadeGestora: '', tipoUnidade: '', nomeUnidade: '' };
    setFilters(emptyFilters);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filtros de Dados</h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando filtros...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Filtros de Dados</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Ano CAIP</Label>
          <Select value={filters.anoCAIP} onValueChange={(value) => handleFilterChange('anoCAIP', value)}>
            <SelectTrigger className="bg-background border-border focus:border-primary">
              <SelectValue placeholder="Selecionar ano" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {anosDisponiveis.map((ano) => (
                <SelectItem key={ano} value={ano}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Unidade Gestora</Label>
          <Select 
            value={filters.unidadeGestora} 
            onValueChange={(value) => handleFilterChange('unidadeGestora', value)}
          >
            <SelectTrigger className="bg-background border-border focus:border-primary">
              <SelectValue placeholder="Selecionar unidade gestora" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {unidadesGestoras.map((unidade) => (
                <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Tipo de Unidade</Label>
          <Select 
            value={filters.tipoUnidade} 
            onValueChange={(value) => handleFilterChange('tipoUnidade', value)}
          >
            <SelectTrigger className="bg-background border-border focus:border-primary">
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {tiposUnidade.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Nome da Unidade</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome da unidade..."
              value={filters.nomeUnidade}
              onChange={(e) => handleFilterChange('nomeUnidade', e.target.value)}
              className="pl-10 bg-background border-border focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={clearFilters} className="hover-scale">
          Limpar Filtros
        </Button>
      </div>
    </Card>
  );
}
