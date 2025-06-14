import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Edit, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProfile } from '@/hooks/useProfile';
import { useState, useMemo } from 'react';

type DadosCAIP = Tables<'dados_caip'>;

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = keyof DadosCAIP | 'nota_total';

interface ExistingRecordsListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: DadosCAIP[];
  handleEdit: (item: DadosCAIP) => void;
  handleDelete?: (item: DadosCAIP) => void;
}

export const ExistingRecordsList = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredData, 
  handleEdit,
  handleDelete 
}: ExistingRecordsListProps) => {
  const { isAdmin } = useProfile();
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const calculateNotaTotal = (notaAdequacao: string | null, notaManutencao: string | null) => {
    const adequacao = parseFloat(notaAdequacao || '0');
    const manutencao = parseFloat(notaManutencao || '0');
    const notaTotal = (adequacao * 0.6) + (manutencao * 0.4);
    return notaTotal.toFixed(2);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn === 'nota_total') {
        aValue = parseFloat(calculateNotaTotal(a.nota_para_adequacao, a.nota_para_manutencao));
        bValue = parseFloat(calculateNotaTotal(b.nota_para_adequacao, b.nota_para_manutencao));
      } else {
        aValue = a[sortColumn];
        bValue = b[sortColumn];
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Convert to string for comparison if not numbers
      if (typeof aValue !== 'number' && typeof bValue !== 'number') {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4 text-foreground" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="h-4 w-4 text-foreground" />;
    }
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="bg-card border-border w-full">
      <CardHeader>
        <CardTitle>Registros Existentes</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, unidade gestora ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px] text-center">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 font-semibold justify-center w-full"
                    onClick={() => handleSort('ano_caip')}
                  >
                    Ano CAIP
                    {getSortIcon('ano_caip')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[120px] text-center">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 font-semibold justify-center w-full"
                    onClick={() => handleSort('unidade_gestora')}
                  >
                    Unidade Gestora
                    {getSortIcon('unidade_gestora')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px] text-center">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 font-semibold justify-center w-full"
                    onClick={() => handleSort('tipo_de_unidade')}
                  >
                    Tipo de Unidade
                    {getSortIcon('tipo_de_unidade')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px] text-center">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 font-semibold justify-center w-full"
                    onClick={() => handleSort('nome_da_unidade')}
                  >
                    Nome da Unidade
                    {getSortIcon('nome_da_unidade')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px] text-center">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 font-semibold justify-center w-full"
                    onClick={() => handleSort('nota_para_adequacao')}
                  >
                    Nota Adequação
                    {getSortIcon('nota_para_adequacao')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px] text-center">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 font-semibold justify-center w-full"
                    onClick={() => handleSort('nota_para_manutencao')}
                  >
                    Nota Manutenção
                    {getSortIcon('nota_para_manutencao')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[90px] text-center">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 font-semibold justify-center w-full"
                    onClick={() => handleSort('nota_total')}
                  >
                    Nota Total
                    {getSortIcon('nota_total')}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[100px] text-center">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 font-semibold justify-center w-full"
                    onClick={() => handleSort('rvr')}
                  >
                    RVR
                    {getSortIcon('rvr')}
                  </Button>
                </TableHead>
                <TableHead className="w-12 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Badge variant="outline">
                      {item.ano_caip || 'Sem ano'}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.unidade_gestora || 'N/A'}</TableCell>
                  <TableCell>{item.tipo_de_unidade || 'N/A'}</TableCell>
                  <TableCell className="font-medium">
                    {item.nome_da_unidade || 'Nome não informado'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.nota_para_adequacao ? `${item.nota_para_adequacao}%` : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {item.nota_para_manutencao ? `${item.nota_para_manutencao}%` : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {item.nota_para_adequacao || item.nota_para_manutencao 
                        ? `${calculateNotaTotal(item.nota_para_adequacao, item.nota_para_manutencao)}%` 
                        : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.rvr ? `R$ ${Number(item.rvr).toLocaleString('pt-BR')}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0"
                        title="Editar registro"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {isAdmin && handleDelete && (
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
                                Tem certeza que deseja excluir o registro "{item.nome_da_unidade || 'Nome não informado'}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(item)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {sortedData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum registro encontrado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};