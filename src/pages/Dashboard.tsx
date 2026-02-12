import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, FileText, TrendingUp, MapPin } from 'lucide-react';
import { DataFilter } from '@/components/DataFilter';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomChartBuilder } from '@/components/charts/CustomChartBuilder';
import { CompletionDashboard } from '@/components/dashboard/CompletionDashboard';

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
    .sort((a, b) => b.areaConstruidaMedia - a.areaConstruidaMedia); // Ordenar por área construída média (maior para menor)
};

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, isAdmin } = useUserProfile();
  const { data: supabaseData, loading } = useSupabaseData(
    isAdmin ? undefined : profile?.unidade_gestora
  );
  const [stats, setStats] = useState<DashboardStats>({
    totalImoveis: 0,
    imoveisAvaliados: 0,
    totalAreas: 0,
    valorTotalAvaliado: 0,
  });
  const [filteredStats, setFilteredStats] = useState<DashboardStats>(stats);
  const [unidadeGestoraData, setUnidadeGestoraData] = useState<UnidadeGestoraData[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

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
      setFilteredData(supabaseData);
    }
  }, [supabaseData]);

  const handleFilterChange = (filters: any) => {
    let filtered = supabaseData;
    
    if (filters.anoCAIP && filters.anoCAIP.length > 0) {
      filtered = filtered.filter(item => filters.anoCAIP.includes(item['ano_caip']));
    }
    
    if (filters.unidadeGestora && filters.unidadeGestora.length > 0) {
      filtered = filtered.filter(item => filters.unidadeGestora.includes(item['unidade_gestora']));
    }
    
    if (filters.tipoUnidade && filters.tipoUnidade.length > 0) {
      filtered = filtered.filter(item => filters.tipoUnidade.includes(item['tipo_de_unidade']));
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
    setFilteredData(filtered);
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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
          SIGI-PRF
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mb-1">
          Sistema de Gestão de Imóveis da PRF
        </p>
        <p className="text-sm text-muted-foreground px-2">
          Plataforma integrada para gestão completa do patrimônio imobiliário da Polícia Rodoviária Federal
        </p>
      </div>

      {/* Filtros */}
      <div className="max-w-5xl mx-auto mb-6 sm:mb-8">
        <DataFilter onFilterChange={handleFilterChange} />
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

      {/* Tabs com Gráficos */}
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="preenchimento">Preenchimento</TabsTrigger>
          <TabsTrigger value="customizados">Customizados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Área Construída Média por Unidade Gestora</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unidadeGestoraData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="unidade" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} m²`, 'Área Construída Média']} />
                    <Bar dataKey="areaConstruidaMedia" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preenchimento" className="space-y-4">
          <CompletionDashboard data={filteredData} />
        </TabsContent>



        
        <TabsContent value="customizados" className="space-y-4">
          <CustomChartBuilder data={filteredData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
