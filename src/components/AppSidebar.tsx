import { Home, Calculator, Database, LogOut, User } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

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

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nome_completo: '',
    cargo: '',
    matricula: '',
    unidade_lotacao: '',
    telefone: ''
  });
  const currentPath = location.pathname;

  console.log('AppSidebar - Current path:', currentPath, 'Sidebar state:', state);

  const isActive = (path: string) => currentPath === path;

  const handleProfileEdit = () => {
    if (profile) {
      setProfileForm({
        nome_completo: profile.nome_completo || '',
        cargo: profile.cargo || '',
        matricula: profile.matricula || '',
        unidade_lotacao: profile.unidade_lotacao || '',
        telefone: profile.telefone || ''
      });
    }
    setIsProfileOpen(true);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(profileForm);
    if (success) {
      setIsProfileOpen(false);
    }
  };

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-48"}
      collapsible="icon"
    >
      <div className="p-2">
        <SidebarTrigger />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SIGI-PRF</SidebarGroupLabel>

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

              {/* Botão toggle tema */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <ThemeToggle collapsed={state === "collapsed"} />
                </SidebarMenuButton>
              </SidebarMenuItem>

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                value={profileForm.nome_completo}
                onChange={(e) => setProfileForm(prev => ({ ...prev, nome_completo: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={profileForm.cargo}
                onChange={(e) => setProfileForm(prev => ({ ...prev, cargo: e.target.value }))}
                placeholder="Ex: Engenheiro Civil"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                value={profileForm.matricula}
                onChange={(e) => setProfileForm(prev => ({ ...prev, matricula: e.target.value }))}
                placeholder="Ex: CREA/XX 123456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade_lotacao">Unidade de Lotação</Label>
              <Select
                value={profileForm.unidade_lotacao}
                onValueChange={(value) => setProfileForm(prev => ({ ...prev, unidade_lotacao: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  {unidadesGestoras.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={profileForm.telefone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="Ex: (11) 99999-9999"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsProfileOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}