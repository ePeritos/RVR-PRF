import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  show: boolean;
  message?: string;
  className?: string;
}

export const ProgressIndicator = ({ show, message = "Carregando...", className }: ProgressIndicatorProps) => {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex items-center gap-2 bg-background border border-border rounded-lg px-4 py-2 shadow-lg animate-fade-in",
      className
    )}>
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-foreground">{message}</span>
    </div>
  );
};

interface GlobalLoadingProps {
  show: boolean;
  message?: string;
}

export const GlobalLoading = ({ show, message = "Processando..." }: GlobalLoadingProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-background border border-border rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-foreground font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};