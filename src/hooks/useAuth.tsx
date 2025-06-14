
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { queryCache } from '@/utils/performanceUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 useAuth - Inicializando configuração de auth...');
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          console.log('⚠️ useAuth - Componente não montado, ignorando evento');
          return;
        }
        
        console.log('🔄 useAuth - Auth state changed:', event, 'Session exists:', !!session);
        console.log('📧 useAuth - User email:', session?.user?.email);
        
        // Limpar cache quando estado de auth muda
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('🗑️ useAuth - Limpando cache devido a mudança de auth:', event);
          queryCache.clear();
        }
        
        // Log detalhado para eventos específicos
        if (event === 'SIGNED_IN') {
          console.log('✅ useAuth - Login bem-sucedido!', {
            userId: session?.user?.id,
            email: session?.user?.email,
            metadata: session?.user?.user_metadata
          });
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 useAuth - Logout realizado');
        }
        
        // Evitar atualizações desnecessárias
        setSession(prevSession => {
          if (prevSession?.user?.id === session?.user?.id) {
            console.log('⚡ useAuth - Session não mudou, mantendo estado atual');
            return prevSession;
          }
          console.log('🔄 useAuth - Atualizando session state');
          return session;
        });
        
        setUser(prevUser => {
          if (prevUser?.id === session?.user?.id) {
            console.log('⚡ useAuth - User não mudou, mantendo estado atual');
            return prevUser;
          }
          console.log('🔄 useAuth - Atualizando user state');
          return session?.user ?? null;
        });
        
        setLoading(false);
        console.log('⏸️ useAuth - Loading finalizado');
      }
    );

    // Check for existing session
    console.log('🔍 useAuth - Verificando sessão existente...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('📋 useAuth - Sessão existente encontrada:', !!session);
      if (session) {
        console.log('👤 useAuth - Dados da sessão existente:', {
          userId: session.user?.id,
          email: session.user?.email
        });
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error('❌ useAuth - Erro ao verificar sessão existente:', error);
      setLoading(false);
    });

    return () => {
      console.log('🧹 useAuth - Cleanup executado');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('useAuth - Iniciando logout...');
    setLoading(true);
    
    try {
      // Limpar estado primeiro
      setUser(null);
      setSession(null);
      
      // Tentar logout global
      await supabase.auth.signOut({ scope: 'global' });
      console.log('useAuth - Logout realizado com sucesso');
    } catch (error) {
      console.error('useAuth - Erro no logout:', error);
    } finally {
      // Sempre redirecionar para auth, mesmo com erro
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
