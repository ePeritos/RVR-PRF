
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UNIDADES_GESTORAS, TIPOS_UNIDADE } from '@/constants/caipConstants';

interface FilterOptions {
  anoCAIP: string[];
  unidadeGestora: string[];
  tipoUnidade: string[];
  nomeUnidade: string;
}

interface DataFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export const DataFilter = ({ onFilterChange }: DataFilterProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    anoCAIP: [],
    unidadeGestora: [],
    tipoUnidade: [],
    nomeUnidade: ''
  });

  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  const fetchAvailableYears = async () => {
    try {
      const { data, error } = await supabase
        .from('dados_caip')
        .select('ano_caip')
        .not('ano_caip', 'is', null)
        .order('ano_caip', { ascending: false });

      if (error) throw error;

      // Extrair anos únicos da base de dados
      const yearsFromDB = [...new Set(data?.map(item => item.ano_caip).filter(Boolean) || [])];
      
      // Garantir que 2025 esteja sempre incluído
      const allYears = [...new Set([...yearsFromDB, '2025'])];
      
      // Ordenar em ordem decrescente
      const sortedYears = allYears.sort((a, b) => parseInt(b) - parseInt(a));
      
      setAvailableYears(sortedYears);
    } catch (error) {
      console.error('Erro ao buscar anos disponíveis:', error);
      // Fallback: anos 2021-2025
      setAvailableYears(['2025', '2024', '2023', '2022', '2021']);
    }
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      anoCAIP: [],
      unidadeGestora: [],
      tipoUnidade: [],
      nomeUnidade: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = filters.anoCAIP.length > 0 || 
                          filters.unidadeGestora.length > 0 || 
                          filters.tipoUnidade.length > 0 || 
                          filters.nomeUnidade.length > 0;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4" />
        <h3 className="font-semibold">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Ano CAIP</Label>
          <MultiSelect
            options={availableYears}
            selected={filters.anoCAIP}
            onChange={(values) => updateFilter('anoCAIP', values)}
            placeholder="Selecione os anos"
          />
        </div>

        <div className="space-y-2">
          <Label>Unidade Gestora</Label>
          <MultiSelect
            options={UNIDADES_GESTORAS}
            selected={filters.unidadeGestora}
            onChange={(values) => updateFilter('unidadeGestora', values)}
            placeholder="Selecione as unidades"
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Unidade</Label>
          <MultiSelect
            options={TIPOS_UNIDADE}
            selected={filters.tipoUnidade}
            onChange={(values) => updateFilter('tipoUnidade', values)}
            placeholder="Selecione os tipos"
          />
        </div>

        <div className="space-y-2">
          <Label>Nome da Unidade</Label>
          <Input
            placeholder="Digite para buscar..."
            value={filters.nomeUnidade}
            onChange={(e) => updateFilter('nomeUnidade', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};
