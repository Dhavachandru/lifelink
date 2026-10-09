import React from 'react';
import { ActionCategory } from '../../types';
import { ShieldAlert, CheckCircle2, Camera, FileCheck, Check } from 'lucide-react';

export interface ChecklistRowProps {
  id: string;
  stepOrder: number;
  title: string;
  description: string;
  category: ActionCategory;
  completed: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export const ChecklistRow: React.FC<ChecklistRowProps> = ({
  id,
  stepOrder,
  title,
  description,
  category,
  completed,
  onToggle,
  disabled = false,
}) => {
  const getCategoryConfig = () => {
    switch (category) {
      case 'IMMEDIATE_SAFETY':
        return {
          label: 'Immediate Safety',
          badgeClass: 'bg-red-950/60 text-red-300 border-red-800/60',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />,
        };
      case 'RECOMMENDED_ACTION':
        return {
          label: 'Recommended Action',
          badgeClass: 'bg-forest-950/60 text-forest-300 border-forest-800/60',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-forest-400 shrink-0" />,
        };
      case 'EVIDENCE_COLLECTION':
        return {
          label: 'Evidence (When Safe)',
          badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
          icon: <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
        };
      case 'DOCUMENT_CHECK':
        return {
          label: 'Document Check',
          badgeClass: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
          icon: <FileCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
        };
      default:
        return {
          label: 'General Step',
          badgeClass: 'bg-surface-elevated text-slate-300 border-surface-border',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />,
        };
    }
  };

  const cat = getCategoryConfig();

  return (
    <div
      onClick={() => !disabled && onToggle(id)}
      role="checkbox"
      aria-checked={completed}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onToggle(id);
        }
      }}
      className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
        completed
          ? 'bg-surface-900/40 border-surface-border-subtle opacity-75'
          : category === 'IMMEDIATE_SAFETY'
          ? 'bg-surface-card border-red-900/40 hover:border-red-700/60'
          : 'bg-surface-card border-surface-border hover:border-slate-600'
      }`}
    >
      {/* Custom styled checkbox indicator */}
      <div className="shrink-0 mt-0.5">
        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
            completed
              ? 'bg-forest-600 border-forest-600 text-white'
              : 'border-surface-border bg-surface-900'
          }`}
        >
          {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-semibold text-slate-400">
            Step {stepOrder}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cat.badgeClass}`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </span>
        </div>

        <h4
          className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
            completed ? 'text-slate-400 line-through' : 'text-white'
          }`}
        >
          {title}
        </h4>

        {description && (
          <p
            className={`text-xs mt-1 leading-relaxed ${
              completed ? 'text-slate-400' : 'text-slate-300'
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
