
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileSetupDialog } from "@/components/ProfileSetupDialog";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { useUserProfile } from "@/hooks/useUserProfile";
import Dashboard from "./pages/Dashboard";
import RVR from "./pages/RVR";
import CAIP from "./pages/CAIP";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading: authLoading, session } = useAuth();
    const { needsSetup, refetchProfile } = useUserProfile();
    
    console.log('🔐 ProtectedRoute - Estado atual:', { 
      userId: user?.id, 
      userEmail: user?.email,
      authLoading, 
      hasSession: !!session,
      needsSetup
    });
    
    // Estado de loading da autenticação
    if (authLoading) {
      console.log('⏳ ProtectedRoute - Aguardando autenticação...');
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Autenticando...</p>
          </div>
        </div>
      );
    }
    
    // Sem usuário autenticado
    if (!user || !session) {
      console.log('❌ ProtectedRoute - Sem usuário, redirecionando para /auth');
      return <Navigate to="/auth" replace />;
    }

    console.log('✅ ProtectedRoute - Usuário autenticado, renderizando dashboard');
    
    // Renderizar layout protegido
    return (
      <>
        <ProfileSetupDialog 
          open={needsSetup} 
          onComplete={refetchProfile}
        />
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="border-b border-border bg-background/95 backdrop-blur">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="mr-2 lg:hidden" />
                    <img 
                      src="/lovable-uploads/40767838-14cb-481f-9df0-efaa941d75a0.png" 
                      alt="SIGI-PRF Logo" 
                      className="h-5 w-auto dark:invert lg:hidden"
                    />
                    <span className="font-bold text-lg lg:hidden">SIGI-PRF</span>
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                {children}
              </main>
              <ProgressIndicator show={authLoading} message="Carregando dados..." />
            </div>
          </div>
        </SidebarProvider>
      </>
    );
  };

  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    
    console.log('🌐 PublicRoute - Estado:', { hasUser: !!user, loading });
    
    if (loading) {
      console.log('⏳ PublicRoute - Verificando estado de autenticação...');
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Verificando login...</p>
          </div>
        </div>
      );
    }
    
    if (user) {
      console.log('✅ PublicRoute - Usuário logado, redirecionando para dashboard');
      return <Navigate to="/" replace />;
    }
    
    console.log('🔓 PublicRoute - Mostrando página de login');
    return <>{children}</>;
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/rvr" 
        element={
          <ProtectedRoute>
            <RVR />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/caip" 
        element={
          <ProtectedRoute>
            <CAIP />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
