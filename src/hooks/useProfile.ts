
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  nome_completo: string;
  cargo: string;
  matricula: string;
  unidade_lotacao: string;
  telefone: string;
  responsavel_tecnico_id?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    nome_completo: '',
    cargo: '',
    matricula: '',
    unidade_lotacao: '',
    telefone: '',
    responsavel_tecnico_id: ''
  });
  const [loading, setLoading] = useState(false);
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

  const saveProfile = async (profileData: Profile): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profileData,
          email: user?.email
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      setProfile(profileData);
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    setProfile,
    loading,
    saveProfile
  };
};
