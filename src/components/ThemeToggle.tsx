import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  collapsed?: boolean;
  showText?: boolean;
}

export function ThemeToggle({ collapsed = false, showText = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className={showText ? "w-full justify-start px-3 py-2" : "h-9 w-9 px-0"}
    >
      {theme === "dark" ? (
        <Sun className={showText ? "mr-2 h-4 w-4" : "h-4 w-4"} />
      ) : (
        <Moon className={showText ? "mr-2 h-4 w-4" : "h-4 w-4"} />
      )}
      {!collapsed && showText && (
        <span>
          {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </span>
      )}
    </Button>
  );
}