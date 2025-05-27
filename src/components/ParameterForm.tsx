
import { useState } from 'react';
import { Calculator, DollarSign, Percent } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DataRow {
  id: string;
  nome: string;
  categoria: string;
  valor: number;
  data: string;
  status: string;
  area?: number; // Area will come from spreadsheet
}

interface ParameterData {
  cub: number;
  valorM2: number;
  bdi: number;
}

interface ParameterFormProps {
  onSubmit: (parameters: ParameterData) => void;
  selectedData: DataRow[];
}

export function ParameterForm({ onSubmit, selectedData }: ParameterFormProps) {
  const [parameters, setParameters] = useState<ParameterData>({
    cub: 0,
    valorM2: 0,
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

  // Calcular valores RVR para cada imóvel usando área da planilha
  const calculateRVR = (item: DataRow) => {
    if (!parameters.cub || !parameters.valorM2 || !parameters.bdi) {
      return {
        valorRvr: item.valor,
        diferenca: 0,
        percentual: 0
      };
    }

    // Use area from spreadsheet data, fallback to 100 if not available
    const areaImovel = item.area || 100;
    const fatorLocalizacao = 1.1;
    const fatorMercado = 1.05;
    const valorRvr = (parameters.valorM2 * areaImovel) * fatorLocalizacao * fatorMercado * (1 + parameters.bdi / 100);
    const diferenca = valorRvr - item.valor;
    const percentual = item.valor > 0 ? (diferenca / item.valor) * 100 : 0;

    return {
      valorRvr,
      diferenca,
      percentual
    };
  };

  const getDiferencaColor = (valor: number) => {
    if (valor > 0) return 'text-green-600 dark:text-green-400';
    if (valor < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Parâmetros RVR - Avaliação Imobiliária</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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

      {/* Tabela de Imóveis Selecionados com Valores Calculados */}
      {selectedData.length > 0 && (
        <Card className="overflow-hidden bg-card border border-border">
          <div className="p-6 border-b border-border bg-muted/50">
            <h3 className="text-lg font-semibold text-foreground">
              Imóveis Selecionados - Valores Calculados
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedData.length} imóvel(is) selecionado(s) com valores RVR calculados
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-foreground">Nome</th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">Categoria</th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">Área (m²)</th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">Valor Original</th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">Valor RVR</th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">Diferença</th>
                  <th className="p-4 text-left text-sm font-medium text-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.map((row, index) => {
                  const { valorRvr, diferenca, percentual } = calculateRVR(row);
                  const areaImovel = row.area || 100;
                  return (
                    <tr 
                      key={row.id} 
                      className={`border-b border-border hover:bg-muted/20 transition-colors ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                      }`}
                    >
                      <td className="p-4 text-sm font-medium text-foreground">{row.nome}</td>
                      <td className="p-4 text-sm text-muted-foreground">{row.categoria}</td>
                      <td className="p-4 text-sm text-muted-foreground">{areaImovel} m²</td>
                      <td className="p-4 text-sm text-foreground">
                        {row.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground">
                        {valorRvr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className={`p-4 text-sm font-medium ${getDiferencaColor(diferenca)}`}>
                        {diferenca > 0 ? '+' : ''}{diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className={`p-4 text-sm font-medium ${getDiferencaColor(diferenca)}`}>
                        {percentual > 0 ? '+' : ''}{percentual.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
