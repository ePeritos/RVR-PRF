import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, FileText, TrendingUp, MapPin } from 'lucide-react';
import { DataFilter } from '@/components/DataFilter';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalImoveis: number;
  imoveisAvaliados: number;
  totalAreas: number;
  valorTotalAvaliado: number;
  percentualPreenchimento: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { data: supabaseData, loading } = useSupabaseData();
  const [stats, setStats] = useState<DashboardStats>({
    totalImoveis: 0,
    imoveisAvaliados: 0,
    totalAreas: 0,
    valorTotalAvaliado: 0,
    percentualPreenchimento: 0,
  });
  const [filteredStats, setFilteredStats] = useState<DashboardStats>(stats);

  // Função para calcular percentual de preenchimento dos campos CAIP
  const calculateFieldCompletion = (data: any[]) => {
    if (data.length === 0) return 0;

    // Lista de campos relevantes do CAIP para calcular o preenchimento
    const relevantFields = [
      'nome_da_unidade', 'unidade_gestora', 'tipo_de_unidade', 'endereco', 'zona',
      'coordenadas', 'area_construida_m2', 'area_do_terreno_m2', 'idade_aparente_do_imovel',
      'vida_util_estimada_anos', 'estado_de_conservacao', 'situacao_do_imovel',
      'fornecimento_de_agua', 'fornecimento_de_energia_eletrica', 'esgotamento_sanitario',
      'conexao_de_internet', 'possui_wireless_wifi', 'climatizacao_de_ambientes',
      'sala_cofre', 'protecao_contra_incendios', 'protecao_contra_intrusao', 'muro_ou_alambrado'
    ];

    const totalFields = relevantFields.length;
    let totalCompletion = 0;

    data.forEach(item => {
      let filledFields = 0;
      relevantFields.forEach(field => {
        const value = item[field];
        if (value !== null && value !== undefined && value !== '' && value !== 'false') {
          filledFields++;
        }
      });
      totalCompletion += (filledFields / totalFields) * 100;
    });

    return totalCompletion / data.length;
  };

  useEffect(() => {
    if (supabaseData.length > 0) {
      const totalImoveis = supabaseData.length;
      const imoveisAvaliados = supabaseData.filter(item => 
        item.rvr && Number(item.rvr) > 0
      ).length;
      
      const totalAreas = supabaseData.reduce((acc, item) => 
        acc + (Number(item.area_construida_m2) || 0), 0
      );
      
      const valorTotalAvaliado = supabaseData.reduce((acc, item) => 
        acc + (Number(item.rvr) || 0), 0
      );

      const percentualPreenchimento = calculateFieldCompletion(supabaseData);

      const newStats = {
        totalImoveis,
        imoveisAvaliados,
        totalAreas,
        valorTotalAvaliado,
        percentualPreenchimento,
      };
      
      setStats(newStats);
      setFilteredStats(newStats);
    }
  }, [supabaseData]);

  const handleFilterChange = (filters: any) => {
    let filtered = supabaseData;
    
    if (filters.anoCAIP) {
      filtered = filtered.filter(item => item['ano_caip'] === filters.anoCAIP);
    }
    
    if (filters.unidadeGestora) {
      filtered = filtered.filter(item => item['unidade_gestora'] === filters.unidadeGestora);
    }
    
    if (filters.tipoUnidade) {
      filtered = filtered.filter(item => item['tipo_de_unidade'] === filters.tipoUnidade);
    }
    
    if (filters.nomeUnidade) {
      filtered = filtered.filter(item => 
        item['nome_da_unidade'] && 
        item['nome_da_unidade'].toLowerCase().includes(filters.nomeUnidade.toLowerCase())
      );
    }
    
    const totalImoveis = filtered.length;
    const imoveisAvaliados = filtered.filter(item => 
      item.rvr && Number(item.rvr) > 0
    ).length;
    
    const totalAreas = filtered.reduce((acc, item) => 
      acc + (Number(item.area_construida_m2) || 0), 0
    );
    
    const valorTotalAvaliado = filtered.reduce((acc, item) => 
      acc + (Number(item.rvr) || 0), 0
    );

    const percentualPreenchimento = calculateFieldCompletion(filtered);

    setFilteredStats({
      totalImoveis,
      imoveisAvaliados,
      totalAreas,
      valorTotalAvaliado,
      percentualPreenchimento,
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Imóveis</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredStats.totalImoveis.toLocaleString('pt-BR')}
            </div>
            <Badge variant="secondary" className="mt-2">
              {filteredStats.totalImoveis === stats.totalImoveis ? 'Total' : 'Filtrado'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imóveis Avaliados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredStats.imoveisAvaliados.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredStats.totalImoveis > 0 
                ? `${((filteredStats.imoveisAvaliados / filteredStats.totalImoveis) * 100).toFixed(1)}% do total`
                : '0% do total'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Total (m²)</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredStats.totalAreas.toLocaleString('pt-BR', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Área construída total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Avaliado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredStats.valorTotalAvaliado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma dos RVRs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preenchimento CAIP</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {filteredStats.percentualPreenchimento.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média de campos preenchidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="max-w-5xl mx-auto">
        <DataFilter onFilterChange={handleFilterChange} />
      </div>
    </div>
  );
};

export default Dashboard;