import React, { useState, useEffect } from 'react';
import { contactApi } from '../api/contactApi';
import { EmergencyContact } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Trash2,
  Edit2,
  ShieldAlert,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export const EmergencyContactsPage: React.FC = () => {
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
      } else {
        await contactApi.create({
          name,
          relationship,
          phoneNumber: phone,
          email: email || undefined,
          primary: isPrimary,
          notifyOnIncident,
        });
      }
      setModalOpen(false);
      loadContacts();
    } catch (err: any) {
      alert(`Could not save contact: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this emergency contact?')) return;
    try {
      await contactApi.delete(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(`Could not delete contact: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <EmergencyDisclaimerBanner dismissible={true} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">Safety Network</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Emergency Contacts</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              People you trust. Designated contacts can be notified automatically when an accident or breakdown is confirmed.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-2 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        {contacts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Emergency Contacts Registered</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add a trusted spouse, family member, or friend so they can be notified if you encounter an incident on the road.
            </p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
            >
              Add Emergency Contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map(c => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{c.name}</h3>
                      {c.primary && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{c.relationship}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title="Edit contact"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                      title="Delete contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.phoneNumber}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.email}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Bell className="w-3 h-3 text-emerald-400" />
                    {c.notifyOnIncident ? 'Alert on incident enabled' : 'Manual notification only'}
                  </span>

                  <a
                    href={`tel:${c.phoneNumber}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-emerald-400 font-semibold text-xs border border-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </h3>
            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Elena Mercer"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  placeholder="e.g. Spouse / Brother / Parent"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 987-6543"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. elena.m@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={e => setIsPrimary(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                  />
                  <span className="text-slate-300">Set as Primary Emergency Contact</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnIncident}
                    onChange={e => setNotifyOnIncident(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                  />
                  <span className="text-slate-300">Notify this contact when an incident is reported</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-glow-emerald"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContactsPage;
