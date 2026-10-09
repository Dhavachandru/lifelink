import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

interface Props {
  dismissible?: boolean;
}

export const EmergencyDisclaimerBanner: React.FC<Props> = ({ dismissible = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Emergency Services Disclaimer"
      className="bg-red-950/40 border-b border-red-900/50 px-4 py-2.5 text-xs text-red-200"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <p className="leading-relaxed text-red-100">
            <strong className="font-semibold text-white uppercase tracking-wider text-[11px] mr-1.5">
              EMERGENCY NOTICE:
            </strong>
            LIFELINK OS provides guided decision support and does NOT replace emergency services, medical triage, or legal counsel. If anyone is injured or there is immediate danger, call local emergency services immediately.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <a
            href="tel:911"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-medium shadow-subtle transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Call 911 / 112</span>
          </a>

          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="text-red-300 hover:text-white p-1 rounded-md hover:bg-red-900/40 transition-colors"
              aria-label="Dismiss emergency banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default EmergencyDisclaimerBanner;
