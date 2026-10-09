import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/settingsApi';
import { authApi } from '../api/authApi';
import { UserSettings } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Button } from '../components/design-system/Button';
import { Checkbox } from '../components/design-system/Checkbox';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  Download,
  Trash2,
  Shield,
  User,
  MapPin,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshProfile, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Delete account confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    settingsApi
      .getSettings()
      .then(setSettings)
      .catch((err) => console.warn('Could not load settings', err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSetting = async (field: keyof UserSettings) => {
    if (!settings) return;
    const newValue = !settings[field];
    const updated = { ...settings, [field]: newValue };
    setSettings(updated);

    try {
      await settingsApi.updateSettings({ [field]: newValue });
      success('Privacy preference updated');
    } catch (err) {
      console.warn('Failed to update setting', err);
      toastError('Could not update preference');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await authApi.updateProfile(fullName, phone);
      await refreshProfile();
      success('Driver profile updated');
    } catch (err: any) {
      toastError(`Could not update profile: ${err.message}`);
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
      a.download = `lifelink-data-export-${user?.id || 'driver'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('Data archive exported to JSON');
    } catch (err: any) {
      toastError(`Export failed: ${err.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authApi.deleteAccount();
      alert('Your account and all associated vehicles, documents, and incidents have been permanently deleted.');
      logout();
    } catch (err: any) {
      toastError(`Deletion request error: ${err.message}`);
    }
  };

  return (
    <div className="text-slate-100">
      <EmergencyDisclaimerBanner dismissible={true} />

      {/* Account Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Permanently Delete LIFELINK Account?"
        message="This will permanently delete your account profile, all registered vehicles, uploaded insurance/PUC documents, and incident timeline history. \n\nThis action cannot be undone."
        confirmLabel="Permanently Delete My Data"
        cancelLabel="Keep My Account"
        isDestructive={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-6 text-left">
        {/* Header */}
        <div className="pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
              Account & Privacy Control
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Settings & Privacy
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your driver profile, communication channels, explicit location permissions, and GDPR data export.
          </p>
        </div>

        {/* 1. Driver Profile Section */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-forest-400" />
            <h2 className="text-sm font-bold text-white">Driver Profile</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Email: <strong className="text-slate-300">{user?.email}</strong> (Account identifier)
              </span>
              <Button type="submit" variant="primary" size="sm" loading={profileSaving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* 2. Notification Preferences */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-forest-400" />
            <h2 className="text-sm font-bold text-white">Notification & Alert Channels</h2>
          </div>

          <p className="text-xs text-slate-400">
            Control how LIFELINK OS delivers critical expiry alerts and assistance updates:
          </p>

          <div className="space-y-3">
            <Checkbox
              checked={settings?.notificationSms ?? true}
              onChange={() => handleToggleSetting('notificationSms')}
              label="SMS Text Alerts"
              description="Recommended for urgent dispatch status changes and emergency contact notification."
            />

            <Checkbox
              checked={settings?.notificationEmail ?? true}
              onChange={() => handleToggleSetting('notificationEmail')}
              label="Email Policy & Expiry Summaries"
              description="Sends 30-day proactive notices before insurance or PUC certificates expire."
            />

            <Checkbox
              checked={settings?.pushNotifications ?? true}
              onChange={() => handleToggleSetting('pushNotifications')}
              label="Browser / Mobile Push Alerts"
              description="Immediate real-time updates when an assistance provider updates their arrival ETA."
            />
          </div>
        </div>

        {/* 3. Location & Privacy Choices (Plain Language) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-400" />
            <h2 className="text-sm font-bold text-white">Location Permissions & Privacy Choice</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            LIFELINK OS adheres to a strict zero-surveillance design. We never track your location in the background or sell your route data.
          </p>

          <div className="p-4 rounded-xl bg-surface-900 border border-surface-border space-y-2">
            <Checkbox
              checked={settings?.shareLocationDefault ?? false}
              onChange={() => handleToggleSetting('shareLocationDefault')}
              label="Automatically prompt for GPS coordinates during new incidents"
              description="When unchecked, the app defaults to manual landmark entry unless you explicitly click 'Share GPS Location'."
            />
          </div>

          <div className="p-3.5 rounded-xl bg-forest-950/30 border border-forest-800/40 text-xs text-forest-200 space-y-1">
            <strong className="text-white block">Plain Language Privacy Commitments:</strong>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
              <li>Coordinates are acquired only when you click the GPS button.</li>
              <li>Coordinates are sent solely to the roadside service partner you authorize.</li>
              <li>No background telemetry or continuous tracking loops exist in LIFELINK OS.</li>
            </ul>
          </div>
        </div>

        {/* 4. Data Ownership & Deletion */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-forest-400" />
            <h2 className="text-sm font-bold text-white">Your Data & GDPR Portability</h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            You retain 100% ownership of all records in LIFELINK OS. You can download a complete JSON export of your profile, vehicles, and incident logs anytime.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportData}
            >
              Export All Data (JSON)
            </Button>

            <Button
              variant="destructive"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Account & All Vault Records
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
