import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SimpleSelect } from '@/components/ui/simple-select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';

interface ProfileSetupDialogProps {
  open: boolean;
  onComplete: () => void;
}

interface ProfileData {
  nome_completo: string;
  cargo: string;
  matricula: string;
  unidade_gestora: string;
  telefone: string;
  formacao: string;
}

export const ProfileSetupDialog: React.FC<ProfileSetupDialogProps> = ({ open, onComplete }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    nome_completo: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    cargo: '',
    matricula: '',
    unidade_gestora: '',
    telefone: '',
    formacao: ''
  });
  const [loading, setLoading] = useState(false);
  
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.unidade_gestora) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione uma Unidade Gestora.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          nome_completo: profile.nome_completo,
          cargo: profile.cargo,
          matricula: profile.matricula,
          unidade_gestora: profile.unidade_gestora,
          telefone: profile.telefone,
          formacao: profile.formacao,
          email: user?.email,
          role: 'usuario_padrao' as any
        });

      if (error) throw error;

      toast({
        title: "Perfil configurado",
        description: "Suas informações foram salvas com sucesso. Bem-vindo ao SIGI-PRF!",
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Erro ao salvar perfil inicial:', error);
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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md mx-2 [&>button]:hidden">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Bem-vindo ao SIGI-PRF!</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Para começar, precisamos de algumas informações básicas sobre você.
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
            <SimpleSelect
              options={unidadesGestoras}
              value={profile.unidade_gestora}
              onChange={(value) => {
                console.log('Selecionando unidade gestora:', value);
                setProfile(prev => ({ ...prev, unidade_gestora: value }));
              }}
              placeholder="Selecione sua unidade gestora"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input
              id="cargo"
              value={profile.cargo}
              onChange={(e) => setProfile(prev => ({ ...prev, cargo: e.target.value }))}
              placeholder="Ex: Engenheiro Civil, Policial Rodoviário Federal"
            />
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
              disabled={loading || !profile.nome_completo || !profile.unidade_gestora} 
              className="w-full"
            >
              {loading ? "Salvando..." : "Finalizar Configuração"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};