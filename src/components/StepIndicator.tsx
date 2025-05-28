
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-center items-center space-x-4 mb-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === currentStep 
                ? 'bg-primary text-primary-foreground' 
                : step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            {step < totalSteps && (
              <div className={`w-12 h-0.5 mx-2 transition-colors ${
                step < currentStep ? 'bg-green-500' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Passo {currentStep} de {totalSteps} - Processo RVR
        </p>
      </div>
    </div>
  );
};
