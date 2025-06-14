
import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { FilterSkeleton } from '@/components/ui/loading-skeleton';
import { useDebounce, queryCache } from '@/utils/performanceUtils';

interface FilterData {
  anoCAIP: string[];
  unidadeGestora: string[];
  tipoUnidade: string[];
  nomeUnidade: string;
}

interface DataFilterProps {
  onFilterChange: (filters: FilterData) => void;
}

export const DataFilter = React.memo(({ onFilterChange }: DataFilterProps) => {
  const { profile, isAdmin, loading: profileLoading } = useUserProfile();
  
  const [filters, setFilters] = useState<FilterData>({
    anoCAIP: [],
    unidadeGestora: [],
    tipoUnidade: [],
    nomeUnidade: ''
  });

  const [anosDisponiveis, setAnosDisponiveis] = useState<string[]>([]);
  const [tiposUnidade, setTiposUnidade] = useState<string[]>([]);
  const [unidadesGestoras, setUnidadesGestoras] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounced filter change to avoid excessive calls
  const debouncedFilterChange = useDebounce(onFilterChange, 300);

  // Optimized fetch function using a single query with distinct values
  const fetchAllFilterValues = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = 'filter-values-v2';
      const cachedData = queryCache.get(cacheKey);
      
      if (cachedData) {
        console.log('🚀 Using cached filter values');
        const { anos, unidades, tipos } = cachedData as any;
        setAnosDisponiveis(anos);
        setUnidadesGestoras(unidades);
        setTiposUnidade(tipos);
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching filter values optimized...');
      
      // Single optimized query to get all unique values
      const { data, error } = await supabase
        .from('dados_caip')
        .select('ano_caip, unidade_gestora, tipo_de_unidade')
        .not('ano_caip', 'is', null)
        .not('unidade_gestora', 'is', null)
        .not('tipo_de_unidade', 'is', null)
        .limit(5000); // Reasonable limit

      if (error) {
        console.error('❌ Erro na consulta otimizada:', error);
        return;
      }

      if (data) {
        // Process unique values in memory (much faster than multiple DB queries)
        const anosSet = new Set<string>();
        const unidadesSet = new Set<string>();
        const tiposSet = new Set<string>();

        data.forEach(item => {
          if (item.ano_caip && item.ano_caip.trim()) {
            anosSet.add(item.ano_caip);
          }
          if (item.unidade_gestora && item.unidade_gestora.trim()) {
            unidadesSet.add(item.unidade_gestora);
          }
          if (item.tipo_de_unidade && item.tipo_de_unidade.trim()) {
            tiposSet.add(item.tipo_de_unidade);
          }
        });

        const anos = Array.from(anosSet).sort();
        const unidades = Array.from(unidadesSet).sort();
        const tipos = Array.from(tiposSet).sort();

        console.log('✅ Filter values processed:', { anos: anos.length, unidades: unidades.length, tipos: tipos.length });

        // Cache the results
        queryCache.set(cacheKey, { anos, unidades, tipos });

        setAnosDisponiveis(anos);
        setUnidadesGestoras(unidades);
        setTiposUnidade(tipos);
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

  // Aplicar pré-filtro baseado na unidade gestora do usuário (se não for admin)
  useEffect(() => {
    if (!profileLoading && profile && !isAdmin && profile.unidade_gestora) {
      setFilters(prev => ({
        ...prev,
        unidadeGestora: [profile.unidade_gestora]
      }));
    }
  }, [profile, isAdmin, profileLoading]);

  // Optimized filter change with debouncing
  const handleFilterChange = useDebounce((key: keyof FilterData, value: string[] | string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, 200);

  // Apply filter changes with debouncing
  useEffect(() => {
    debouncedFilterChange(filters);
  }, [filters, debouncedFilterChange]);

  const clearFilters = () => {
    const emptyFilters = { 
      anoCAIP: [], 
      unidadeGestora: isAdmin ? [] : (profile?.unidade_gestora ? [profile.unidade_gestora] : []), 
      tipoUnidade: [], 
      nomeUnidade: '' 
    };
    setFilters(emptyFilters);
  };

  if (loading) {
    return <FilterSkeleton />;
  }

  return (
    <Card className="p-6 bg-card border border-border w-full">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Filtros de Dados</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Ano CAIP</Label>
          <MultiSelect
            options={anosDisponiveis}
            selected={filters.anoCAIP}
            onChange={(selected) => handleFilterChange('anoCAIP', selected)}
            placeholder="Selecionar anos"
            className="bg-background border-border focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Unidade Gestora
            {!isAdmin && profile?.unidade_gestora && (
              <span className="text-xs text-muted-foreground ml-2">(Fixo para seu perfil)</span>
            )}
          </Label>
          <MultiSelect
            options={unidadesGestoras}
            selected={filters.unidadeGestora}
            onChange={(selected) => handleFilterChange('unidadeGestora', selected)}
            placeholder="Selecionar unidades gestoras"
            disabled={!isAdmin}
            className={`border-border focus:border-primary ${!isAdmin ? 'opacity-50' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Tipo de Unidade</Label>
          <MultiSelect
            options={tiposUnidade}
            selected={filters.tipoUnidade}
            onChange={(selected) => handleFilterChange('tipoUnidade', selected)}
            placeholder="Selecionar tipos"
            className="bg-background border-border focus:border-primary"
          />
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
});
