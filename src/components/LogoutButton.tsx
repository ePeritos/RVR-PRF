
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export const LogoutButton = () => {
  const { signOut, user } = useAuth();

  if (!user) return null;

  return (
    <Button 
      variant="outline" 
      onClick={signOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
};
