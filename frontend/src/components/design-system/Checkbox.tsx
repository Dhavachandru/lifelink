import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, checked, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label
        htmlFor={inputId}
        className={`flex items-start gap-3 cursor-pointer group text-left select-none ${className}`}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div className="w-4 h-4 rounded-md border border-surface-border bg-surface-900 peer-focus-visible:ring-2 peer-focus-visible:ring-forest-500 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-surface-950 peer-checked:bg-forest-600 peer-checked:border-forest-600 transition-colors flex items-center justify-center group-hover:border-slate-500">
            {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
            {label}
          </span>
          {description && (
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
