
import { useState } from 'react';
import { Calculator, DollarSign, Percent, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ParameterData {
  cub: number;
  valorM2: number;
  area: number;
  bdi: number;
}

interface ParameterFormProps {
  onSubmit: (parameters: ParameterData) => void;
}

export function ParameterForm({ onSubmit }: ParameterFormProps) {
  const [parameters, setParameters] = useState<ParameterData>({
    cub: 0,
    valorM2: 0,
    area: 0,
    bdi: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parameters);
  };

  const handleChange = (field: keyof ParameterData, value: string) => {
    setParameters(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Parâmetros RVR - Avaliação Imobiliária</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cub" className="text-sm font-medium text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              CUB (R$/m²)
            </Label>
            <Input
              id="cub"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={parameters.cub || ''}
              onChange={(e) => handleChange('cub', e.target.value)}
              className="bg-background border-border focus:border-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              Custo Unitário Básico por metro quadrado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorM2" className="text-sm font-medium text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Valor m² (R$/m²)
            </Label>
            <Input
              id="valorM2"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={parameters.valorM2 || ''}
              onChange={(e) => handleChange('valorM2', e.target.value)}
              className="bg-background border-border focus:border-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              Valor por metro quadrado específico
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              Área (m²)
            </Label>
            <Input
              id="area"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={parameters.area || ''}
              onChange={(e) => handleChange('area', e.target.value)}
              className="bg-background border-border focus:border-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              Área total do imóvel em metros quadrados
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bdi" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              BDI (%)
            </Label>
            <Input
              id="bdi"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0,00"
              value={parameters.bdi || ''}
              onChange={(e) => handleChange('bdi', e.target.value)}
              className="bg-background border-border focus:border-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              Benefícios e Despesas Indiretas
            </p>
          </div>
        </div>

        <div className="bg-muted/20 border border-border rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Resumo dos Parâmetros RVR</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">CUB:</span>
              <span className="ml-2 font-medium text-foreground">
                {parameters.cub ? parameters.cub.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Valor m²:</span>
              <span className="ml-2 font-medium text-foreground">
                {parameters.valorM2 ? parameters.valorM2.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Área:</span>
              <span className="ml-2 font-medium text-foreground">
                {parameters.area ? `${parameters.area} m²` : '0 m²'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">BDI:</span>
              <span className="ml-2 font-medium text-foreground">
                {parameters.bdi ? `${parameters.bdi}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="hover-scale">
            Gerar Relatório RVR
          </Button>
        </div>
      </form>
    </Card>
  );
}
