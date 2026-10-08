import React, { useState } from 'react';
import { vehicleApi } from '../api/vehicleApi';
import { contactApi } from '../api/contactApi';
import { settingsApi } from '../api/settingsApi';
import { Shield, Car, Users, CheckCircle2, ArrowRight, Lock, Bell } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ isOpen, onComplete }) => {
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
      // 1. Create primary vehicle if entered
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

      // 2. Create emergency contact if entered
      if (contactName && contactPhone) {
        await contactApi.create({
          name: contactName,
          relationship: contactRel,
          phoneNumber: contactPhone,
          primary: true,
          notifyOnIncident: true,
        });
      }

      // 3. Save settings
      await settingsApi.updateSettings({
        notificationEmail: notifyEmail,
        notificationSms: notifySms,
        shareLocationDefault: shareLocationDefault,
      });

      sessionStorage.removeItem('lifelink_show_onboarding');
      onComplete();
    } catch (err) {
      console.warn('Onboarding save error', err);
      // Proceed even on minor error
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
        {/* Progress tracker */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Setup Wizard</span>
            <h3 className="text-lg font-bold text-white">Welcome to LIFELINK OS</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span>Step {step} of 3</span>
          </div>
        </div>

        {/* STEP 1: Vehicle Setup */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center text-blue-400 border border-blue-800/40">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Register Your Primary Vehicle</h4>
                <p className="text-xs text-slate-400">Pre-loading your vehicle ensures rapid triage and assistance dispatch during a breakdown.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Make</label>
                <input
                  type="text"
                  value={make}
                  onChange={e => setMake(e.target.value)}
                  placeholder="e.g. Toyota"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. RAV4"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">License Plate</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={e => setLicensePlate(e.target.value)}
                  placeholder="e.g. 7XYZ890"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-1.5 transition-all"
              >
                <span>Next: Emergency Contact</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Emergency Contact Setup */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800/40">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Designate Emergency Contact (Optional)</h4>
                <p className="text-xs text-slate-400">Can be automatically notified with incident status if you choose.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Full Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={contactRel}
                    onChange={e => setContactRel(e.target.value)}
                    placeholder="e.g. Spouse / Brother / Parent"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2831"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Skip for Now
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-1.5 transition-all"
                >
                  <span>Next: Privacy & Consent</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Plain Language Privacy & Permissions */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400 border border-purple-800/40">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Privacy & Permissions Explained in Plain Language</h4>
                <p className="text-xs text-slate-400">We believe in transparent, consent-driven design with zero silent tracking.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Silent Tracking:</strong> We never track your GPS coordinates in the background. Location is requested ONLY when you tap "Share My Location" on an incident.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Explicit Confirmation:</strong> No roadside provider or contact is ever messaged or dispatched without your explicit confirmation dialog.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Your Data Stays Yours:</strong> You can export all your records in JSON format at any time from Settings or request deletion.</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Email notifications for document expiries and incident triage reports</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={e => setNotifySms(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>SMS alerts when roadside assistance confirms dispatch (Demo simulation)</span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-1.5 transition-all"
              >
                {loading ? 'Finalizing Setup...' : 'Complete Onboarding & Enter OS'}
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
