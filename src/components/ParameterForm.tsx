
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
    bdi: 25,
    dataReferencia: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parameters);
  };

  const totalArea = selectedData.reduce((sum, item) => sum + (item.area_construida_m2 || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imóveis Selecionados</CardTitle>
          <CardDescription>
            {selectedData.length} imóveis selecionados com área total de {totalArea.toFixed(2)} m²
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedData.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{item.nome_da_unidade || 'Nome não informado'}</h4>
                <p className="text-xs text-muted-foreground">{item.tipo_de_unidade}</p>
                <p className="text-xs">Área: {item.area_construida_m2 || 0} m²</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros para Cálculo do RVR</CardTitle>
          <CardDescription>
            Configure os parâmetros técnicos para avaliação dos imóveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valorM2">Valor por m² (R$)</Label>
                <Input
                  id="valorM2"
                  type="number"
                  value={parameters.valorM2}
                  onChange={(e) => setParameters({...parameters, valorM2: Number(e.target.value)})}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bdi">BDI (%)</Label>
                <Input
                  id="bdi"
                  type="number"
                  value={parameters.bdi}
                  onChange={(e) => setParameters({...parameters, bdi: Number(e.target.value)})}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dataReferencia">Data de Referência</Label>
              <Input
                id="dataReferencia"
                type="date"
                value={parameters.dataReferencia}
                onChange={(e) => setParameters({...parameters, dataReferencia: e.target.value})}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Calcular RVR e Gerar Relatório
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
