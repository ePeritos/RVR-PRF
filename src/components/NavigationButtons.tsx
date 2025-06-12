
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

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
  const { isAdmin } = useProfile();
  if (currentStep === 4) {
    return (
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 px-4">
        <Button 
          variant="outline" 
          onClick={onPrevStep}
          className="hover-scale w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onNewEvaluation}
          className="hover-scale w-full sm:w-auto"
        >
          Nova Avaliação RVR
        </Button>
      </div>
    );
  }

  // Na etapa 1, não mostra o botão "Anterior"
  if (currentStep === 1) {
    return (
      <div className="flex justify-end mt-8 px-4">
        <Button 
          onClick={onNextStep} 
          disabled={!canProceed}
          className="hover-scale w-full sm:w-auto"
        >
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Na etapa 3, não mostra o botão "Próximo" pois será substituído pelo "Gerar Relatório RVR"
  if (currentStep === 3) {
    const minStep = isAdmin ? 1 : 2;
    return (
      <div className="flex justify-start mt-8 px-4">
        {currentStep > minStep && (
          <Button 
            variant="outline" 
            onClick={onPrevStep}
            className="hover-scale w-full sm:w-auto"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        )}
      </div>
    );
  }

  // Para a etapa 2
  const minStep = isAdmin ? 1 : 2;
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 px-4">
      {currentStep > minStep && (
        <Button 
          variant="outline" 
          onClick={onPrevStep}
          className="hover-scale w-full sm:w-auto order-2 sm:order-1"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
      )}
      
      <Button 
        onClick={onNextStep} 
        disabled={!canProceed}
        className={`hover-scale w-full sm:w-auto ${currentStep <= minStep ? 'order-1' : 'order-1 sm:order-2'}`}
      >
        Próximo
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
