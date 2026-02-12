
import React, { useState } from 'react';
import { ChartConfigPanel } from './ChartConfigPanel';
import { ChartPreview } from './ChartPreview';
import { SavedChartsManager } from './SavedChartsManager';
import { ChartConfig, useChartData, useComparisonData } from '@/hooks/useChartData';
import { DataRow } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
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

    toast({
      title: "Sucesso",
      description: "Gráfico salvo com sucesso!",
    });
    
    setConfig({ ...DEFAULT_CONFIG, id: Date.now().toString() });
    return true;
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
          />
        </div>

        <div className="lg:col-span-3">
          <ChartPreview 
            data={chartData} 
            config={config} 
            comparisonData={comparisonData}
          />
        </div>
      </div>
    </div>
  );
}
