import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  role: 'admin' | 'usuario_padrao';
  unidade_gestora?: string;
  cargo?: string;
  matricula?: string;
  telefone?: string;
  unidade_lotacao?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (data) {
          setProfile(data);
          // Verificar se o perfil precisa ser configurado (usuário padrão sem unidade gestora)
          if (data.role === 'usuario_padrao' && !data.unidade_gestora) {
            setNeedsSetup(true);
          }
        } else {
          // Perfil não existe, precisa ser criado
          setNeedsSetup(true);
        }
      } catch (err) {
        console.error('Erro ao buscar perfil do usuário:', err);
        setError('Erro ao carregar perfil do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const isAdmin = profile?.role === 'admin';

  const refetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (data) {
        setProfile(data);
        setNeedsSetup(false);
      }
    } catch (err) {
      console.error('Erro ao recarregar perfil:', err);
    }
  };

  return {
    profile,
    loading,
    error,
    isAdmin,
    needsSetup,
    refetchProfile
  };
};