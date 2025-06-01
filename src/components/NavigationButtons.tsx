
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationButtonsProps {
  currentStep: number;
  canProceed: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onNewEvaluation: () => void;
}

export const NavigationButtons = ({
  currentStep,
  canProceed,
  onNextStep,
  onPrevStep,
  onNewEvaluation
}: NavigationButtonsProps) => {
  const isMobile = useIsMobile();

  if (currentStep === 4) {
    return (
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'} mt-8`}>
        <Button 
          variant="outline" 
          onClick={onPrevStep}
          className="hover-scale"
          size={isMobile ? "default" : "default"}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onNewEvaluation}
          className="hover-scale"
          size={isMobile ? "default" : "default"}
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
          onClick={onNextStep} 
          disabled={!canProceed}
          className="hover-scale"
          size={isMobile ? "default" : "default"}
        >
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Na etapa 3, não mostra o botão "Próximo" pois será controlado pelo formulário
  if (currentStep === 3) {
    return (
      <div className="flex justify-start mt-8">
        <Button 
          variant="outline" 
          onClick={onPrevStep}
          className="hover-scale"
          size={isMobile ? "default" : "default"}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
      </div>
    );
  }

  // Para a etapa 2
  return (
    <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between'} mt-8`}>
      <Button 
        variant="outline" 
        onClick={onPrevStep}
        className="hover-scale"
        size={isMobile ? "default" : "default"}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Anterior
      </Button>
      
      <Button 
        onClick={onNextStep} 
        disabled={!canProceed}
        className="hover-scale"
        size={isMobile ? "default" : "default"}
      >
        Próximo
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
