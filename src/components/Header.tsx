
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">
              Sistema RVR
            </h1>
            <span className="text-sm text-muted-foreground">
              para geração do Relatório de Valor Referencial
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && <UserProfile />}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
