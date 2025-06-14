
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
    console.log('useAuth - Configurando listener de auth state...');
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('useAuth - Auth state changed:', event, 'Session exists:', !!session);
        console.log('useAuth - User from session:', session?.user?.email);
        
        // Limpar cache quando estado de auth muda
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('🗑️ Limpando cache devido a mudança de auth:', event);
          queryCache.clear();
        }
        
        // Evitar atualizações desnecessárias se o estado não mudou
        setSession(prevSession => {
          if (prevSession?.user?.id === session?.user?.id) {
            return prevSession;
          }
          return session;
        });
        
        setUser(prevUser => {
          if (prevUser?.id === session?.user?.id) {
            return prevUser;
          }
          return session?.user ?? null;
        });
        
        setLoading(false);
      }
    );

    // Check for existing session
    console.log('useAuth - Verificando sessão existente...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('useAuth - Sessão existente encontrada:', !!session);
      console.log('useAuth - User existente:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
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
