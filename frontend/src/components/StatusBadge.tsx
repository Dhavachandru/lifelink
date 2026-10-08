import React from 'react';
import { UrgencyLevel, IncidentStatus } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => {
  switch (urgency) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-500/50 shadow-glow-red animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          CRITICAL PRIORITY
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/40">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          HIGH URGENCY
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-950/60 text-yellow-300 border border-yellow-500/30">
          <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-500/30">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          LOW URGENCY
        </span>
      );
  }
};

export const IncidentStatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  switch (status) {
    case 'REPORTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-700/50">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          Reported
        </span>
      );
    case 'ASSESSING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/40 text-purple-300 border border-purple-700/50 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
          AI Assessing
        </span>
      );
    case 'DISPATCHED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/40 text-amber-300 border border-amber-700/50">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Assistance Dispatched
        </span>
      );
    case 'RESOLVING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Resolving
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-500/40">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          Resolved
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          <XCircle className="w-3.5 h-3.5 text-slate-400" />
          Cancelled
        </span>
      );
    default:
      return null;
  }
};
