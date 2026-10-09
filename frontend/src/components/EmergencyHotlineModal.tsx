import React from 'react';
import { PhoneCall, ShieldAlert, Phone, Users, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { EmergencyContact } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  primaryContact?: EmergencyContact | null;
}

export const EmergencyHotlineModal: React.FC<Props> = ({
  isOpen,
  onClose,
  primaryContact,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-hotline-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
    >
      <div
        className="bg-surface-elevated border border-surface-border rounded-2xl max-w-lg w-full p-6 shadow-elevated relative animate-in fade-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface-850 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 id="emergency-hotline-title" className="text-base font-bold text-white tracking-tight">
              Immediate Emergency Hotline
            </h3>
            <p className="text-xs text-red-300 font-medium">
              If life, health, or personal safety is at risk, call immediately.
            </p>
          </div>
        </div>

        {/* Safety checklist reminder */}
        <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-red-200 mb-5 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Move behind a safety barrier if available. Never step into live traffic. Turn on hazard flashers.
          </p>
        </div>

        <div className="space-y-3">
          {/* Primary Local Emergency 911 / 112 */}
          <a
            href="tel:911"
            className="p-4 rounded-xl bg-red-700 hover:bg-red-600 text-white flex items-center justify-between transition-colors shadow-subtle group"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-white" />
              <div>
                <span className="block text-sm font-bold tracking-tight">Emergency Services (911 / 112)</span>
                <span className="text-xs text-red-100">Police, Fire, Ambulance & Highway First Response</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-red-800 text-white group-hover:bg-red-900">
              Dial 911
            </span>
          </a>

          {/* Primary Contact if saved */}
          {primaryContact && (
            <a
              href={`tel:${primaryContact.phoneNumber}`}
              className="p-3.5 rounded-xl bg-surface-card hover:bg-surface-850 border border-surface-border text-slate-100 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-forest-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{primaryContact.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-950 text-forest-300 border border-forest-800/60 font-mono">
                      Primary Contact
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{primaryContact.relationship} • {primaryContact.phoneNumber}</span>
                </div>
              </div>
              <Phone className="w-4 h-4 text-forest-400 group-hover:scale-110 transition-transform" />
            </a>
          )}

          {/* Highway Patrol Non-Emergency */}
          <a
            href="tel:18005550199"
            className="p-3.5 rounded-xl bg-surface-card hover:bg-surface-850 border border-surface-border text-slate-100 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <div>
                <span className="block text-xs font-semibold text-white">Roadside Safety & Non-Emergency Dispatch</span>
                <span className="text-[11px] text-slate-400">For disabled vehicles stranded without injuries</span>
              </div>
            </div>
            <span className="text-xs text-slate-300 font-mono">1-800-555-0199</span>
          </a>
        </div>

        <div className="mt-5 pt-4 border-t border-surface-border flex items-center justify-between text-xs text-slate-400">
          <span>LIFELINK OS Incident Response</span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white font-medium"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
