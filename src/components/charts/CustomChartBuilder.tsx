
import React, { useState, useRef, useCallback } from 'react';
import { ChartConfigPanel } from './ChartConfigPanel';
import { ChartPreview } from './ChartPreview';
import { SavedChartsManager } from './SavedChartsManager';
import { ChartConfig, useChartData, useComparisonData } from '@/hooks/useChartData';
import { DataRow } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface CustomChartBuilderProps {
  data: DataRow[];
}

const DEFAULT_CONFIG: ChartConfig = {
  id: '',
  name: '',
  type: 'table',
  xField: '',
  yField: '',
  aggregation: 'count',
};

export function CustomChartBuilder({ data }: CustomChartBuilderProps) {
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CONFIG);
  const [saveCounter, setSaveCounter] = useState(0);
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  
  const chartData = useChartData(data, config);
  const comparisonData = useComparisonData(
    data, 
    config.comparisonFields || [], 
    config.groupField
  );

  const handleSave = (configToSave: ChartConfig) => {
    if (!configToSave.name.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para o gráfico",
        variant: "destructive",
      });
      return false;
    }

    try {
      const STORAGE_KEY = 'sigi-saved-charts';
      const saved = localStorage.getItem(STORAGE_KEY);
      const existing: ChartConfig[] = saved ? JSON.parse(saved) : [];
      const newChart = { ...configToSave, id: Date.now().toString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newChart]));
      setSaveCounter(c => c + 1);

      toast({
        title: "Sucesso",
        description: "Gráfico salvo com sucesso!",
      });

      setConfig({ ...DEFAULT_CONFIG, id: '' });
      return true;
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao salvar o gráfico",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    toast({
      title: "Configuração limpa",
      description: "Formulário resetado com sucesso!",
    });
  };

  const handleLoadChart = (loadedConfig: ChartConfig) => {
    setConfig(loadedConfig);
    toast({
      title: "Gráfico carregado",
      description: `Gráfico "${loadedConfig.name}" carregado com sucesso!`,
    });
  };

  const handleExportImage = useCallback(async (chart: ChartConfig) => {
    // Load the chart first
    setConfig(chart);
    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!chartRef.current) {
      toast({ title: "Erro", description: "Não foi possível capturar o gráfico", variant: "destructive" });
      return;
    }

    try {
      const canvas = await html2canvas(chartRef.current, { 
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `grafico-${chart.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      toast({ title: "Sucesso", description: "Imagem do gráfico baixada!" });
    } catch {
      toast({ title: "Erro", description: "Erro ao exportar imagem do gráfico", variant: "destructive" });
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <ChartConfigPanel
            config={config}
            onConfigChange={setConfig}
            onSave={() => handleSave(config)}
            onReset={handleReset}
          />
          
          <SavedChartsManager
            onLoadChart={handleLoadChart}
            currentConfig={config}
            onSaveChart={handleSave}
            refreshTrigger={saveCounter}
            onExportImage={handleExportImage}
          />
        </div>

        <div className="lg:col-span-3">
          <ChartPreview 
            ref={chartRef}
            data={chartData} 
            config={config} 
            comparisonData={comparisonData}
          />
        </div>
      </div>
    </div>
  );
}
