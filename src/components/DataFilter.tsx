import { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

interface FilterData {
  anoCAIP: string[];
  unidadeGestora: string[];
  tipoUnidade: string[];
  nomeUnidade: string;
}

interface DataFilterProps {
  onFilterChange: (filters: FilterData) => void;
}

export function DataFilter({ onFilterChange }: DataFilterProps) {
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

  // Função para buscar todos os valores únicos com paginação
  const fetchAllFilterValues = async () => {
    try {
      setLoading(true);

      // Buscar todos os anos disponíveis com paginação
      console.log('🔍 Buscando TODOS os anos disponíveis...');
      let allAnosData: any[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: batchData, error } = await supabase
          .from('dados_caip')
          .select('ano_caip')
          .range(from, from + batchSize - 1);

        if (error) {
          console.error('❌ Erro na consulta de anos:', error);
          break;
        }

        if (batchData) {
          allAnosData = [...allAnosData, ...batchData];
          console.log(`📊 Carregados ${batchData.length} registros de anos (total: ${allAnosData.length})`);
          
          if (batchData.length < batchSize) {
            hasMore = false;
          } else {
            from += batchSize;
          }
        } else {
          hasMore = false;
        }
      }

      console.log(`✅ Total final de registros de anos carregados: ${allAnosData.length}`);
      
      if (allAnosData.length > 0) {
        // Criar um objeto para contar ocorrências de cada ano
        const contadorAnos: { [key: string]: number } = {};
        allAnosData.forEach(item => {
          const ano = item.ano_caip;
          if (ano && ano.trim() !== '') {
            contadorAnos[ano] = (contadorAnos[ano] || 0) + 1;
          }
        });
        
        console.log('📈 Contador de TODOS os anos encontrados:', contadorAnos);
        
        // Filtrar valores nulos/vazios e remover duplicatas
        const todosAnos = allAnosData
          .map(item => item.ano_caip)
          .filter(ano => ano && ano.trim() !== '');
        
        console.log('✅ Total de anos válidos após filtrar nulos:', todosAnos.length);
        
        const anosUnicos = [...new Set(todosAnos)].sort();
        console.log('🎯 Anos únicos ordenados final:', anosUnicos);
        
        // Verificar especificamente se 2025 existe
        const tem2025 = allAnosData.some(item => item.ano_caip === '2025');
        console.log('🔎 Existe ano 2025 na base completa?', tem2025);
        
        setAnosDisponiveis(anosUnicos);
      }

      // Buscar todas as unidades gestoras disponíveis com paginação
      let allUnidadesData: any[] = [];
      from = 0;
      hasMore = true;

      while (hasMore) {
        const { data: batchData } = await supabase
          .from('dados_caip')
          .select('unidade_gestora')
          .not('unidade_gestora', 'is', null)
          .range(from, from + batchSize - 1);

        if (batchData) {
          allUnidadesData = [...allUnidadesData, ...batchData];
          if (batchData.length < batchSize) {
            hasMore = false;
          } else {
            from += batchSize;
          }
        } else {
          hasMore = false;
        }
      }
      
      if (allUnidadesData.length > 0) {
        const unidadesUnicas = [...new Set(allUnidadesData.map(item => item.unidade_gestora).filter(Boolean))].sort();
        setUnidadesGestoras(unidadesUnicas);
      }

      // Buscar todos os tipos de unidade disponíveis com paginação
      let allTiposData: any[] = [];
      from = 0;
      hasMore = true;

      while (hasMore) {
        const { data: batchData } = await supabase
          .from('dados_caip')
          .select('tipo_de_unidade')
          .not('tipo_de_unidade', 'is', null)
          .range(from, from + batchSize - 1);

        if (batchData) {
          allTiposData = [...allTiposData, ...batchData];
          if (batchData.length < batchSize) {
            hasMore = false;
          } else {
            from += batchSize;
          }
        } else {
          hasMore = false;
        }
      }
      
      if (allTiposData.length > 0) {
        const tiposUnicos = [...new Set(allTiposData.map(item => item.tipo_de_unidade).filter(Boolean))].sort();
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

  // Aplicar pré-filtro baseado na unidade gestora do usuário (se não for admin)
  useEffect(() => {
    if (!profileLoading && profile && !isAdmin && profile.unidade_gestora) {
      setFilters(prev => ({
        ...prev,
        unidadeGestora: [profile.unidade_gestora]
      }));
    }
  }, [profile, isAdmin, profileLoading]);

  // Atualizar filtros quando qualquer valor mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, 100); // Debounce para evitar chamadas excessivas
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterData, value: string[] | string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

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
          </Label>
          {!isAdmin && profile?.unidade_gestora && (
            <p className="text-xs text-muted-foreground -mt-1 mb-1">(Fixo para seu perfil)</p>
          )}
          <MultiSelect
            options={unidadesGestoras}
            selected={filters.unidadeGestora}
            onChange={(selected) => handleFilterChange('unidadeGestora', selected)}
            placeholder="Selecione a unidade"
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
}
