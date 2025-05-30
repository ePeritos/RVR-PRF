
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface Profile {
  nome_completo: string;
  cargo: string;
  matricula: string;
  unidade_lotacao: string;
  telefone: string;
  responsavel_tecnico_id?: string;
}

interface UserProfileDropdownProps {
  profile: Profile;
  onEditProfile: () => void;
}

export const UserProfileDropdown = ({ profile, onEditProfile }: UserProfileDropdownProps) => {
  const { user, signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {profile.nome_completo || user?.email}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{profile.nome_completo || 'Usuário'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onEditProfile}>
          <Settings className="h-4 w-4 mr-2" />
          Editar Perfil
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
