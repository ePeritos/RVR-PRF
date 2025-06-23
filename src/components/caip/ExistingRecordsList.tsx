
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Search, FileText, Calendar, MapPin, Building } from 'lucide-react';
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

  console.log('📋 === EXISTING RECORDS LIST ===');
  console.log('Dados filtrados recebidos:', filteredData);
  console.log('Total de registros:', filteredData?.length || 0);
  console.log('Search term:', searchTerm);

  // Debug específico para registros de Biguaçu
  const biguacuRecords = filteredData?.filter(item => 
    item.endereco?.toLowerCase().includes('biguaçu') || 
    item.endereco?.toLowerCase().includes('biguacu') ||
    item.nome_da_unidade?.toLowerCase().includes('biguaçu') ||
    item.nome_da_unidade?.toLowerCase().includes('biguacu')
  ) || [];
  console.log('🏢 Registros de Biguaçu na lista:', biguacuRecords);

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
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, endereço ou unidade gestora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {filteredData.length} registro{filteredData.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {filteredData.map((item) => {
          console.log('🔍 Renderizando item:', {
            id: item.id,
            nome: item.nome_da_unidade,
            endereco: item.endereco,
            ano_caip: item.ano_caip,
            unidade_gestora: item.unidade_gestora
          });
          
          return (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{item.nome_da_unidade || 'Nome não informado'}</h3>
                    {item.ano_caip && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.ano_caip}
                      </Badge>
                    )}
                  </div>
                  
                  {item.endereco && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{item.endereco}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span><strong>Unidade:</strong> {item.unidade_gestora || 'Não informado'}</span>
                    <span><strong>Tipo:</strong> {item.tipo_de_unidade || 'Não informado'}</span>
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
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateReport(item)}
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🖊️ Clique em editar para item:', item);
                      handleEdit(item);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o registro "{item.nome_da_unidade}"? 
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
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
