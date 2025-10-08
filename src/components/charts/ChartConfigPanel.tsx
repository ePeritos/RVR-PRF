
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChartConfig, CHART_FIELDS } from '@/hooks/useChartData';

interface ChartConfigPanelProps {
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
  onSave: () => void;
  onReset: () => void;
}

const CHART_TYPES = [
  { value: 'bar', label: 'Gráfico de Barras' },
  { value: 'pie', label: 'Gráfico de Pizza' },
  { value: 'line', label: 'Gráfico de Linha' },
  { value: 'area', label: 'Gráfico de Área' },
  { value: 'table', label: 'Tabela' },
];

const AGGREGATIONS = [
  { value: 'count', label: 'Contagem' },
  { value: 'sum', label: 'Soma' },
  { value: 'avg', label: 'Média' },
  { value: 'min', label: 'Mínimo' },
  { value: 'max', label: 'Máximo' },
];

export function ChartConfigPanel({ config, onConfigChange, onSave, onReset }: ChartConfigPanelProps) {
  const handleFieldChange = (field: keyof ChartConfig, value: string) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  const numericFields = CHART_FIELDS.filter(field => field.type === 'number');
  const allFields = CHART_FIELDS;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Configuração do Gráfico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chart-name">Nome do Gráfico</Label>
          <Input
            id="chart-name"
            value={config.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Digite o nome do gráfico"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chart-type">Tipo de Gráfico</Label>
          <SimpleSelect
            options={CHART_TYPES.map(type => type.label)}
            value={CHART_TYPES.find(type => type.value === config.type)?.label || ''}
            onChange={(value) => {
              const type = CHART_TYPES.find(t => t.label === value)?.value || 'bar';
              handleFieldChange('type', type);
            }}
            placeholder="Selecione o tipo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="x-field">{config.type === 'table' ? 'Linhas' : 'Campo X (Eixo Horizontal)'}</Label>
          <SimpleSelect
            options={allFields.map(field => field.label)}
            value={allFields.find(field => field.key === config.xField)?.label || ''}
            onChange={(value) => {
              const field = allFields.find(f => f.label === value)?.key || '';
              handleFieldChange('xField', field);
            }}
            placeholder={config.type === 'table' ? 'Selecione o campo para linhas' : 'Selecione o campo X'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="y-field">{config.type === 'table' ? 'Colunas' : 'Campo Y (Eixo Vertical)'}</Label>
          <SimpleSelect
            options={config.type === 'table' ? allFields.map(field => field.label) : numericFields.map(field => field.label)}
            value={config.type === 'table' 
              ? allFields.find(field => field.key === config.yField)?.label || ''
              : numericFields.find(field => field.key === config.yField)?.label || ''}
            onChange={(value) => {
              const field = config.type === 'table'
                ? allFields.find(f => f.label === value)?.key || ''
                : numericFields.find(f => f.label === value)?.key || '';
              handleFieldChange('yField', field);
            }}
            placeholder={config.type === 'table' ? 'Selecione o campo para colunas' : 'Selecione o campo Y'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aggregation">Agregação</Label>
          <SimpleSelect
            options={AGGREGATIONS.map(agg => agg.label)}
            value={AGGREGATIONS.find(agg => agg.value === config.aggregation)?.label || ''}
            onChange={(value) => {
              const aggregation = AGGREGATIONS.find(a => a.label === value)?.value || 'count';
              handleFieldChange('aggregation', aggregation);
            }}
            placeholder="Selecione a agregação"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onSave} className="flex-1">
            Salvar Gráfico
          </Button>
          <Button onClick={onReset} variant="outline" className="flex-1">
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
