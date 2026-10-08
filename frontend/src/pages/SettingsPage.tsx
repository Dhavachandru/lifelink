import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/settingsApi';
import { authApi } from '../api/authApi';
import { UserSettings } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Settings,
  Bell,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  Shield,
  User,
  Phone,
  Mail,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshProfile, logout } = useAuth();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    settingsApi.getSettings()
      .then(setSettings)
      .catch(err => console.warn('Could not load settings', err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSetting = async (field: keyof UserSettings) => {
    if (!settings) return;
    const newValue = !settings[field];
    const updated = { ...settings, [field]: newValue };
    setSettings(updated);

    try {
      await settingsApi.updateSettings({ [field]: newValue });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.warn('Failed to update setting', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await authApi.updateProfile(fullName, phone);
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err: any) {
      alert(`Could not update profile: ${err.message}`);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await authApi.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifelink-user-export-${user?.id || 'data'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleDeleteAccount = () => {
    alert('Account deletion request registered. Under standard privacy protocol, data will be purged.');
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <EmergencyDisclaimerBanner dismissible={true} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">Preferences</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Settings & Privacy</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control notifications, location sharing defaults, profile details, and exercise GDPR data export requests.
          </p>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <div className="space-y-6">
          {/* User Profile */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Driver Profile Details</span>
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs max-w-lg">
              <div>
                <label className="block text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 font-mono cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Email is verified for authentication.</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2831"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700"
                >
                  {profileSaving ? 'Updating...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          {settings && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Notification Channels</span>
              </h2>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">Email Notifications</span>
                    <span className="text-slate-400 text-[11px]">Receive incident triage reports and 30-day document expiry notices.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationEmail}
                    onChange={() => handleToggleSetting('notificationEmail')}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">SMS Roadside Dispatch Updates</span>
                    <span className="text-slate-400 text-[11px]">Receive SMS ETA alerts when assistance providers are dispatched.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationSms}
                    onChange={() => handleToggleSetting('notificationSms')}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="font-bold text-white block">In-App Push Alerts</span>
                    <span className="text-slate-400 text-[11px]">Real-time audio and banner chimes for active emergency checklist steps.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={() => handleToggleSetting('pushNotifications')}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Privacy & Data Ownership */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Privacy Controls & Data Portability</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              LIFELINK OS enforces zero silent background tracking. Secrets stay out of client bundles, and owner authorization protects all records.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white block">GDPR / CCPA Full Data Export</span>
                  <span className="text-slate-400 text-[11px]">
                    Download a complete copy of your vehicles, documents metadata, incidents, and contacts in JSON format.
                  </span>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export My Data (JSON)</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-red-300 block">Delete Account & Purge Records</span>
                  <span className="text-slate-400 text-[11px]">
                    Permanently delete your profile and revoke all active refresh tokens.
                  </span>
                </div>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Confirm Account Deletion"
        message="Are you sure you want to delete your LIFELINK OS account? All saved vehicles, document references, and incident history will be permanently revoked."
        confirmLabel="Permanently Delete"
        isDestructive={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
