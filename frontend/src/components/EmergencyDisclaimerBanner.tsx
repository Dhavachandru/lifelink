import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

interface Props {
  dismissible?: boolean;
}

export const EmergencyDisclaimerBanner: React.FC<Props> = ({ dismissible = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-red-950/40 border-y border-red-500/30 px-4 py-2.5 text-xs text-red-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
          <span>
            <strong className="font-semibold text-red-300">EMERGENCY NOTICE:</strong> LIFELINK OS provides guided decision support and does NOT replace emergency services, medical triage, or legal counsel. If anyone is injured or there is active danger, immediately call your local emergency dispatch.
          </span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <a
            href="tel:911"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-medium shadow-sm transition-colors text-xs"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call 911 / 112</span>
          </a>
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="text-red-400 hover:text-red-200 p-1"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyDisclaimerBanner;
