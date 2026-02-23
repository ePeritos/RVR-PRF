
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Search, FileText, Calendar, MapPin, Building, Ruler } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useCAIPReport } from '@/hooks/useCAIPReport';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

type DadosCAIP = Tables<'dados_caip'>;

interface ExistingRecordsListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredData: DadosCAIP[];
  handleEdit: (item: DadosCAIP) => void;
  handleDelete: (item: DadosCAIP) => void;
}

export const ExistingRecordsList = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredData, 
  handleEdit, 
  handleDelete 
}: ExistingRecordsListProps) => {
  const { generateReport, isGenerating } = useCAIPReport();

  const handleGenerateReport = async (item: DadosCAIP) => {
    try {
      await generateReport(item);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  if (!filteredData || filteredData.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhum registro corresponde aos critérios de busca.' : 'Comece criando seu primeiro registro CAIP.'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="whitespace-nowrap self-start sm:self-auto w-fit">
          {filteredData.length} registro{filteredData.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {filteredData.map((item) => (
          <Card key={item.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-base sm:text-lg break-words">{item.nome_da_unidade || 'Nome não informado'}</h3>
                  {item.ano_caip && (
                    <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {item.ano_caip}
                    </Badge>
                  )}
                  {item.area_construida_m2 != null && Number(item.area_construida_m2) > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                      <Ruler className="h-3 w-3" />
                      {Number(item.area_construida_m2).toLocaleString('pt-BR')} m²
                    </Badge>
                  )}
                </div>
                
                {item.endereco && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="break-words">{item.endereco}</span>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 text-sm">
                  <span className="truncate"><strong>Unidade:</strong> {item.unidade_gestora || 'N/I'}</span>
                  <span className="truncate"><strong>Tipo:</strong> {item.tipo_de_unidade || 'N/I'}</span>
                </div>
                
                {item.nota_global && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Nota Global:</span>
                    <Badge variant={Number(item.nota_global) >= 70 ? "default" : "destructive"}>
                      {Number(item.nota_global).toFixed(1)}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateReport(item)}
                  disabled={isGenerating}
                  className="flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-destructive text-white hover:bg-destructive/90 hover:text-white border-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o registro "{item.nome_da_unidade}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
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
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
