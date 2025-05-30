import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface Profile {
  nome_completo: string;
  cargo: string;
  matricula: string;
  unidade_lotacao: string;
  telefone: string;
  responsavel_tecnico_id?: string;
}

interface ResponsavelTecnico {
  id: string;
  nome_completo: string;
  formacao: string;
  conselho: string;
  numero_registro: string;
  uf: string;
}

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    nome_completo: '',
    cargo: '',
    matricula: '',
    unidade_lotacao: '',
    telefone: '',
    responsavel_tecnico_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [unidadesGestoras, setUnidadesGestoras] = useState<string[]>([]);
  const [responsaveisTecnicos, setResponsaveisTecnicos] = useState<ResponsavelTecnico[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [loadingResponsaveis, setLoadingResponsaveis] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUnidadesGestoras();
      fetchResponsaveisTecnicos();
    }
  }, [user]);

  const fetchResponsaveisTecnicos = async () => {
    try {
      setLoadingResponsaveis(true);
      const { data, error } = await supabase
        .from('responsaveis_tecnicos')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo');

      if (error) throw error;
      setResponsaveisTecnicos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar responsáveis técnicos:', error);
    } finally {
      setLoadingResponsaveis(false);
    }
  };

  const fetchUnidadesGestoras = async () => {
    try {
      setLoadingUnidades(true);
      const { data, error } = await supabase
        .from('dados_caip')
        .select('unidade_gestora')
        .not('unidade_gestora', 'is', null)
        .order('unidade_gestora');

      if (error) throw error;

      // Extrair valores únicos e filtrar vazios
      const unidadesUnicas = [...new Set(
        data
          .map(item => item.unidade_gestora)
          .filter(unidade => unidade && unidade.trim() !== '')
      )].sort();

      setUnidadesGestoras(unidadesUnicas);
    } catch (error: any) {
      console.error('Erro ao carregar unidades gestoras:', error);
    } finally {
      setLoadingUnidades(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (data) {
        setProfile({
          nome_completo: data.nome_completo || '',
          cargo: data.cargo || '',
          matricula: data.matricula || '',
          unidade_lotacao: data.unidade_lotacao || '',
          telefone: data.telefone || '',
          responsavel_tecnico_id: data.responsavel_tecnico_id || ''
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleEditProfile = () => {
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profile,
          email: user?.email
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      setOpen(false);
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline-block">
              {profile.nome_completo || user?.email}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{profile.nome_completo || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleEditProfile}>
            <Settings className="h-4 w-4 mr-2" />
            Editar Perfil
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                value={profile.nome_completo}
                onChange={(e) => setProfile(prev => ({ ...prev, nome_completo: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={profile.cargo}
                onChange={(e) => setProfile(prev => ({ ...prev, cargo: e.target.value }))}
                placeholder="Ex: Engenheiro Civil"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={profile.matricula}
                onChange={(e) => setProfile(prev => ({ ...prev, matricula: e.target.value }))}
                placeholder="Ex: CREA/XX 123456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade_lotacao">Unidade de Lotação</Label>
              <Select
                value={profile.unidade_lotacao}
                onValueChange={(value) => setProfile(prev => ({ ...prev, unidade_lotacao: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingUnidades ? "Carregando..." : "Selecione uma unidade"} />
                </SelectTrigger>
                <SelectContent>
                  {unidadesGestoras.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel_tecnico_id">Responsável Técnico (Opcional)</Label>
              <Select
                value={profile.responsavel_tecnico_id}
                onValueChange={(value) => setProfile(prev => ({ ...prev, responsavel_tecnico_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingResponsaveis ? "Carregando..." : "Selecione um responsável técnico"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum (usar dados do perfil)</SelectItem>
                  {responsaveisTecnicos.map((responsavel) => (
                    <SelectItem key={responsavel.id} value={responsavel.id}>
                      {responsavel.nome_completo} - {responsavel.conselho}/{responsavel.uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={profile.telefone}
                onChange={(e) => setProfile(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="Ex: (11) 99999-9999"
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
    </>
  );
};
