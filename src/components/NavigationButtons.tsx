
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export const NavigationButtons = ({
  currentStep,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious
}: NavigationButtonsProps) => {
  if (currentStep === 4) {
    return (
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="hover-scale"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => {/* Nova avaliação logic */}}
          className="hover-scale"
        >
          Nova Avaliação RVR
        </Button>
      </div>
    );
  }

  // Na etapa 1, não mostra o botão "Anterior"
  if (currentStep === 1) {
    return (
      <div className="flex justify-end mt-8">
        <Button 
          onClick={onNext} 
          disabled={!canGoNext}
          className="hover-scale"
        >
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Na etapa 3, não mostra o botão "Próximo" pois será substituído pelo "Gerar Relatório RVR"
  if (currentStep === 3) {
    return (
      <div className="flex justify-start mt-8">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="hover-scale"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
      </div>
    );
  }

  // Para a etapa 2
  return (
    <div className="flex justify-between mt-8">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        className="hover-scale"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Anterior
      </Button>
      
      <Button 
        onClick={onNext} 
        disabled={!canGoNext}
        className="hover-scale"
      >
        Próximo
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
