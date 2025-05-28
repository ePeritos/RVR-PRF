
import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface DataRow {
  id: string;
  'Nome da unidade': string;
  'Tipo de unidade': string;
  'RVR': number;
  'Ano CAIP': string;
  'Situação do imóvel': string;
  'Área construída (m²)'?: number;
  'Unidade Gestora': string;
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'próprio': return 'text-green-600 dark:text-green-400';
      case 'alugado': return 'text-blue-600 dark:text-blue-400';
      case 'cedido': return 'text-yellow-600 dark:text-yellow-400';
      case 'em desuso': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden bg-card border border-border">
      <div className="p-6 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Dados da Planilha</h3>
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
              <th className="p-4 text-left text-sm font-medium text-foreground">Nome da Unidade</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Tipo de Unidade</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Unidade Gestora</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">RVR (R$)</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Ano CAIP</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Situação do Imóvel</th>
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
                <td className="p-4 text-sm font-medium text-foreground">{row['Nome da unidade']}</td>
                <td className="p-4 text-sm text-muted-foreground">{row['Tipo de unidade']}</td>
                <td className="p-4 text-sm text-muted-foreground">{row['Unidade Gestora']}</td>
                <td className="p-4 text-sm text-foreground">
                  {row['RVR'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="p-4 text-sm text-muted-foreground">{row['Ano CAIP']}</td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${getStatusColor(row['Situação do imóvel'])}`}>
                    {row['Situação do imóvel']}
                  </span>
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
