import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, FileText, TrendingUp, MapPin } from 'lucide-react';
import { DataFilter } from '@/components/DataFilter';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalImoveis: number;
  imoveisAvaliados: number;
  totalAreas: number;
  valorTotalAvaliado: number;
}

interface UnidadeGestoraData {
  unidade: string;
  numeroImoveis: number;
  areaConstruidaMedia: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { data: supabaseData, loading } = useSupabaseData();
  const [stats, setStats] = useState<DashboardStats>({
    totalImoveis: 0,
    imoveisAvaliados: 0,
    totalAreas: 0,
    valorTotalAvaliado: 0,
  });
  const [filteredStats, setFilteredStats] = useState<DashboardStats>(stats);
  const [unidadeGestoraData, setUnidadeGestoraData] = useState<UnidadeGestoraData[]>([]);

  // Função para formatar valores grandes de forma compacta
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `R$ ${(value / 1000000000).toFixed(1)} bi`;
    } else if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)} mi`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)} mil`;
    } else {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
  };

  // Função para calcular dados por unidade gestora
  const calculateUnidadeGestoraData = (data: any[]) => {
    const unidadeMap = new Map<string, { count: number; area: number }>();
    
    data.forEach(item => {
      const unidade = item.unidade_gestora || 'Não informado';
      const area = Number(item.area_construida_m2) || 0;
      
      if (unidadeMap.has(unidade)) {
        const existing = unidadeMap.get(unidade)!;
        unidadeMap.set(unidade, {
          count: existing.count + 1,
          area: existing.area + area
        });
      } else {
        unidadeMap.set(unidade, { count: 1, area });
      }
    });

    return Array.from(unidadeMap.entries())
      .map(([unidade, data]) => ({
        unidade: unidade.replace('SPRF/', ''), // Remove prefixo para melhor visualização
        numeroImoveis: data.count,
        areaConstruidaMedia: Math.round(data.area / data.count)
      }))
      .sort((a, b) => b.numeroImoveis - a.numeroImoveis)
      .slice(0, 10); // Top 10 unidades
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

      const unidadeData = calculateUnidadeGestoraData(supabaseData);

      const newStats = {
        totalImoveis,
        imoveisAvaliados,
        totalAreas,
        valorTotalAvaliado,
      };
      
      setStats(newStats);
      setFilteredStats(newStats);
      setUnidadeGestoraData(unidadeData);
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

    const unidadeData = calculateUnidadeGestoraData(filtered);

    setFilteredStats({
      totalImoveis,
      imoveisAvaliados,
      totalAreas,
      valorTotalAvaliado,
    });
    setUnidadeGestoraData(unidadeData);
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

      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          SIGI-PRF
        </h2>
        <p className="text-lg text-muted-foreground mb-1">
          Sistema de Gestão de Imóveis da PRF
        </p>
        <p className="text-sm text-muted-foreground">
          Plataforma integrada para gestão completa do patrimônio imobiliário da Polícia Rodoviária Federal
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="text-2xl font-bold text-foreground break-words">
              {formatCurrency(filteredStats.valorTotalAvaliado)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma dos RVRs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Unidades Gestoras */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Área Construída Média por Unidade Gestora</CardTitle>
          <p className="text-sm text-muted-foreground">
            Área construída média por imóvel (Top 10 unidades)
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={unidadeGestoraData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="unidade" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [
                    `${Number(value).toLocaleString('pt-BR')} m²`,
                    'Área Construída Média'
                  ]}
                  labelFormatter={(label) => `Unidade: ${label}`}
                />
                <Bar 
                  dataKey="areaConstruidaMedia" 
                  fill="hsl(var(--primary))" 
                  name="Área Construída Média (m²)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="max-w-5xl mx-auto">
        <DataFilter onFilterChange={handleFilterChange} />
      </div>
    </div>
  );
};

export default Dashboard;