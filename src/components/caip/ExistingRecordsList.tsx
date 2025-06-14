import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Edit } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type DadosCAIP = Tables<'dados_caip'>;

interface ExistingRecordsListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: DadosCAIP[];
  handleEdit: (item: DadosCAIP) => void;
}

export const ExistingRecordsList = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredData, 
  handleEdit 
}: ExistingRecordsListProps) => {
  
  const calculateNotaTotal = (notaAdequacao: string | null, notaManutencao: string | null) => {
    const adequacao = parseFloat(notaAdequacao || '0');
    const manutencao = parseFloat(notaManutencao || '0');
    const notaTotal = (adequacao * 0.6) + (manutencao * 0.4);
    return notaTotal.toFixed(2);
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
                <TableHead className="min-w-[200px]">Nome da Unidade</TableHead>
                <TableHead className="min-w-[120px]">Unidade Gestora</TableHead>
                <TableHead className="min-w-[100px]">Tipo</TableHead>
                <TableHead className="min-w-[80px]">Ano CAIP</TableHead>
                <TableHead className="min-w-[100px]">Nota Adequação</TableHead>
                <TableHead className="min-w-[100px]">Nota Manutenção</TableHead>
                <TableHead className="min-w-[90px]">Nota Total</TableHead>
                <TableHead className="min-w-[100px]">RVR</TableHead>
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {item.nome_da_unidade || 'Nome não informado'}
                  </TableCell>
                  <TableCell>{item.unidade_gestora || 'N/A'}</TableCell>
                  <TableCell>{item.tipo_de_unidade || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.ano_caip || 'Sem ano'}
                    </Badge>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum registro encontrado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};