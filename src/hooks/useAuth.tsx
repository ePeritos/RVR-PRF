
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
    console.log('🚀 useAuth - Inicializando...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth event: ${event}`, 'Session exists:', !!session);
        console.log('👤 User email:', session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Se usuário logou com sucesso, redirecionar para dashboard
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Login bem-sucedido, redirecionando...');
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      }
    );

    // THEN check for existing session
    console.log('🔍 Verificando sessão existente...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Sessão existente:', !!session);
      if (session?.user) {
        console.log('👤 Usuário já logado:', session.user.email);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
