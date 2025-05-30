
interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  const steps = [
    'Upload de Arquivo',
    'Filtros e Seleção',
    'Parâmetros',
    'Resultados',
    'Responsáveis Técnicos'
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-center items-center space-x-4 mb-4">
        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          return (
            <div key={stepNumber} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${
                  stepNumber === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : stepNumber < currentStep 
                      ? 'bg-green-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                }`}
                onClick={() => onStepClick(stepNumber)}
              >
                {stepNumber}
              </div>
              {stepNumber < steps.length && (
                <div className={`w-12 h-0.5 mx-2 transition-colors ${
                  stepNumber < currentStep ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Passo {currentStep} de {steps.length} - Processo RVR
        </p>
      </div>
    </div>
  );
};
