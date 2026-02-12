
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartConfig, CHART_FIELDS } from '@/hooks/useChartData';
import { Badge } from '@/components/ui/badge';

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
  { value: 'comparison', label: '📊 Comparativo Sim/Não' },
];

const AGGREGATIONS = [
  { value: 'count', label: 'Contagem' },
  { value: 'sum', label: 'Soma' },
  { value: 'avg', label: 'Média' },
  { value: 'min', label: 'Mínimo' },
  { value: 'max', label: 'Máximo' },
];

const CATEGORIES = ['Ambientes', 'Infraestrutura', 'Segurança', 'Manutenção'];

export function ChartConfigPanel({ config, onConfigChange, onSave, onReset }: ChartConfigPanelProps) {
  const handleFieldChange = (field: keyof ChartConfig, value: string) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  const handleComparisonFieldToggle = (fieldKey: string) => {
    const current = config.comparisonFields || [];
    const updated = current.includes(fieldKey)
      ? current.filter(f => f !== fieldKey)
      : [...current, fieldKey];
    onConfigChange({ ...config, comparisonFields: updated });
  };

  const handleSelectAllCategory = (category: string) => {
    const categoryFields = CHART_FIELDS.filter(f => f.category === category).map(f => f.key);
    const current = config.comparisonFields || [];
    const allSelected = categoryFields.every(f => current.includes(f));
    
    if (allSelected) {
      onConfigChange({ ...config, comparisonFields: current.filter(f => !categoryFields.includes(f)) });
    } else {
      const merged = [...new Set([...current, ...categoryFields])];
      onConfigChange({ ...config, comparisonFields: merged });
    }
  };

  const isComparison = config.type === 'comparison';
  const numericFields = CHART_FIELDS.filter(field => field.type === 'number');
  const allFields = CHART_FIELDS;
  const booleanFields = CHART_FIELDS.filter(f => f.type === 'boolean');
  const groupableFields = CHART_FIELDS.filter(f => f.type === 'string');

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
              onConfigChange({
                ...config,
                type: type as ChartConfig['type'],
                comparisonFields: type === 'comparison' ? (config.comparisonFields || []) : undefined,
              });
            }}
            placeholder="Selecione o tipo"
          />
        </div>

        {isComparison ? (
          <>
            <div className="space-y-2">
              <Label>Agrupar por (opcional)</Label>
              <SimpleSelect
                options={['Sem agrupamento', ...groupableFields.map(f => f.label)]}
                value={config.groupField 
                  ? groupableFields.find(f => f.key === config.groupField)?.label || '' 
                  : 'Sem agrupamento'}
                onChange={(value) => {
                  const field = groupableFields.find(f => f.label === value)?.key || '';
                  onConfigChange({ ...config, groupField: field || undefined });
                }}
                placeholder="Selecione agrupamento"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Campos para comparar</Label>
                <Badge variant="secondary" className="text-xs">
                  {(config.comparisonFields || []).length} selecionados
                </Badge>
              </div>
              <ScrollArea className="h-64 border rounded-md p-2">
                {CATEGORIES.map(category => {
                  const categoryFields = booleanFields.filter(f => f.category === category);
                  const allSelected = categoryFields.every(f => (config.comparisonFields || []).includes(f.key));
                  
                  return (
                    <div key={category} className="mb-3">
                      <div 
                        className="flex items-center gap-2 mb-1 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                        onClick={() => handleSelectAllCategory(category)}
                      >
                        <Checkbox 
                          checked={allSelected}
                          onCheckedChange={() => handleSelectAllCategory(category)}
                        />
                        <span className="text-xs font-bold text-primary uppercase">{category}</span>
                      </div>
                      <div className="ml-4 space-y-1">
                        {categoryFields.map(field => (
                          <div key={field.key} className="flex items-center gap-2">
                            <Checkbox
                              id={`comp-${field.key}`}
                              checked={(config.comparisonFields || []).includes(field.key)}
                              onCheckedChange={() => handleComparisonFieldToggle(field.key)}
                            />
                            <Label htmlFor={`comp-${field.key}`} className="text-xs cursor-pointer">
                              {field.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="x-field">{config.type === 'table' ? 'Linhas' : 'Campo X (Eixo Horizontal)'}</Label>
              <SimpleSelect
                options={allFields.map(field => `${field.label}${field.category ? ` [${field.category}]` : ''}`)}
                value={(() => {
                  const f = allFields.find(field => field.key === config.xField);
                  return f ? `${f.label}${f.category ? ` [${f.category}]` : ''}` : '';
                })()}
                onChange={(value) => {
                  const field = allFields.find(f => `${f.label}${f.category ? ` [${f.category}]` : ''}` === value)?.key || '';
                  handleFieldChange('xField', field);
                }}
                placeholder={config.type === 'table' ? 'Selecione o campo para linhas' : 'Selecione o campo X'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="y-field">{config.type === 'table' ? 'Colunas' : 'Campo Y (Eixo Vertical)'}</Label>
              <SimpleSelect
                options={config.type === 'table' 
                  ? allFields.map(field => `${field.label}${field.category ? ` [${field.category}]` : ''}`)
                  : numericFields.map(field => field.label)}
                value={config.type === 'table' 
                  ? (() => {
                      const f = allFields.find(field => field.key === config.yField);
                      return f ? `${f.label}${f.category ? ` [${f.category}]` : ''}` : '';
                    })()
                  : numericFields.find(field => field.key === config.yField)?.label || ''}
                onChange={(value) => {
                  const field = config.type === 'table'
                    ? allFields.find(f => `${f.label}${f.category ? ` [${f.category}]` : ''}` === value)?.key || ''
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
          </>
        )}

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
