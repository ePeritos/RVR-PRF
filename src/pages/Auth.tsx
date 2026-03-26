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
import { Building, Eye, EyeOff, KeyRound } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const TERMS_STORAGE_KEY = 'sigi-prf-terms-accepted';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const savedTerms = localStorage.getItem(TERMS_STORAGE_KEY) === 'true';
  const [showTermsDialog, setShowTermsDialog] = useState(!savedTerms);
  const [termsAccepted, setTermsAccepted] = useState(savedTerms);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se o usuário já está logado e redirecionar
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
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

      if (error) throw error;

      if (isSignUp && !data.session) {
        toast({
          title: "Verifique seu email",
          description: "Um link de confirmação foi enviado para seu email.",
        });
      } else if (data.session) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }

    } catch (error: any) {
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setRecoveryEmail(email);
      setIsOtpStep(true);
      toast({
        title: "Código enviado!",
        description: "Verifique seu email e insira o código de 6 dígitos abaixo.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      toast({
        title: "Código incompleto",
        description: "Insira o código de 6 dígitos recebido por email.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas são diferentes.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Verificar o OTP de recuperação
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: recoveryEmail,
        token: otpCode,
        type: 'recovery',
      });

      if (verifyError) throw verifyError;

      // Atualizar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Senha alterada com sucesso!",
        description: "Redirecionando para o sistema...",
      });

      // Resetar estados
      setIsOtpStep(false);
      setIsForgotPassword(false);
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');

      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (error: any) {
      let errorMessage = error.message || "Erro ao redefinir a senha.";
      if (error.message?.includes('Token has expired or is invalid')) {
        errorMessage = 'Código expirado ou inválido. Solicite um novo código.';
      }
      toast({
        title: "Erro na recuperação",
        description: errorMessage,
        variant: "destructive",
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

  const resetForgotPassword = () => {
    setIsForgotPassword(false);
    setIsOtpStep(false);
    setOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setRecoveryEmail('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle showText={false} />
      </div>

      <Card className="w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300 animate-scale-in">
        <CardHeader className="text-center px-6 md:px-16">
          <div className="flex flex-col items-center justify-center mb-4 space-y-3">
            {isOtpStep ? (
              <KeyRound className="h-8 md:h-12 w-8 md:w-12 text-primary" />
            ) : (
              <Building className="h-8 md:h-12 w-8 md:w-12" />
            )}
            <CardTitle className="text-xl md:text-2xl font-bold">
              {isOtpStep ? 'Redefinir Senha' : 'SIGI-PRF'}
            </CardTitle>
          </div>
          <CardDescription className="text-sm md:text-base">
            {isOtpStep
              ? `Insira o código de 6 dígitos enviado para ${recoveryEmail}`
              : isForgotPassword 
                ? 'Informe seu email para recuperar a senha' 
                : isSignUp 
                  ? 'Criar conta no' 
                  : 'Faça login para acessar o'} {!isForgotPassword && !isOtpStep && 'Sistema de Gestão de Imóveis da PRF'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 md:px-16">
          {isOtpStep ? (
            <form onSubmit={handleOtpVerifyAndReset} className="space-y-4">
              <div className="space-y-2">
                <Label>Código de Verificação</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => setOtpCode(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmar Senha</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  disabled={loading}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Verificando..." : "Redefinir Senha"}
              </Button>

              <div className="flex flex-col items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpStep(false);
                    handleForgotPassword(new Event('submit') as any);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                  disabled={loading}
                >
                  Reenviar código
                </button>
                <button
                  type="button"
                  onClick={resetForgotPassword}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          ) : isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={loading}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Enviando..." : "Enviar Código de Recuperação"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={resetForgotPassword}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          ) : (
            <>
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
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      disabled={loading || !termsAccepted}
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

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
            </>
          )}

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