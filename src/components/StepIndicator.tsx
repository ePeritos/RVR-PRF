
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="mb-4 sm:mb-8">
      <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-4 overflow-x-auto px-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
              step === currentStep 
                ? 'bg-primary text-primary-foreground' 
                : step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            {step < totalSteps && (
              <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-colors flex-shrink-0 ${
                step < currentStep ? 'bg-green-500' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center px-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Passo {currentStep} de {totalSteps} - Processo RVR
        </p>
      </div>
    </div>
  );
};
