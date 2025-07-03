
import React, { useState } from 'react';
import { ChartConfigPanel } from './ChartConfigPanel';
import { ChartPreview } from './ChartPreview';
import { SavedChartsManager } from './SavedChartsManager';
import { ChartConfig, useChartData } from '@/hooks/useChartData';
import { DataRow } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

interface CustomChartBuilderProps {
  data: DataRow[];
}

const DEFAULT_CONFIG: ChartConfig = {
  id: '',
  name: '',
  type: 'bar',
  xField: '',
  yField: '',
  aggregation: 'count',
};

export function CustomChartBuilder({ data }: CustomChartBuilderProps) {
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CONFIG);
  const [saveFunction, setSaveFunction] = useState<((config: ChartConfig) => boolean) | null>(null);
  const { toast } = useToast();
  
  const chartData = useChartData(data, config);

  const handleSave = () => {
    if (saveFunction) {
      const success = saveFunction(config);
      if (success) {
        // Reset form after successful save
        setConfig({ ...DEFAULT_CONFIG, id: Date.now().toString() });
      }
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1 space-y-4">
          <ChartConfigPanel
            config={config}
            onConfigChange={setConfig}
            onSave={handleSave}
            onReset={handleReset}
          />
          
          <SavedChartsManager
            onLoadChart={handleLoadChart}
            currentConfig={config}
            onSaveChart={setSaveFunction as any}
          />
        </div>

        {/* Preview do Gráfico */}
        <div className="lg:col-span-3">
          <ChartPreview data={chartData} config={config} />
        </div>
      </div>
    </div>
  );
}
