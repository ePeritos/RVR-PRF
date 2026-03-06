import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardCheck, Plus, Search, Calendar, Building, User } from 'lucide-react';
import { VISTORIA_STATUS_LABELS } from '@/constants/vistoriaConstants';
import { VistoriaFormDialog } from '@/components/vistorias/VistoriaFormDialog';
import { VistoriaValidationDialog } from '@/components/vistorias/VistoriaValidationDialog';
import { format } from 'date-fns';

interface Vistoria {
  id: string;
  dados_caip_id: string;
  user_id: string;
  status: string;
  prazo_entrega: string;
  data_atribuicao: string;
  responsavel_tecnico: string | null;
  classificacao_geral: string | null;
  unidade_gestora: string;
  created_at: string;
  dados_caip?: { nome_da_unidade: string | null; endereco: string | null } | null;
  assigned_user?: { nome_completo: string } | null;
}

export default function Vistorias() {
  const { profile, isAdmin, isTerceirizado } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editingVistoria, setEditingVistoria] = useState<Vistoria | null>(null);
  const [validatingVistoria, setValidatingVistoria] = useState<Vistoria | null>(null);

  // Assignment form state
  const [assignForm, setAssignForm] = useState({
    dados_caip_id: '',
    user_id: '',
    prazo_entrega: '',
  });
  const [imoveisList, setImoveisList] = useState<{ id: string; nome_da_unidade: string | null }[]>([]);
  const [terceirizadosList, setTerceirizadosList] = useState<{ id: string; nome_completo: string }[]>([]);
  const [assigning, setAssigning] = useState(false);

  const fetchVistorias = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('vistorias_manutencao')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related data
      if (data && data.length > 0) {
        const caipIds = [...new Set(data.map(v => v.dados_caip_id))];
        const userIds = [...new Set(data.map(v => v.user_id))];

        const [caipRes, usersRes] = await Promise.all([
          supabase.from('dados_caip').select('id, nome_da_unidade, endereco').in('id', caipIds),
          supabase.from('profiles').select('id, nome_completo').in('id', userIds),
        ]);

        const caipMap = Object.fromEntries((caipRes.data || []).map(c => [c.id, c]));
        const usersMap = Object.fromEntries((usersRes.data || []).map(u => [u.id, u]));

        const enriched = data.map(v => ({
          ...v,
          dados_caip: caipMap[v.dados_caip_id] || null,
          assigned_user: usersMap[v.user_id] || null,
        }));
        setVistorias(enriched);
      } else {
        setVistorias([]);
      }
    } catch (error: any) {
      toast({ title: 'Erro ao carregar vistorias', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentData = async () => {
    const [caipRes, usersRes] = await Promise.all([
      supabase.from('dados_caip').select('id, nome_da_unidade').order('nome_da_unidade'),
      supabase.from('profiles').select('id, nome_completo').eq('role', 'terceirizado'),
    ]);
    setImoveisList(caipRes.data || []);
    setTerceirizadosList(usersRes.data || []);
  };

  useEffect(() => {
    fetchVistorias();
  }, []);

  const handleAssign = async () => {
    if (!assignForm.dados_caip_id || !assignForm.user_id || !assignForm.prazo_entrega || !user) return;
    
    try {
      setAssigning(true);
      const { error } = await supabase.from('vistorias_manutencao').insert({
        dados_caip_id: assignForm.dados_caip_id,
        user_id: assignForm.user_id,
        atribuido_por: user.id,
        unidade_gestora: profile?.unidade_lotacao || profile?.unidade_gestora || '',
        prazo_entrega: assignForm.prazo_entrega,
        status: 'pendente',
      } as any);

      if (error) throw error;

      toast({ title: 'Vistoria atribuída', description: 'Vistoria criada e atribuída com sucesso.' });
      setShowAssignDialog(false);
      setAssignForm({ dados_caip_id: '', user_id: '', prazo_entrega: '' });
      fetchVistorias();
    } catch (error: any) {
      toast({ title: 'Erro ao atribuir', description: error.message, variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenAssign = () => {
    fetchAssignmentData();
    setShowAssignDialog(true);
  };

  const isPrazoVencido = (prazo: string) => new Date(prazo) < new Date();

  const filteredVistorias = vistorias.filter(v => {
    const term = searchTerm.toLowerCase();
    return (
      v.dados_caip?.nome_da_unidade?.toLowerCase().includes(term) ||
      v.assigned_user?.nome_completo?.toLowerCase().includes(term) ||
      v.unidade_gestora?.toLowerCase().includes(term) ||
      v.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Vistorias de Manutenção
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isTerceirizado
              ? 'Suas vistorias atribuídas para preenchimento'
              : 'Gerencie e valide vistorias de manutenção predial'}
          </p>
        </div>
        {!isTerceirizado && (
          <Button onClick={handleOpenAssign} className="gap-2">
            <Plus className="h-4 w-4" />
            Atribuir Vistoria
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por unidade, responsável ou status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="outline" className="ml-auto">
          {filteredVistorias.length} vistoria(s)
        </Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredVistorias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Nenhuma vistoria encontrada</p>
            <p className="text-muted-foreground text-sm">
              {isTerceirizado
                ? 'Aguarde a atribuição de vistorias pelo servidor PRF.'
                : 'Clique em "Atribuir Vistoria" para criar uma nova.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVistorias.map((v) => {
            const statusInfo = VISTORIA_STATUS_LABELS[v.status] || VISTORIA_STATUS_LABELS.pendente;
            const vencido = isPrazoVencido(v.prazo_entrega) && !['validado', 'rejeitado'].includes(v.status);

            return (
              <Card key={v.id} className={`cursor-pointer hover:shadow-md transition-shadow ${vencido ? 'border-destructive/50' : ''}`}
                onClick={() => {
                  if (isTerceirizado) {
                    setEditingVistoria(v);
                  } else {
                    setValidatingVistoria(v);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{v.dados_caip?.nome_da_unidade || 'Imóvel sem nome'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {v.assigned_user?.nome_completo || 'Não atribuído'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Prazo: {format(new Date(v.prazo_entrega), 'dd/MM/yyyy')}
                        </span>
                        <span>{v.unidade_gestora}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {vencido && <Badge variant="destructive">Vencido</Badge>}
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog para atribuir vistoria */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Nova Vistoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Imóvel *</Label>
              <SimpleSelect
                options={imoveisList.map(i => i.nome_da_unidade || i.id)}
                value={imoveisList.find(i => i.id === assignForm.dados_caip_id)?.nome_da_unidade || ''}
                onChange={(v) => {
                  const imovel = imoveisList.find(i => i.nome_da_unidade === v);
                  if (imovel) setAssignForm(prev => ({ ...prev, dados_caip_id: imovel.id }));
                }}
                placeholder="Selecione o imóvel"
              />
            </div>
            <div className="space-y-2">
              <Label>Terceirizado *</Label>
              <SimpleSelect
                options={terceirizadosList.map(t => t.nome_completo)}
                value={terceirizadosList.find(t => t.id === assignForm.user_id)?.nome_completo || ''}
                onChange={(v) => {
                  const terc = terceirizadosList.find(t => t.nome_completo === v);
                  if (terc) setAssignForm(prev => ({ ...prev, user_id: terc.id }));
                }}
                placeholder="Selecione o terceirizado"
              />
            </div>
            <div className="space-y-2">
              <Label>Prazo de Entrega *</Label>
              <Input
                type="date"
                value={assignForm.prazo_entrega}
                onChange={(e) => setAssignForm(prev => ({ ...prev, prazo_entrega: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="pt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancelar</Button>
              <Button
                onClick={handleAssign}
                disabled={assigning || !assignForm.dados_caip_id || !assignForm.user_id || !assignForm.prazo_entrega}
              >
                {assigning ? 'Atribuindo...' : 'Atribuir'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form dialog para terceirizado preencher */}
      {editingVistoria && (
        <VistoriaFormDialog
          vistoria={editingVistoria}
          open={!!editingVistoria}
          onOpenChange={(open) => !open && setEditingVistoria(null)}
          onSuccess={() => { setEditingVistoria(null); fetchVistorias(); }}
        />
      )}

      {/* Validation dialog para servidor PRF */}
      {validatingVistoria && (
        <VistoriaValidationDialog
          vistoria={validatingVistoria}
          open={!!validatingVistoria}
          onOpenChange={(open) => !open && setValidatingVistoria(null)}
          onSuccess={() => { setValidatingVistoria(null); fetchVistorias(); }}
        />
      )}
    </div>
  );
}
