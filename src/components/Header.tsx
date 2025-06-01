
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
              Sistema RVR
            </h1>
            <span className="text-xs sm:text-sm text-muted-foreground block truncate">
              para geração do Relatório de Valor Referencial
            </span>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            {user && <UserProfile />}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
