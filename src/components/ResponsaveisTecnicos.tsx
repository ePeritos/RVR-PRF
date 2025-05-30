
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface ResponsavelTecnico {
  id: string;
  nome_completo: string;
  formacao: string;
  conselho: string;
  numero_registro: string;
  uf: string;
  ativo: boolean;
}

export const ResponsaveisTecnicos = () => {
  const [responsaveis, setResponsaveis] = useState<ResponsavelTecnico[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome_completo: '',
    formacao: '',
    conselho: '',
    numero_registro: '',
    uf: ''
  });
  const { toast } = useToast();

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const formacoes = [
    'Engenharia Civil',
    'Arquitetura e Urbanismo',
    'Engenharia de Avaliações'
  ];

  useEffect(() => {
    fetchResponsaveis();
  }, []);

  const fetchResponsaveis = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('responsaveis_tecnicos')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo');

      if (error) throw error;
      setResponsaveis(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingId) {
        const { error } = await supabase
          .from('responsaveis_tecnicos')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast({
          title: "Responsável atualizado",
          description: "Dados salvos com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('responsaveis_tecnicos')
          .insert(formData);
        
        if (error) throw error;
        
        toast({
          title: "Responsável cadastrado",
          description: "Novo responsável técnico adicionado.",
        });
      }
      
      resetForm();
      setOpen(false);
      fetchResponsaveis();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (responsavel: ResponsavelTecnico) => {
    setFormData({
      nome_completo: responsavel.nome_completo,
      formacao: responsavel.formacao,
      conselho: responsavel.conselho,
      numero_registro: responsavel.numero_registro,
      uf: responsavel.uf
    });
    setEditingId(responsavel.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('responsaveis_tecnicos')
        .update({ ativo: false })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Responsável removido",
        description: "Responsável técnico foi desativado.",
      });
      
      fetchResponsaveis();
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      formacao: '',
      conselho: '',
      numero_registro: '',
      uf: ''
    });
    setEditingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Responsáveis Técnicos
          </CardTitle>
          <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Novo Responsável
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar' : 'Novo'} Responsável Técnico
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo</Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formacao">Formação</Label>
                  <Select
                    value={formData.formacao}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, formacao: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a formação" />
                    </SelectTrigger>
                    <SelectContent>
                      {formacoes.map((formacao) => (
                        <SelectItem key={formacao} value={formacao}>
                          {formacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conselho">Conselho</Label>
                    <Select
                      value={formData.conselho}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, conselho: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="CREA/CAU" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREA">CREA</SelectItem>
                        <SelectItem value="CAU">CAU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Select
                      value={formData.uf}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, uf: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {ufs.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_registro">Número do Registro</Label>
                  <Input
                    id="numero_registro"
                    value={formData.numero_registro}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero_registro: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : responsaveis.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum responsável técnico cadastrado
          </div>
        ) : (
          <div className="space-y-2">
            {responsaveis.map((responsavel) => (
              <div key={responsavel.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{responsavel.nome_completo}</div>
                  <div className="text-sm text-muted-foreground">
                    {responsavel.formacao} • {responsavel.conselho}/{responsavel.uf} {responsavel.numero_registro}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(responsavel)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(responsavel.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
