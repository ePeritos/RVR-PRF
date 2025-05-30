
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">
            Sistema RVR
          </h1>
          <span className="text-sm text-muted-foreground">
            Relatório de Valor Referencial
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user && <UserProfile />}
        </div>
      </div>
    </header>
  );
};
