
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
import { useUserProfile } from "@/hooks/useUserProfile";
import Dashboard from "./pages/Dashboard";
import RVR from "./pages/RVR";
import CAIP from "./pages/CAIP";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente interno que contém as rotas e usa o contexto de auth
const AppRoutes = () => {
  const { user, loading } = useAuth();
  const { needsSetup, refetchProfile } = useUserProfile();
  
  console.log('🔍 AppRoutes - user:', user?.email, 'loading:', loading);
  console.log('🔍 AppRoutes - needsSetup:', needsSetup);
  
  if (loading) {
    console.log('⏳ AppRoutes - Carregando estado de auth...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, mostrar apenas a página de auth
  if (!user) {
    console.log('🔒 AppRoutes - Usuário não autenticado, redirecionando para auth');
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Se há usuário, mostrar as rotas protegidas
  console.log('✅ AppRoutes - Usuário autenticado, mostrando rotas protegidas');
  
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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/rvr" element={<RVR />} />
                <Route path="/caip" element={<CAIP />} />
                <Route path="/auth" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
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
