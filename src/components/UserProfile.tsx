
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SimpleSelect } from '@/components/ui/simple-select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings } from 'lucide-react';

interface Profile {
  nome_completo: string;
  matricula: string;
  unidade_gestora: string;
  telefone: string;
  formacao: string;
}

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    nome_completo: '',
    matricula: '',
    unidade_gestora: '',
    telefone: '',
    formacao: ''
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const unidadesGestoras = [
    'SEDE NACIONAL/DF',
    'UNIPRF/DF',
    'SPRF/AC',
    'SPRF/AL',
    'SPRF/AM',
    'SPRF/AP',
    'SPRF/BA',
    'SPRF/CE',
    'SPRF/DF',
    'SPRF/ES',
    'SPRF/GO',
    'SPRF/MA',
    'SPRF/MG',
    'SPRF/MS',
    'SPRF/MT',
    'SPRF/PA',
    'SPRF/PB',
    'SPRF/PE',
    'SPRF/PI',
    'SPRF/PR',
    'SPRF/RJ',
    'SPRF/RN',
    'SPRF/RO',
    'SPRF/RR',
    'SPRF/RS',
    'SPRF/SC',
    'SPRF/SE',
    'SPRF/SP',
    'SPRF/TO'
  ];
  
  const opcoesFormacao = [
    'Arquitetura',
    'Engenharia Civil',
    'Engenharia Elétrica',
    'Engenharia Mecânica',
    'Outra'
  ];
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

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
          matricula: data.matricula || '',
          unidade_gestora: data.unidade_lotacao || '', // mapear unidade_lotacao para unidade_gestora
          telefone: data.telefone || '',
          formacao: data.formacao || ''
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
      // Mapear os campos do formulário para o formato do perfil
      const profileUpdate = {
        nome_completo: profile.nome_completo,
        matricula: profile.matricula,
        unidade_lotacao: profile.unidade_gestora, // mapear unidade_gestora para unidade_lotacao
        telefone: profile.telefone,
        formacao: profile.formacao
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profileUpdate,
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
    <div className="flex items-center gap-1 sm:gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
            <User className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline truncate max-w-24 lg:max-w-none">
              {profile.nome_completo || user?.email}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md mx-2">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Editar Perfil</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Atualize suas informações pessoais. A unidade gestora não pode ser alterada.
            </p>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                value={profile.nome_completo}
                onChange={(e) => setProfile(prev => ({ ...prev, nome_completo: e.target.value }))}
                required
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade_gestora">Unidade Gestora *</Label>
              <Input
                id="unidade_gestora"
                value={profile.unidade_gestora}
                disabled
                className="bg-muted text-muted-foreground cursor-not-allowed"
                placeholder="Unidade gestora não pode ser alterada"
              />
              <p className="text-xs text-muted-foreground">
                A unidade gestora não pode ser alterada após o primeiro acesso.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={profile.matricula}
                onChange={(e) => setProfile(prev => ({ ...prev, matricula: e.target.value }))}
                placeholder="Sua matrícula funcional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formacao">Formação</Label>
              <SimpleSelect
                options={opcoesFormacao}
                value={profile.formacao}
                onChange={(value) => setProfile(prev => ({ ...prev, formacao: value }))}
                placeholder="Selecione sua formação"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={profile.telefone}
                onChange={(e) => setProfile(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading || !profile.nome_completo} 
                className="w-full"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <Button variant="ghost" size="sm" onClick={signOut} className="text-xs sm:text-sm px-2 sm:px-3">
        <span className="hidden sm:inline">Sair</span>
        <span className="sm:hidden">X</span>
      </Button>
    </div>
  );
};
