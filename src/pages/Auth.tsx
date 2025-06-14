import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TermsAcceptanceDialog } from '@/components/TermsAcceptanceDialog';
import { Building } from 'lucide-react';

const TERMS_STORAGE_KEY = 'sigi-prf-terms-accepted';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se os termos já foram aceitos
  useEffect(() => {
    const savedTermsAcceptance = localStorage.getItem(TERMS_STORAGE_KEY);
    if (savedTermsAcceptance === 'true') {
      setTermsAccepted(true);
      setShowTermsDialog(false);
    }
  }, []);

  // Verificar se o usuário já está logado e redirecionar
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('👤 Usuário já logado, redirecionando para dashboard');
        navigate('/', { replace: true });
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast({
        title: "Aceite os termos",
        description: "É necessário aceitar os termos de uso e política de privacidade para continuar.",
        variant: "destructive"
      });
      return;
    }

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      console.log(`🚀 Tentando ${isSignUp ? 'cadastro' : 'login'} com email...`);

      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });
      }

      const { data, error } = result;

      if (error) {
        console.error('❌ Erro na autenticação:', error);
        throw error;
      }

      if (isSignUp && !data.session) {
        toast({
          title: "Verifique seu email",
          description: "Um link de confirmação foi enviado para seu email.",
        });
      } else if (data.session) {
        console.log('✅ Autenticação bem-sucedida');
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        // Redirecionar para o dashboard
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }

    } catch (error: any) {
      console.error('❌ Erro na autenticação:', error);
      
      let errorMessage = "Erro desconhecido. Tente novamente.";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirme seu email antes de fazer login.';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Usuário já cadastrado. Tente fazer login.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: isSignUp ? "Erro no cadastro" : "Erro no login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setShowTermsDialog(false);
    localStorage.setItem(TERMS_STORAGE_KEY, 'true');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Theme toggle button in top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle showText={false} />
      </div>

      <Card className="w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300 animate-scale-in">
        <CardHeader className="text-center px-6 md:px-16">
          <div className="flex flex-col items-center justify-center mb-4 space-y-3">
            <Building className="h-8 md:h-12 w-8 md:w-12" />
            <CardTitle className="text-xl md:text-2xl font-bold">SIGI-PRF</CardTitle>
          </div>
          <CardDescription className="text-sm md:text-base">
            {isSignUp ? 'Criar conta no' : 'Faça login para acessar o'} Sistema de Gestão de Imóveis da PRF
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 md:px-16">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading || !termsAccepted}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                disabled={loading || !termsAccepted}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !termsAccepted}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Processando..." : (isSignUp ? "Criar Conta" : "Entrar")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
              disabled={loading}
            >
              {isSignUp ? 'Já tem conta? Fazer login' : 'Não tem conta? Criar conta'}
            </button>
          </div>

          {!termsAccepted && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Aceite os termos de uso e política de privacidade para continuar
            </p>
          )}
        </CardContent>
      </Card>

      <TermsAcceptanceDialog 
        open={showTermsDialog && !termsAccepted} 
        onAccept={handleTermsAccept} 
      />
    </div>
  );
};

export default Auth;