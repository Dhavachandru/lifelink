import React, { useEffect } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  children,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 transition-opacity"
    >
      <div
        className="bg-surface-elevated border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-elevated relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface-850 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isDestructive
                ? 'bg-red-950/70 text-red-400 border-red-800/60'
                : 'bg-forest-950/70 text-forest-300 border-forest-800/60'
            }`}
          >
            {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <h3 id="confirmation-modal-title" className="text-base font-semibold text-white tracking-tight">
            {title}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {children && <div className="mb-6">{children}</div>}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-surface-800 border border-surface-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-subtle focus-visible:outline-none focus-visible:ring-2 ${
              isDestructive
                ? 'bg-red-700 hover:bg-red-600 border border-red-600 focus-visible:ring-red-400'
                : 'bg-forest-700 hover:bg-forest-600 border border-forest-600 focus-visible:ring-forest-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
