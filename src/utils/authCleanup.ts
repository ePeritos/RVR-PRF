import { supabase } from '@/integrations/supabase/client';

export const cleanupAuthState = () => {
  console.log('🧹 Limpando estado de autenticação...');
  
  // Remove todos os tokens de autenticação do localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
      console.log(`Removido: ${key}`);
    }
  });
  
  // Remove do sessionStorage se estiver em uso
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
        console.log(`Removido do sessionStorage: ${key}`);
      }
    });
  }
  
  console.log('✅ Estado de autenticação limpo');
};

export const forceSignOut = async () => {
  console.log('🚪 Forçando logout...');
  
  try {
    // Limpa primeiro
    cleanupAuthState();
    
    // Tenta logout global
    await supabase.auth.signOut({ scope: 'global' });
    console.log('✅ Logout global realizado');
  } catch (error) {
    console.log('⚠️ Erro no logout, mas continuando:', error);
  }
  
  // Força refresh da página para estado limpo
  window.location.href = '/auth';
};

export const handleAuthError = (error: any) => {
  console.error('❌ Erro de autenticação:', error);
  
  if (error?.message?.includes('Invalid login credentials') || 
      error?.message?.includes('User not found') ||
      error?.message?.includes('Invalid email or password')) {
    return 'Email ou senha incorretos. Verifique suas credenciais.';
  }
  
  if (error?.message?.includes('Email not confirmed')) {
    return 'Por favor, confirme seu email antes de fazer login.';
  }
  
  if (error?.message?.includes('Too many requests')) {
    return 'Muitas tentativas de login. Aguarde alguns minutos.';
  }
  
  if (error?.message?.includes('signup is disabled')) {
    return 'Cadastro desabilitado. Entre em contato com o administrador.';
  }
  
  return error?.message || 'Erro desconhecido. Tente novamente.';
};