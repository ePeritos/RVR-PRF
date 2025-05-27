
import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface DataRow {
  id: string;
  nome: string;
  categoria: string;
  valor: number;
  data: string;
  status: string;
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
    switch (status) {
      case 'ativo': return 'text-green-600 dark:text-green-400';
      case 'concluido': return 'text-blue-600 dark:text-blue-400';
      case 'pendente': return 'text-yellow-600 dark:text-yellow-400';
      case 'cancelado': return 'text-red-600 dark:text-red-400';
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
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Nome</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Categoria</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Valor (R$)</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Data</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Status</th>
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
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </td>
                <td className="p-4 text-sm font-medium text-foreground">{row.nome}</td>
                <td className="p-4 text-sm text-muted-foreground">{row.categoria}</td>
                <td className="p-4 text-sm text-foreground">
                  {row.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="p-4 text-sm text-muted-foreground">{row.data}</td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${getStatusColor(row.status)}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
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
