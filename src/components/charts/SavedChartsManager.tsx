
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Eye } from 'lucide-react';
import { ChartConfig } from '@/hooks/useChartData';
import { useToast } from '@/hooks/use-toast';

interface SavedChartsManagerProps {
  onLoadChart: (config: ChartConfig) => void;
  currentConfig: ChartConfig;
  onSaveChart: (config: ChartConfig) => boolean;
}

const STORAGE_KEY = 'sigi-saved-charts';

export function SavedChartsManager({ onLoadChart, currentConfig, onSaveChart }: SavedChartsManagerProps) {
  const [savedCharts, setSavedCharts] = useState<ChartConfig[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedCharts();
  }, []);

  const loadSavedCharts = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedCharts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar gráficos salvos:', error);
    }
  };

  const saveCurrentChart = () => {
    if (!currentConfig || !currentConfig.name || !currentConfig.name.trim()) {
      toast({
        title: "Erro",
        description: "Configure um nome para o gráfico antes de salvar",
        variant: "destructive",
      });
      return;
    }

    try {
      const newChart = {
        ...currentConfig,
        id: Date.now().toString(),
      };

      const updatedCharts = [...savedCharts, newChart];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCharts));
      setSavedCharts(updatedCharts);
      
      toast({
        title: "Sucesso",
        description: "Gráfico salvo com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o gráfico",
        variant: "destructive",
      });
    }
  };

  const deleteChart = (id: string) => {
    try {
      const updatedCharts = savedCharts.filter(chart => chart.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCharts));
      setSavedCharts(updatedCharts);
      
      toast({
        title: "Sucesso",
        description: "Gráfico excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir o gráfico",
        variant: "destructive",
      });
    }
  };

  const exportChart = (chart: ChartConfig) => {
    try {
      const dataStr = JSON.stringify(chart, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grafico-${chart.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Configuração do gráfico exportada!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar o gráfico",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gráficos Salvos</CardTitle>
        <Button onClick={saveCurrentChart} className="w-full" size="sm">
          Salvar Configuração Atual
        </Button>
      </CardHeader>
      <CardContent>
        {savedCharts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum gráfico salvo
          </p>
        ) : (
          <div className="space-y-3">
            {savedCharts.map((chart) => (
              <div key={chart.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{chart.name}</h4>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {chart.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {chart.aggregation}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLoadChart(chart)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportChart(chart)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteChart(chart.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
