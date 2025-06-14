import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { ExistingRecordsList } from '@/components/caip/ExistingRecordsList';
import { DataFilter } from '@/components/DataFilter';
import { CAIPFormDialog } from '@/components/caip/CAIPFormDialog';

type DadosCAIP = Tables<'dados_caip'>;

const CAIP = () => {
  const { toast } = useToast();
  const [existingData, setExistingData] = useState<DadosCAIP[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<DadosCAIP[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DadosCAIP | null>(null);

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('dados_caip')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setExistingData(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados existentes.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: DadosCAIP) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (item: DadosCAIP) => {
    try {
      const { error } = await supabase
        .from('dados_caip')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso.",
      });

      fetchExistingData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o registro.",
        variant: "destructive",
      });
    }
  };

  const handleNew = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchExistingData();
  };

  const handleFilterChange = (filters: any) => {
    let filtered = existingData;
    
    if (filters.anoCAIP) {
      filtered = filtered.filter(item => item.ano_caip === filters.anoCAIP);
    }
    
    if (filters.unidadeGestora) {
      filtered = filtered.filter(item => item.unidade_gestora === filters.unidadeGestora);
    }
    
    if (filters.tipoUnidade) {
      filtered = filtered.filter(item => item.tipo_de_unidade === filters.tipoUnidade);
    }
    
    if (filters.nomeUnidade) {
      filtered = filtered.filter(item => 
        item.nome_da_unidade && 
        item.nome_da_unidade.toLowerCase().includes(filters.nomeUnidade.toLowerCase())
      );
    }
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nome_da_unidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unidade_gestora?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.endereco?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  };

  // Initialize filtered data
  useEffect(() => {
    setFilteredData(existingData);
  }, [existingData]);

  return (
    <div className="p-6 space-y-6 w-full mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">CAIP - Cadastro de Imóveis</h1>
        </div>
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
          Gerenciamento de Imóveis CAIP
        </h2>
        <p className="text-sm text-muted-foreground">
          Cadastro de Avaliação de Imóveis para Programação - Gerencie os registros de imóveis da PRF
        </p>
      </div>

      <div className="space-y-4 w-full">
        <div className="w-full">
          <DataFilter onFilterChange={handleFilterChange} />
        </div>
        <div className="w-full">
          <ExistingRecordsList 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredData={filteredData}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </div>
      </div>

      <CAIPFormDialog
        editingItem={editingItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default CAIP;