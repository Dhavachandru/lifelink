import React from 'react';
import { Check } from 'lucide-react';

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
}

export interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStepIndex: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStepIndex,
  className = '',
}) => {
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      {/* Mobile bar summary */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
          <span>
            Step {currentStepIndex + 1} of {steps.length}:{' '}
            <strong className="text-white">{steps[currentStepIndex]?.label}</strong>
          </span>
          <span className="font-mono text-[11px] text-forest-400">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface-850 rounded-full overflow-hidden border border-surface-border">
          <div
            className="h-full bg-forest-600 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop / Tablet horizontal steps */}
      <ol className="hidden sm:flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <li
              key={step.id}
              className={`flex-1 relative flex items-center ${
                idx !== steps.length - 1 ? 'pr-4' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-forest-700 text-white'
                      : isCurrent
                      ? 'bg-forest-950 border-2 border-forest-500 text-forest-300'
                      : 'bg-surface-elevated border border-surface-border text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </div>
                <div className="text-left">
                  <span
                    className={`block text-xs font-medium tracking-tight ${
                      isCurrent
                        ? 'text-white'
                        : isCompleted
                        ? 'text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="block text-[10px] text-slate-400">{step.description}</span>
                  )}
                </div>
              </div>

              {idx !== steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${
                    isCompleted ? 'bg-forest-700' : 'bg-surface-border'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
