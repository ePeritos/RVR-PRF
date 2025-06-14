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
      setNeedsSetup(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('🔍 Buscando perfil para usuário:', user.id);
        setLoading(true);
        setError(null);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Usar maybeSingle ao invés de single

        if (profileError) {
          console.error('❌ Erro ao buscar perfil:', profileError);
          throw profileError;
        }

        if (data) {
          console.log('✅ Perfil encontrado:', data);
          setProfile(data);
          // Verificar se o perfil precisa ser configurado
          if (data.role === 'usuario_padrao' && !data.unidade_gestora && !data.unidade_lotacao) {
            console.log('🔧 Perfil precisa de configuração');
            setNeedsSetup(true);
          } else {
            setNeedsSetup(false);
          }
        } else {
          console.log('⚠️ Perfil não encontrado, precisa ser criado');
          setProfile(null);
          setNeedsSetup(true);
        }
      } catch (err) {
        console.error('💥 Erro ao buscar perfil do usuário:', err);
        setError('Erro ao carregar perfil do usuário');
        setNeedsSetup(true); // Em caso de erro, mostrar setup
      } finally {
        setLoading(false);
      }
    };

    // Usar setTimeout para evitar problemas de concorrência
    const timeoutId = setTimeout(() => {
      fetchProfile();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.id]); // Usar user.id ao invés de user completo

  const isAdmin = profile?.role === 'admin';

  const refetchProfile = async () => {
    if (!user) return;
    
    console.log('🔄 Refazendo busca do perfil...');
    try {
      setLoading(true);
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Erro ao recarregar perfil:', profileError);
        throw profileError;
      }

      if (data) {
        console.log('✅ Perfil recarregado:', data);
        setProfile(data);
        setNeedsSetup(false);
        setError(null);
      } else {
        console.log('⚠️ Perfil ainda não existe após recarga');
        setProfile(null);
        setNeedsSetup(true);
      }
    } catch (err) {
      console.error('💥 Erro ao recarregar perfil:', err);
      setError('Erro ao recarregar perfil');
    } finally {
      setLoading(false);
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