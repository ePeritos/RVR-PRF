import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Database, Plus, Search, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type DadosCAIP = Tables<'dados_caip'>;

const CAIP = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [existingData, setExistingData] = useState<DadosCAIP[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DadosCAIP>();

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from('dados_caip')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (editingId) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('dados_caip')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Registro atualizado com sucesso.",
        });
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('dados_caip')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Novo registro criado com sucesso.",
        });
      }

      reset();
      setEditingId(null);
      fetchExistingData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: DadosCAIP) => {
    setEditingId(item.id);
    // Preencher o formulário com os dados existentes
    Object.keys(item).forEach(key => {
      setValue(key as keyof DadosCAIP, item[key as keyof DadosCAIP]);
    });
  };

  const handleNew = () => {
    reset();
    setEditingId(null);
  };

  const filteredData = existingData.filter(item =>
    item.nome_da_unidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unidade_gestora?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.endereco?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
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

      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form">
            {editingId ? 'Editar Registro' : 'Novo Registro'}
          </TabsTrigger>
          <TabsTrigger value="list">Registros Existentes</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingId ? 'Editar Registro CAIP' : 'Novo Registro CAIP'}
              </CardTitle>
              {editingId && (
                <Badge variant="outline">Editando ID: {editingId}</Badge>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="ano_caip">Ano CAIP</Label>
                    <Input {...register('ano_caip')} placeholder="2024" />
                  </div>
                  <div>
                    <Label htmlFor="tipo_de_unidade">Tipo de Unidade</Label>
                    <Input {...register('tipo_de_unidade')} placeholder="Ex: PRF" />
                  </div>
                  <div>
                    <Label htmlFor="unidade_gestora">Unidade Gestora</Label>
                    <Input {...register('unidade_gestora')} placeholder="Ex: SRPRF/DF" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome_da_unidade">Nome da Unidade *</Label>
                    <Input {...register('nome_da_unidade', { required: true })} />
                    {errors.nome_da_unidade && (
                      <p className="text-sm text-red-500 mt-1">Campo obrigatório</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="situacao_do_imovel">Situação do Imóvel</Label>
                    <Select onValueChange={(value) => setValue('situacao_do_imovel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar situação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROPRIO">Próprio</SelectItem>
                        <SelectItem value="ALUGADO">Alugado</SelectItem>
                        <SelectItem value="CEDIDO">Cedido</SelectItem>
                        <SelectItem value="COMODATO">Comodato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea {...register('endereco')} placeholder="Endereço completo do imóvel" />
                </div>

                {/* Áreas e Dados Técnicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="area_do_terreno_m2">Área do Terreno (m²)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...register('area_do_terreno_m2', { valueAsNumber: true })} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="area_construida_m2">Área Construída (m²)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...register('area_construida_m2', { valueAsNumber: true })} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="idade_aparente_do_imovel">Idade Aparente (anos)</Label>
                    <Input 
                      type="number"
                      {...register('idade_aparente_do_imovel', { valueAsNumber: true })} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="vida_util_estimada_anos">Vida Útil Estimada (anos)</Label>
                    <Input 
                      type="number"
                      {...register('vida_util_estimada_anos', { valueAsNumber: true })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estado_de_conservacao">Estado de Conservação</Label>
                    <Select onValueChange={(value) => setValue('estado_de_conservacao', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOVO">Novo (A)</SelectItem>
                        <SelectItem value="BOM">Bom (B)</SelectItem>
                        <SelectItem value="REGULAR">Regular (C)</SelectItem>
                        <SelectItem value="DETERIORADO">Deteriorado (D)</SelectItem>
                        <SelectItem value="RUIM">Ruim (E)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rvr">RVR (R$)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...register('rvr', { valueAsNumber: true })} 
                    />
                  </div>
                </div>

                {/* Identificadores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rip">RIP</Label>
                    <Input {...register('rip')} />
                  </div>
                  <div>
                    <Label htmlFor="matricula_do_imovel">Matrícula do Imóvel</Label>
                    <Input {...register('matricula_do_imovel')} />
                  </div>
                  <div>
                    <Label htmlFor="processo_sei">Processo SEI</Label>
                    <Input {...register('processo_sei')} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea {...register('observacoes')} placeholder="Observações gerais sobre o imóvel" />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={handleNew}>
                      Cancelar Edição
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CAIP;