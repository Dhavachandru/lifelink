import React, { useState } from 'react';
import { vehicleApi } from '../api/vehicleApi';
import { contactApi } from '../api/contactApi';
import { settingsApi } from '../api/settingsApi';
import { Car, Users, Shield, X } from 'lucide-react';
import { Button } from '../components/design-system/Button';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<Props> = ({
  isOpen = true,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Vehicle state
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('RAV4');
  const [year, setYear] = useState(2022);
  const [licensePlate, setLicensePlate] = useState('7XYZ890');
  const [color, setColor] = useState('Gray');

  // Contact state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRel, setContactRel] = useState('Spouse');

  // Privacy & preferences state
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [shareLocationDefault, setShareLocationDefault] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (make && model && licensePlate) {
        await vehicleApi.create({
          make,
          model,
          year: Number(year),
          licensePlate,
          color,
          primary: true,
        });
      }

      if (contactName && contactPhone) {
        await contactApi.create({
          name: contactName,
          relationship: contactRel,
          phoneNumber: contactPhone,
          primary: true,
          notifyOnIncident: true,
        });
      }

      await settingsApi.updateSettings({
        notificationEmail: notifyEmail,
        notificationSms: notifySms,
        shareLocationDefault: shareLocationDefault,
      });

      sessionStorage.removeItem('lifelink_show_onboarding');
      if (onComplete) onComplete();
      if (onClose) onClose();
    } catch (err) {
      console.warn('Onboarding save error', err);
      if (onComplete) onComplete();
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.removeItem('lifelink_show_onboarding');
    if (onClose) onClose();
    if (onComplete) onComplete();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      <div className="bg-surface-elevated border border-surface-border rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-elevated relative text-left animate-in fade-in duration-150">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Skip setup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress tracker */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-surface-border">
          <div>
            <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
              Setup Wizard
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Welcome to LIFELINK OS
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span>Step {step} of 3</span>
          </div>
        </div>

        {/* STEP 1: Vehicle Setup */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-forest-950 border border-forest-800/80 flex items-center justify-center text-forest-400">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Register Primary Vehicle</h4>
                <p className="text-xs text-slate-400">
                  Pre-saves details so triage checklists are ready instantly during breakdowns.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Make</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">License Plate</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-border">
              <Button variant="primary" size="sm" onClick={() => setStep(2)}>
                Next: Emergency Contact &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Emergency Contact */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-forest-950 border border-forest-800/80 flex items-center justify-center text-forest-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Designate Primary Emergency Contact</h4>
                <p className="text-xs text-slate-400">
                  Who should be notified if you are involved in a collision?
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Elena Mercer"
                className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
                <select
                  value={contactRel}
                  onChange={(e) => setContactRel(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <Button variant="quiet" size="sm" onClick={() => setStep(1)}>
                &larr; Back
              </Button>
              <Button variant="primary" size="sm" onClick={() => setStep(3)}>
                Next: Readiness Preferences &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Privacy & Preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-forest-950 border border-forest-800/80 flex items-center justify-center text-forest-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Confirm Privacy & Readiness</h4>
                <p className="text-xs text-slate-400">
                  Customize critical notification delivery channels.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-900 border border-surface-border space-y-2.5 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="rounded border-surface-border text-forest-600 focus:ring-forest-500"
                />
                <span>SMS alerts for dispatch updates and contact notices</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded border-surface-border text-forest-600 focus:ring-forest-500"
                />
                <span>Email alerts 30 days before policy or PUC expiry</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <Button variant="quiet" size="sm" onClick={() => setStep(2)}>
                &larr; Back
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={loading}
                onClick={handleFinish}
              >
                Complete Setup & Open Cockpit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
