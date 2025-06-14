import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SimpleSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SimpleSelect({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  className,
  disabled = false
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between min-h-10 p-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <span className={cn(
          "truncate",
          !value && "text-muted-foreground"
        )}>
          {value || placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="max-h-48 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Nenhum item encontrado.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}