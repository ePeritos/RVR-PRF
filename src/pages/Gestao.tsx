import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/admin/UserManagement";
import { Settings, Users, ShieldCheck } from "lucide-react";

const Gestao = () => {
  const { profile, loading, isAdmin } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gestão do Sistema</h1>
          <p className="text-sm text-muted-foreground">
            Painel administrativo para gerenciamento do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="flex items-center gap-2" disabled>
            <ShieldCheck className="h-4 w-4" />
            Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Controle de Perfis de Usuários
              </CardTitle>
              <CardDescription>
                Visualize e edite os perfis dos usuários do sistema. Altere unidade gestora, perfil de acesso e informações cadastrais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Gestao;
