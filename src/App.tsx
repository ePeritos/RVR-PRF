
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from './pages/Dashboard';
import RVR from './pages/RVR';
import CAIP from './pages/CAIP';
import Relatorios from './pages/Relatorios';
import RelatorioPreview from './pages/RelatorioPreview';
import ImageMigration from './pages/ImageMigration';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import { Header } from './components/Header';
import { AppSidebar } from './components/AppSidebar';
import { SidebarProvider } from './components/ui/sidebar';
import { useAuth, AuthProvider } from './hooks/useAuth';

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rvr" element={<RVR />} />
              <Route path="/caip" element={<CAIP />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/relatorio-preview" element={<RelatorioPreview />} />
              <Route path="/image-migration" element={<ImageMigration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
