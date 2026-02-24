
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps?: number;
  canProceed: boolean;
  onNextStep: () => void;
  onPrevStep: () => void;
  onNewEvaluation: () => void;
}

export const NavigationButtons = ({
  currentStep,
  totalSteps = 3,
  canProceed,
  onNextStep,
  onPrevStep,
  onNewEvaluation
}: NavigationButtonsProps) => {
  // Last step
  if (currentStep === totalSteps) {
    return (
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 max-w-5xl mx-auto">
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

  // First step - no "Anterior" button
  if (currentStep === 1) {
    return (
      <div className="flex justify-end mt-8 max-w-5xl mx-auto">
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

  // Step before last - no "Próximo" (replaced by form submit)
  if (currentStep === totalSteps - 1) {
    return (
      <div className="flex justify-start mt-8 max-w-5xl mx-auto">
        <Button 
          variant="outline" 
          onClick={onPrevStep}
          className="hover-scale w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
      </div>
    );
  }

  // Middle steps
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-5xl mx-auto">
      <Button 
        variant="outline" 
        onClick={onPrevStep}
        className="hover-scale w-full sm:w-auto order-2 sm:order-1"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Anterior
      </Button>
      
      <div className="sm:ml-auto">
        <Button 
          onClick={onNextStep} 
          disabled={!canProceed}
          className="hover-scale w-full sm:w-auto order-1 sm:order-2"
        >
          Próximo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
