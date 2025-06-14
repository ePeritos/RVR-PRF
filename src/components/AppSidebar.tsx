import { Home, Calculator, Database, LogOut, User, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleSelect } from "@/components/ui/simple-select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useEffect } from "react";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "CAIP", url: "/caip", icon: Database },
  { title: "RVR", url: "/rvr", icon: Calculator },
];

const unidadesGestoras = [
  'SEDE NACIONAL/DF',
  'UNIPRF/DF',
  'SPRF/AC',
  'SPRF/AL',
  'SPRF/AM',
  'SPRF/AP',
  'SPRF/BA',
  'SPRF/CE',
  'SPRF/DF',
  'SPRF/ES',
  'SPRF/GO',
  'SPRF/MA',
  'SPRF/MG',
  'SPRF/MS',
  'SPRF/MT',
  'SPRF/PA',
  'SPRF/PB',
  'SPRF/PE',
  'SPRF/PI',
  'SPRF/PR',
  'SPRF/RJ',
  'SPRF/RN',
  'SPRF/RO',
  'SPRF/RR',
  'SPRF/RS',
  'SPRF/SC',
  'SPRF/SE',
  'SPRF/SP',
  'SPRF/TO'
];

const opcoesFormacao = [
  'Arquitetura',
  'Engenharia Civil',
  'Engenharia Elétrica',
  'Engenharia Mecânica',
  'Outra'
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nome_completo: '',
    matricula: '',
    unidade_gestora: '',
    telefone: '',
    formacao: ''
  });
  const currentPath = location.pathname;

  console.log('AppSidebar - Current path:', currentPath, 'Sidebar state:', state);

  const isActive = (path: string) => currentPath === path;

  const handleProfileEdit = () => {
    if (profile) {
      setProfileForm({
        nome_completo: profile.nome_completo || '',
        matricula: profile.matricula || '',
        unidade_gestora: profile.unidade_lotacao || '', // usar unidade_lotacao como unidade_gestora
        telefone: profile.telefone || '',
        formacao: (profile as any).formacao || ''
      });
    }
    setIsProfileOpen(true);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mapear os campos do formulário para o formato do perfil
    const profileUpdate = {
      nome_completo: profileForm.nome_completo,
      matricula: profileForm.matricula,
      unidade_lotacao: profileForm.unidade_gestora, // mapear unidade_gestora para unidade_lotacao
      telefone: profileForm.telefone,
      formacao: profileForm.formacao
    };
    
    const success = await updateProfile(profileUpdate);
    if (success) {
      setIsProfileOpen(false);
    }
  };

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-48"}
      collapsible="icon"
      side="left"
      variant="inset"
    >
      <div className="p-2">
        <SidebarTrigger />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-2 px-2 py-1">
            <img 
              src="/lovable-uploads/0c984027-ab7d-4e16-96fe-f7d523613cc5.png" 
              alt="SIGI-PRF Logo" 
              className="h-6 w-auto"
            />
            {state !== "collapsed" && (
              <SidebarGroupLabel className="text-base font-bold">SIGI-PRF</SidebarGroupLabel>
            )}
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) =>
                        isActive 
                          ? "bg-muted text-primary font-medium flex items-center w-full px-3 py-2 rounded-md" 
                          : "hover:bg-muted/50 flex items-center w-full px-3 py-2 rounded-md"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Usuário</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Informações do usuário */}
              {state !== "collapsed" && (
                <SidebarMenuItem>
                  <div className="px-3 py-2 text-sm">
                    <div className="font-medium truncate">
                      {profile?.nome_completo || user?.email || 'Usuário'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                     {profile?.role === 'admin' ? 'ADMIN' : 'Usuário Padrão'}
                    </div>
                    {profile?.unidade_lotacao && (
                      <div className="text-xs text-muted-foreground truncate">
                        {profile.unidade_lotacao}
                      </div>
                    )}
                  </div>
                </SidebarMenuItem>
              )}


              {/* Botão editar perfil */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    onClick={handleProfileEdit}
                    className="w-full justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>Editar Perfil</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Botão logout */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    onClick={signOut}
                    className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>Sair</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Dialog para edição do perfil */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md mx-2">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Editar Perfil</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Atualize suas informações pessoais. {profile?.role !== 'admin' && 'A unidade gestora não pode ser alterada.'}
            </p>
          </DialogHeader>
          
          <form onSubmit={handleProfileSave} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                value={profileForm.nome_completo}
                onChange={(e) => setProfileForm(prev => ({ ...prev, nome_completo: e.target.value }))}
                required
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade_gestora">Unidade Gestora *</Label>
              {profile?.role === 'admin' ? (
                <SimpleSelect
                  options={unidadesGestoras}
                  value={profileForm.unidade_gestora}
                  onChange={(value) => setProfileForm(prev => ({ ...prev, unidade_gestora: value }))}
                  placeholder="Selecione uma unidade gestora"
                />
              ) : (
                <>
                  <Input
                    id="unidade_gestora"
                    value={profileForm.unidade_gestora}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                    placeholder="Unidade gestora não pode ser alterada"
                  />
                  <p className="text-xs text-muted-foreground">
                    A unidade gestora não pode ser alterada após o primeiro acesso.
                  </p>
                </>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={profileForm.matricula}
                onChange={(e) => setProfileForm(prev => ({ ...prev, matricula: e.target.value }))}
                placeholder="Sua matrícula funcional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formacao">Formação</Label>
              <SimpleSelect
                options={opcoesFormacao}
                value={profileForm.formacao}
                onChange={(value) => setProfileForm(prev => ({ ...prev, formacao: value }))}
                placeholder="Selecione sua formação"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={profileForm.telefone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading || !profileForm.nome_completo} 
                className="w-full"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}