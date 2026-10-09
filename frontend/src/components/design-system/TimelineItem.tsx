import React from 'react';
import { User, Cpu, ShieldAlert, Truck, Clock } from 'lucide-react';

export interface TimelineItemProps {
  id: string;
  eventType?: string;
  actorType: 'USER' | 'SYSTEM' | 'AI' | 'PROVIDER';
  title: string;
  description?: string;
  createdAt: string;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  actorType,
  title,
  description,
  createdAt,
  isLast = false,
}) => {
  const getActorConfig = () => {
    switch (actorType) {
      case 'USER':
        return {
          label: 'Driver Note',
          badgeClass: 'bg-surface-elevated text-slate-300 border-surface-border',
          icon: <User className="w-3.5 h-3.5 text-slate-300" />,
        };
      case 'AI':
        return {
          label: 'AI Triage',
          badgeClass: 'bg-forest-950 text-forest-300 border-forest-800/60',
          icon: <Cpu className="w-3.5 h-3.5 text-forest-400" />,
        };
      case 'PROVIDER':
        return {
          label: 'Assistance Provider',
          badgeClass: 'bg-sky-950 text-sky-300 border-sky-800/60',
          icon: <Truck className="w-3.5 h-3.5 text-sky-400" />,
        };
      case 'SYSTEM':
      default:
        return {
          label: 'System Event',
          badgeClass: 'bg-surface-elevated text-slate-400 border-surface-border',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const actor = getActorConfig();

  const formattedDate = () => {
    try {
      const d = new Date(createdAt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return createdAt;
    }
  };

  return (
    <div className="flex items-start gap-3.5 relative">
      {/* Timeline track connector */}
      {!isLast && (
        <div
          className="absolute left-4 top-8 bottom-0 w-px bg-surface-border"
          aria-hidden="true"
        />
      )}

      {/* Actor Avatar */}
      <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center shrink-0 z-10 shadow-subtle">
        {actor.icon}
      </div>

      <div className="flex-1 pb-6 min-w-0 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white tracking-tight">{title}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${actor.badgeClass}`}
            >
              {actor.label}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            {formattedDate()}
          </span>
        </div>

        {description && (
          <p className="text-xs text-slate-300 leading-relaxed bg-surface-card p-3 rounded-xl border border-surface-border mt-1.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
