
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import RVR from "./pages/RVR";
import CAIP from "./pages/CAIP";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, session } = useAuth();
  
  console.log('ProtectedRoute - user:', user?.id, 'loading:', loading, 'session:', !!session);
  console.log('ProtectedRoute - user details:', user?.email);
  
  if (loading) {
    console.log('ProtectedRoute - Ainda carregando...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('ProtectedRoute - Redirecionando para /auth - usuário não encontrado');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute - Usuário autenticado, renderizando com sidebar');
  console.log('ProtectedRoute - Renderizando children:', children);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-background px-4 flex-shrink-0">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-4">
              <div style={{ border: '2px solid red', padding: '10px', margin: '10px', backgroundColor: '#ffe6e6' }}>
                <p style={{ color: 'red', fontWeight: 'bold' }}>🔍 DEBUG: ProtectedRoute renderizando children</p>
                <p style={{ color: 'blue' }}>User: {user?.email}</p>
                <p style={{ color: 'green' }}>Children type: {typeof children}</p>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  console.log('PublicRoute - user:', user, 'loading:', loading);
  
  if (loading) {
    console.log('PublicRoute - Ainda carregando auth state...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    console.log('PublicRoute - Usuário encontrado, redirecionando para dashboard');
    return <Navigate to="/" replace />;
  }
  
  console.log('PublicRoute - Nenhum usuário, mostrando página de auth');
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
