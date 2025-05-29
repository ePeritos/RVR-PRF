
import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface FilterData {
  anoCAIP: string;
  tipoUnidade: string;
  unidadeGestora: string;
}

interface DataFilterProps {
  onFilterChange: (filters: FilterData) => void;
}

export function DataFilter({ onFilterChange }: DataFilterProps) {
  const [filters, setFilters] = useState<FilterData>({
    anoCAIP: '',
    tipoUnidade: '',
    unidadeGestora: ''
  });

  const [anosDisponiveis, setAnosDisponiveis] = useState<string[]>([]);
  const [tiposUnidade, setTiposUnidade] = useState<string[]>([]);
  const [unidadesGestoras, setUnidadesGestoras] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniqueValues = async () => {
      try {
        setLoading(true);
        
        // Buscar todos os dados para extrair valores únicos
        const { data, error } = await supabase
          .from('dados_caip')
          .select('ano_caip, tipo_de_unidade, unidade_gestora');

        if (error) {
          console.error('Erro ao buscar dados únicos:', error);
          return;
        }

        if (data) {
          // Extrair valores únicos e filtrar valores válidos
          const anosUnicos = [...new Set(data.map(item => item.ano_caip).filter(Boolean))].sort();
          const tiposUnicos = [...new Set(data.map(item => item.tipo_de_unidade).filter(Boolean))].sort();
          const unidadesUnicas = [...new Set(data.map(item => item.unidade_gestora).filter(Boolean))].sort();
          
          setAnosDisponiveis(anosUnicos);
          setTiposUnidade(tiposUnicos);
          setUnidadesGestoras(unidadesUnicas);
        }
      } catch (err) {
        console.error('Erro ao carregar valores únicos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUniqueValues();
  }, []);

  const handleFilterChange = (key: keyof FilterData, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { anoCAIP: '', tipoUnidade: '', unidadeGestora: '' };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <Select value={filters.unidadeGestora} onValueChange={(value) => handleFilterChange('unidadeGestora', value)}>
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
          <Select value={filters.tipoUnidade} onValueChange={(value) => handleFilterChange('tipoUnidade', value)}>
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
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={clearFilters} className="hover-scale">
          Limpar Filtros
        </Button>
      </div>
    </Card>
  );
}
