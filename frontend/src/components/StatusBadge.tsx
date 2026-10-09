import React from 'react';
import { UrgencyLevel, IncidentStatus } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel; className?: string }> = ({ urgency, className = '' }) => {
  switch (urgency) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/70 text-red-200 border border-red-700/60 shadow-subtle ${className}`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>CRITICAL PRIORITY</span>
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-200 border border-amber-700/60 shadow-subtle ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>HIGH URGENCY</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/30 text-amber-300 border border-amber-800/40 shadow-subtle ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>MEDIUM</span>
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-elevated text-slate-300 border border-surface-border shadow-subtle ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>LOW URGENCY</span>
        </span>
      );
  }
};

export const IncidentStatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'REPORTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-elevated text-slate-200 border border-surface-border ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Reported</span>
        </span>
      );
    case 'ASSESSING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-elevated text-forest-300 border border-forest-800/60 ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-forest-400 shrink-0" />
          <span>AI Assessing</span>
        </span>
      );
    case 'DISPATCHED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/50 text-amber-200 border border-amber-700/60 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Assistance Dispatched</span>
        </span>
      );
    case 'RESOLVING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-forest-950/60 text-forest-200 border border-forest-700/60 ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-forest-400 shrink-0" />
          <span>Resolving</span>
        </span>
      );
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-card text-forest-300 border border-forest-800/40 ${className}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-forest-400 shrink-0" />
          <span>Resolved</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-950 text-slate-400 border border-surface-border ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return null;
  }
};
