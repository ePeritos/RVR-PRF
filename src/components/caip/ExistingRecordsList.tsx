import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

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
  return (
    <Card className="bg-card border-border">
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
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredData.map((item) => (
            <Card key={item.id} className="p-4 hover:bg-muted/50 cursor-pointer" onClick={() => handleEdit(item)}>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{item.nome_da_unidade || 'Nome não informado'}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Unidade Gestora:</strong> {item.unidade_gestora || 'N/A'}</p>
                    <p><strong>Tipo:</strong> {item.tipo_de_unidade || 'N/A'}</p>
                    <p><strong>Endereço:</strong> {item.endereco || 'N/A'}</p>
                    <p><strong>Área Construída:</strong> {item.area_construida_m2 ? `${item.area_construida_m2} m²` : 'N/A'}</p>
                    <p><strong>RVR:</strong> {item.rvr ? `R$ ${Number(item.rvr).toLocaleString('pt-BR')}` : 'N/A'}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {item.ano_caip || 'Sem ano'}
                </Badge>
              </div>
            </Card>
          ))}
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