
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings } from 'lucide-react';

interface Profile {
  nome_completo: string;
  cargo: string;
  matricula: string;
  unidade_lotacao: string;
  telefone: string;
}

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    nome_completo: '',
    cargo: '',
    matricula: '',
    unidade_lotacao: '',
    telefone: ''
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [unidadesGestoras, setUnidadesGestoras] = useState<string[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUnidadesGestoras();
    }
  }, [user]);

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
          telefone: data.telefone || ''
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
    }
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
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-1" />
            {profile.nome_completo || user?.email}
          </Button>
        </DialogTrigger>
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
      
      <Button variant="ghost" size="sm" onClick={signOut}>
        Sair
      </Button>
    </div>
  );
};
