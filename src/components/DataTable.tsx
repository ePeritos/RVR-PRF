
import { useState } from 'react';
import { CheckCircle, Circle, ArrowUpAZ, ArrowDownAZ, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DataRow } from '@/hooks/useSupabaseData';
import { useProfile } from '@/hooks/useProfile';

interface DataTableProps {
  data: DataRow[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onDelete?: (item: DataRow) => void;
}

type SortField = keyof DataRow;
type SortDirection = 'asc' | 'desc' | null;

export function DataTable({ data, selectedItems, onSelectionChange, onDelete }: DataTableProps) {
  const { isAdmin } = useProfile();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedData = () => {
    if (!sortField || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string fields
      const aStr = String(aValue || '').toLowerCase();
      const bStr = String(bValue || '').toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'pt-BR');
      } else {
        return bStr.localeCompare(aStr, 'pt-BR');
      }
    });
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpAZ className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    
    if (sortDirection === 'asc') {
      return <ArrowUpAZ className="h-4 w-4 text-primary" />;
    } else if (sortDirection === 'desc') {
      return <ArrowDownAZ className="h-4 w-4 text-primary" />;
    }
    
    return <ArrowUpAZ className="h-4 w-4 text-muted-foreground opacity-50" />;
  };

  const sortedData = getSortedData();

  return (
    <Card className="overflow-hidden bg-card border border-border w-full">
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
                <label htmlFor="select-all" className="sr-only">Selecionar todos os itens</label>
                <Checkbox
                  id="select-all"
                  checked={selectedItems.length === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-foreground hover:bg-transparent"
                  onClick={() => handleSort('ano_caip')}
                >
                  <span className="flex items-center gap-2">
                    <div className="text-center leading-tight">
                      <div>Ano</div>
                      <div>CAIP</div>
                    </div>
                    <SortIcon field="ano_caip" />
                  </span>
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-foreground hover:bg-transparent"
                  onClick={() => handleSort('nome_da_unidade')}
                >
                  <span className="flex items-center gap-2">
                    <div className="text-center leading-tight">
                      <div>Nome da</div>
                      <div>Unidade</div>
                    </div>
                    <SortIcon field="nome_da_unidade" />
                  </span>
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-foreground hover:bg-transparent"
                  onClick={() => handleSort('unidade_gestora')}
                >
                  <span className="flex items-center gap-2">
                    <div className="text-center leading-tight">
                      <div>Unidade</div>
                      <div>Gestora</div>
                    </div>
                    <SortIcon field="unidade_gestora" />
                  </span>
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-foreground hover:bg-transparent"
                  onClick={() => handleSort('tipo_de_unidade')}
                >
                  <span className="flex items-center gap-2">
                    <div className="text-center leading-tight">
                      <div>Tipo de</div>
                      <div>Unidade</div>
                    </div>
                    <SortIcon field="tipo_de_unidade" />
                  </span>
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-foreground hover:bg-transparent"
                  onClick={() => handleSort('estado_de_conservacao')}
                >
                  <span className="flex items-center gap-2">
                    <div className="text-center leading-tight">
                      <div>Estado de</div>
                      <div>Conservação</div>
                    </div>
                    <SortIcon field="estado_de_conservacao" />
                  </span>
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-foreground hover:bg-transparent"
                  onClick={() => handleSort('vida_util_estimada_anos')}
                >
                  <span className="flex items-center gap-2">
                    <div className="text-center leading-tight">
                      <div>Vida Útil</div>
                      <div>(Anos)</div>
                    </div>
                    <SortIcon field="vida_util_estimada_anos" />
                  </span>
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-foreground hover:bg-transparent"
                  onClick={() => handleSort('area_do_terreno_m2')}
                >
                  <span className="flex items-center gap-2">
                    <div className="text-center leading-tight">
                      <div>Área do</div>
                      <div>Terreno</div>
                    </div>
                    <SortIcon field="area_do_terreno_m2" />
                  </span>
                </Button>
              </th>
              <th className="p-4 text-left">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium text-foreground hover:bg-transparent"
                  onClick={() => handleSort('area_construida_m2')}
                >
                  <span className="flex items-center gap-2">
                    <div className="text-center leading-tight">
                      <div>Área</div>
                      <div>Construída</div>
                    </div>
                    <SortIcon field="area_construida_m2" />
                  </span>
                 </Button>
               </th>
               {isAdmin && onDelete && (
                 <th className="p-4 text-left w-12">Ações</th>
               )}
             </tr>
           </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr 
                key={row.id} 
                className={`border-b border-border hover:bg-muted/20 transition-colors ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                }`}
              >
                <td className="p-4">
                  <label htmlFor={`select-item-${row.id}`} className="sr-only">
                    Selecionar item: {row['nome_da_unidade'] || 'Nome não informado'}
                  </label>
                  <Checkbox
                    id={`select-item-${row.id}`}
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
                 {isAdmin && onDelete && (
                   <td className="p-4">
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                           title="Deletar registro"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                           <AlertDialogDescription>
                             Tem certeza que deseja excluir o registro "{row['nome_da_unidade'] || 'Nome não informado'}"? 
                             Esta ação não pode ser desfeita.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancelar</AlertDialogCancel>
                           <AlertDialogAction 
                             onClick={() => onDelete(row)}
                             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                           >
                             Excluir
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   </td>
                 )}
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
