
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserProfile } from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

export const Header = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Sistema RVR
            </h1>
            {!isMobile && (
              <span className="text-sm text-muted-foreground">
                para geração do Relatório de Valor Referencial
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {user && <UserProfile />}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
