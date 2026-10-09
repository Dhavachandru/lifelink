import React, { useState, useEffect } from 'react';
import { contactApi } from '../api/contactApi';
import { EmergencyContact } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { Button } from '../components/design-system/Button';
import { EmptyState } from '../components/design-system/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Trash2,
  Edit2,
  Bell,
  X,
} from 'lucide-react';

export const EmergencyContactsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Spouse');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notifyOnIncident, setNotifyOnIncident] = useState(true);

  const loadContacts = async () => {
    try {
      const list = await contactApi.getAll();
      setContacts(list);
    } catch (err) {
      console.warn('Could not load contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const openCreateModal = () => {
    setEditingContact(null);
    setName('');
    setRelationship('Spouse');
    setPhone('');
    setEmail('');
    setIsPrimary(contacts.length === 0);
    setNotifyOnIncident(true);
    setModalOpen(true);
  };

  const openEditModal = (c: EmergencyContact) => {
    setEditingContact(c);
    setName(c.name);
    setRelationship(c.relationship);
    setPhone(c.phoneNumber);
    setEmail(c.email || '');
    setIsPrimary(c.primary);
    setNotifyOnIncident(c.notifyOnIncident);
    setModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await contactApi.update(editingContact.id, {
          name,
          relationship,
          phoneNumber: phone,
          email: email || undefined,
          primary: isPrimary,
          notifyOnIncident,
        });
        success('Emergency contact updated');
      } else {
        await contactApi.create({
          name,
          relationship,
          phoneNumber: phone,
          email: email || undefined,
          primary: isPrimary,
          notifyOnIncident,
        });
        success('New emergency contact added');
      }
      setModalOpen(false);
      loadContacts();
    } catch (err: any) {
      toastError(`Could not save contact: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this emergency contact?')) return;
    try {
      await contactApi.delete(id);
      success('Emergency contact removed');
      loadContacts();
    } catch (err: any) {
      toastError(`Could not delete contact: ${err.message}`);
    }
  };

  return (
    <div className="text-slate-100">
      <EmergencyDisclaimerBanner dismissible={true} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                Trusted Response Circle
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Emergency Contacts
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Designate trusted family members or co-drivers who should be notified when an accident or breakdown is logged.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Emergency Contact
          </Button>
        </div>

        {/* Contacts List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading contacts...</span>
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6 text-slate-400" />}
            title="No emergency contacts configured"
            description="Add trusted people who should be notified immediately if you report an accident."
            action={
              <Button variant="primary" size="sm" onClick={openCreateModal}>
                Add Primary Contact
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-500 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">{c.name}</h3>
                        {c.primary && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-950 text-forest-300 border border-forest-800/60 font-mono">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{c.relationship}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
                        aria-label={`Edit ${c.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-surface-elevated transition-colors"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 mt-3 pt-3 border-t border-surface-border">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-forest-400" />
                      <a href={`tel:${c.phoneNumber}`} className="hover:underline font-mono">
                        {c.phoneNumber}
                      </a>
                    </p>

                    {c.email && (
                      <p className="flex items-center gap-2 text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{c.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Bell className="w-3 h-3 text-slate-400" />
                    <span>{c.notifyOnIncident ? 'Auto-notify on incidents' : 'Manual call only'}</span>
                  </span>

                  <a
                    href={`tel:${c.phoneNumber}`}
                    className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-forest-900/60 text-forest-300 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Direct Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="bg-surface-elevated border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-elevated text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <h3 className="text-base font-bold text-white">
                {editingContact ? 'Edit Emergency Contact' : 'New Emergency Contact'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Mercer"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Child">Child</option>
                  <option value="Friend">Friend / Co-Driver</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@example.com"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded border-surface-border text-forest-600 focus:ring-forest-500"
                  />
                  <span>Designate as primary contact</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={notifyOnIncident}
                    onChange={(e) => setNotifyOnIncident(e.target.checked)}
                    className="rounded border-surface-border text-forest-600 focus:ring-forest-500"
                  />
                  <span>Automatically notify via SMS when an incident is reported</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsPage;
