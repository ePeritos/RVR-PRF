import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type UserRole = 'admin' | 'usuario_padrao';

export interface Profile {
  id: string;
  nome_completo: string;
  email?: string;
  telefone?: string;
  matricula?: string;
  cargo?: string;
  unidade_lotacao?: string;
  responsavel_tecnico_id?: string;
  role: UserRole;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const isAdmin = profile?.role === 'admin';
  const isUsuarioPadrao = profile?.role === 'usuario_padrao';

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
    isAdmin,
    isUsuarioPadrao
  };
};