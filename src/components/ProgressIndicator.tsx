
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  processedItems?: number;
  totalItems?: number;
  isProcessing?: boolean;
  stepLabels?: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  processedItems,
  totalItems,
  isProcessing = false,
  stepLabels = [],
}: ProgressIndicatorProps) {
  const isMobile = useIsMobile();
  const overallProgress = ((currentStep - 1) / totalSteps) * 100;
  const itemProgress = processedItems && totalItems ? (processedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progresso geral das etapas */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso Geral</span>
          <span>{currentStep} de {totalSteps} etapas</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Indicadores visuais das etapas - Layout responsivo */}
      {isMobile ? (
        // Layout vertical para mobile
        <div className="space-y-3">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const stepLabel = stepLabels[index] || `Etapa ${stepNumber}`;

            return (
              <div key={stepNumber} className="flex items-center space-x-3 p-2 rounded-lg bg-card">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : isCurrent ? (
                    isProcessing ? (
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{stepNumber}</span>
                      </div>
                    )
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {stepLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Layout horizontal para desktop
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const stepLabel = stepLabels[index] || `Etapa ${stepNumber}`;

            return (
              <div key={stepNumber} className="flex flex-col items-center space-y-1">
                <div className="flex items-center">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : isCurrent ? (
                    isProcessing ? (
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{stepNumber}</span>
                      </div>
                    )
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <span className={`text-xs text-center max-w-20 ${
                  isCurrent ? 'text-blue-600 font-medium' : 'text-muted-foreground'
                }`}>
                  {stepLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Progresso de itens processados */}
      {processedItems !== undefined && totalItems !== undefined && totalItems > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Processando itens</span>
            <span>{processedItems} de {totalItems}</span>
          </div>
          <Progress value={itemProgress} className="h-1" />
        </div>
      )}
    </div>
  );
}
