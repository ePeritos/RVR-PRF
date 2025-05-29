
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataRow } from '@/hooks/useSupabaseData';

interface ParameterFormProps {
  onSubmit: (parameters: any) => void;
  selectedData: DataRow[];
}

export const ParameterForm = ({ onSubmit, selectedData }: ParameterFormProps) => {
  const [parameters, setParameters] = useState({
    valorM2: 1500,
    cubM2: 2000,
    bdi: 25,
    dataReferencia: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parameters);
  };

  const totalArea = selectedData.reduce((sum, item) => sum + (item.area_construida_m2 || 0), 0);
  const totalBenfeitoria = selectedData.reduce((sum, item) => {
    const area = item.area_construida_m2 || 0;
    return sum + (parameters.cubM2 * area);
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Imóveis Selecionados</CardTitle>
          <CardDescription>
            {selectedData.length} imóveis • Área total: {totalArea.toFixed(2)} m² • Benfeitoria estimada: R$ {totalBenfeitoria.toLocaleString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {selectedData.map((item) => (
              <div key={item.id} className="p-3 border rounded-md bg-muted/30">
                <h4 className="font-medium text-sm truncate">{item.nome_da_unidade || 'Nome não informado'}</h4>
                <p className="text-xs text-muted-foreground">{item.tipo_de_unidade}</p>
                <p className="text-xs font-medium">Área: {item.area_construida_m2 || 0} m²</p>
                <p className="text-xs text-green-600">
                  Benfeitoria: R$ {((item.area_construida_m2 || 0) * parameters.cubM2).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parâmetros para Cálculo do RVR</CardTitle>
          <CardDescription>
            Configure os parâmetros técnicos para avaliação dos imóveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorM2" className="text-sm font-medium">Valor por m² (R$)</Label>
                <Input
                  id="valorM2"
                  type="number"
                  value={parameters.valorM2}
                  onChange={(e) => setParameters({...parameters, valorM2: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                  required
                  className="h-9"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cubM2" className="text-sm font-medium">CUB/m² (R$)</Label>
                <Input
                  id="cubM2"
                  type="number"
                  value={parameters.cubM2}
                  onChange={(e) => setParameters({...parameters, cubM2: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                  required
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">Para cálculo da benfeitoria</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bdi" className="text-sm font-medium">BDI (%)</Label>
                <Input
                  id="bdi"
                  type="number"
                  value={parameters.bdi}
                  onChange={(e) => setParameters({...parameters, bdi: Number(e.target.value)})}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  className="h-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataReferencia" className="text-sm font-medium">Data de Referência</Label>
              <Input
                id="dataReferencia"
                type="date"
                value={parameters.dataReferencia}
                onChange={(e) => setParameters({...parameters, dataReferencia: e.target.value})}
                required
                className="h-9 max-w-xs"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full h-11 text-base font-medium">
                Calcular RVR e Gerar Relatório
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
