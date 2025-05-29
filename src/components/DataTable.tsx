
import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface DataRow {
  id: string;
  'ano_caip': string;
  'tipo_de_unidade': string;
  'unidade_gestora': string;
  'nome_da_unidade': string;
  'estado_de_conservacao': string;
  'vida_util_estimada_anos': string;
  'area_do_terreno_m2': number;
  'area_construida_m2': number;
}

interface DataTableProps {
  data: DataRow[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function DataTable({ data, selectedItems, onSelectionChange }: DataTableProps) {
  const handleSelectAll = () => {
    if (selectedItems.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(item => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter(item => item !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  };

  const formatArea = (area: number | null | undefined) => {
    if (area === null || area === undefined) return '-';
    return area.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' m²';
  };

  const getConservationColor = (estado: string) => {
    if (!estado) return 'text-muted-foreground';
    
    switch (estado.toLowerCase()) {
      case 'ótimo': return 'text-green-600 dark:text-green-400';
      case 'bom': return 'text-blue-600 dark:text-blue-400';
      case 'regular': return 'text-yellow-600 dark:text-yellow-400';
      case 'ruim': return 'text-orange-600 dark:text-orange-400';
      case 'péssimo': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden bg-card border border-border">
      <div className="p-6 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Dados da Base CAIP</h3>
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} de {data.length} selecionados
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="p-4 text-left">
                <Checkbox
                  checked={selectedItems.length === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Ano CAIP</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Nome da Unidade</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Unidade Gestora</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Tipo de Unidade</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Estado de Conservação</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Vida Útil (Anos)</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Área do Terreno</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Área Construída</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={row.id} 
                className={`border-b border-border hover:bg-muted/20 transition-colors ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                }`}
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedItems.includes(row.id)}
                    onCheckedChange={() => handleSelectItem(row.id)}
                  />
                </td>
                <td className="p-4 text-sm font-medium text-foreground">
                  {row['ano_caip'] || '-'}
                </td>
                <td className="p-4 text-sm text-foreground">
                  {row['nome_da_unidade'] || '-'}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {row['unidade_gestora'] || '-'}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {row['tipo_de_unidade'] || '-'}
                </td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${getConservationColor(row['estado_de_conservacao'])}`}>
                    {row['estado_de_conservacao'] || '-'}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {row['vida_util_estimada_anos'] || '-'}
                </td>
                <td className="p-4 text-sm text-foreground">
                  {formatArea(row['area_do_terreno_m2'])}
                </td>
                <td className="p-4 text-sm text-foreground">
                  {formatArea(row['area_construida_m2'])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          Nenhum dado encontrado
        </div>
      )}
    </Card>
  );
}
