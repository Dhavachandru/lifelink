import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentApi } from '../api/incidentApi';
import { providerApi } from '../api/providerApi';
import { IncidentDetail, AssistanceProvider, ActionCategory } from '../types';
import { UrgencyBadge, IncidentStatusBadge } from '../components/StatusBadge';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Car,
  Wrench,
  Camera,
  Upload,
  Phone,
  PhoneCall,
  Plus,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [providers, setProviders] = useState<AssistanceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Attachment upload state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState('DAMAGE_EVIDENCE');
  const [attachmentNotes, setAttachmentNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Assistance dispatch confirmation modal
  const [selectedProvider, setSelectedProvider] = useState<AssistanceProvider | null>(null);
  const [dispatchConfirmOpen, setDispatchConfirmOpen] = useState(false);

  // Resolution modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      const [inc, provList] = await Promise.all([
        incidentApi.getById(id),
        providerApi.getProviders(),
      ]);
      setIncident(inc);
      setProviders(provList);
    } catch (err: any) {
      setError(err.message || 'Could not load incident details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleToggleAction = async (actionId: string) => {
    if (!id || !incident) return;
    try {
      // Optimistic update
      setIncident(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          actions: prev.actions.map(a =>
            a.id === actionId ? { ...a, completed: !a.completed } : a
          ),
        };
      });
      await incidentApi.toggleAction(id, actionId);
    } catch (err) {
      console.warn('Failed to toggle action', err);
      loadData();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteTitle.trim()) return;

    setIsAddingNote(true);
    try {
      const updated = await incidentApi.addNote(id, noteTitle.trim(), noteDesc.trim() || undefined);
      setIncident(updated);
      setNoteTitle('');
      setNoteDesc('');
    } catch (err: any) {
      alert(`Could not add note: ${err.message}`);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !attachmentFile) return;

    setIsUploading(true);
    try {
      await incidentApi.uploadAttachment(id, attachmentFile, attachmentType, attachmentNotes);
      setAttachmentFile(null);
      setAttachmentNotes('');
      // Reload details to update attachments list and timeline
      loadData();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRequestAssistance = async () => {
    if (!id || !selectedProvider) return;
    try {
      await incidentApi.requestAssistance(id, selectedProvider.id, `Requested dispatch via LIFELINK OS cockpit`);
      setDispatchConfirmOpen(false);
      setSelectedProvider(null);
      loadData();
    } catch (err: any) {
      alert(`Dispatch request failed: ${err.message}`);
    }
  };

  const handleResolveIncident = async () => {
    if (!id) return;
    try {
      const updated = await incidentApi.updateStatus(id, 'RESOLVED', resolutionNotes);
      setIncident(updated);
      setResolveModalOpen(false);
    } catch (err: any) {
      alert(`Could not resolve incident: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading incident response cockpit...</p>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold">Incident Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to access incident'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Calculate checklist completion percentage
  const totalActions = incident.actions.length;
  const completedActions = incident.actions.filter(a => a.completed).length;
  const progressPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Group actions by category
  const immediateSafetyActions = incident.actions.filter(a => a.actionCategory === 'IMMEDIATE_SAFETY');
  const recommendedActions = incident.actions.filter(a => a.actionCategory === 'RECOMMENDED_ACTION');
  const evidenceActions = incident.actions.filter(a => a.actionCategory === 'EVIDENCE_COLLECTION');
  const docCheckActions = incident.actions.filter(a => a.actionCategory === 'DOCUMENT_CHECK');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <EmergencyDisclaimerBanner />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-xs">{incident.title}</span>
        </div>

        {/* Cockpit Status Bar */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <UrgencyBadge urgency={incident.urgency} />
                <IncidentStatusBadge status={incident.status} />
                <span className="text-xs font-mono text-slate-400">
                  {incident.incidentType.replace('_', ' ')}
                </span>
                {incident.locationSharedExplicitly && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    📍 GPS Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {incident.title}
              </h1>
              {incident.address && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{incident.address}</span>
                </p>
              )}
            </div>

            {/* Quick Actions (Call Emergency / Resolve) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href="tel:911"
                className="px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-glow-red"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 911 / 112</span>
              </a>

              {incident.status !== 'RESOLVED' && (
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-glow-emerald"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>
          </div>

          {/* Situational Summary */}
          {incident.summary && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-4">
              <span className="font-semibold text-emerald-400 block mb-0.5">Triage Assessment Summary:</span>
              {incident.summary}
            </div>
          )}

          {/* Checklist Completion Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Protocol Safety Checklist Progress</span>
              <span className="font-mono text-emerald-400 font-bold">{completedActions} of {totalActions} steps ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2-Column Main Cockpit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: Action Checklist & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interactive Action Checklist */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">Active Safety Protocols</h2>
                </div>
                <span className="text-[11px] text-slate-400">Tap steps to complete</span>
              </div>

              {/* Immediate Safety Steps */}
              {immediateSafetyActions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-red-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Immediate Physical Safety Steps (Do First)
                  </h3>
                  <div className="space-y-2">
                    {immediateSafetyActions.map(action => (
                      <div
                        key={action.id}
                        onClick={() => handleToggleAction(action.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          action.completed
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                            : 'bg-red-950/20 border-red-900/50 hover:border-red-600/60 text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={action.completed}
                          onChange={() => {}} // handled by parent div
                          className="mt-0.5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className={`font-semibold block ${action.completed ? 'text-slate-500' : 'text-white'}`}>
                            {action.title}
                          </span>
                          {action.description && (
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{action.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Procedures */}
              {recommendedActions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Recommended Response Procedures
                  </h3>
                  <div className="space-y-2">
                    {recommendedActions.map(action => (
                      <div
                        key={action.id}
                        onClick={() => handleToggleAction(action.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          action.completed
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={action.completed}
                          onChange={() => {}}
                          className="mt-0.5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className={`font-semibold block ${action.completed ? 'text-slate-500' : 'text-white'}`}>
                            {action.title}
                          </span>
                          {action.description && (
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{action.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Collection Steps */}
              {evidenceActions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Evidence Collection (Only When Scene is Safe)
                  </h3>
                  <div className="space-y-2">
                    {evidenceActions.map(action => (
                      <div
                        key={action.id}
                        onClick={() => handleToggleAction(action.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          action.completed
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={action.completed}
                          onChange={() => {}}
                          className="mt-0.5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className={`font-semibold block ${action.completed ? 'text-slate-500' : 'text-white'}`}>
                            {action.title}
                          </span>
                          {action.description && (
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{action.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Checks */}
              {docCheckActions.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Vault Documentation & Coverage Checks
                  </h3>
                  <div className="space-y-2">
                    {docCheckActions.map(action => (
                      <div
                        key={action.id}
                        onClick={() => handleToggleAction(action.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          action.completed
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={action.completed}
                          onChange={() => {}}
                          className="mt-0.5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className={`font-semibold block ${action.completed ? 'text-slate-500' : 'text-white'}`}>
                            {action.title}
                          </span>
                          {action.description && (
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{action.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline & Notes */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">Incident Event Timeline</h2>
                </div>
                <span className="text-xs font-mono text-slate-400">{incident.events.length} events logged</span>
              </div>

              {/* Timeline Feed */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {incident.events.map(event => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-emerald-400 group-hover:scale-125 transition-transform" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{event.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                          {event.actorType}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Progress Note Form */}
              <form onSubmit={handleAddNote} className="mt-8 pt-6 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Add Status Note / Situation Update
                </h4>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="Note Headline (e.g. Tow truck arrived, parked behind barrier)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <textarea
                  rows={2}
                  value={noteDesc}
                  onChange={e => setNoteDesc(e.target.value)}
                  placeholder="Additional context or details..."
                  className="w-full p-3 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isAddingNote || !noteTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNote ? 'Recording...' : 'Add Note to Timeline'}</span>
                </button>
              </form>
            </div>

            {/* Evidence & Damage Photo Attachments */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">Photos & Attached Evidence</h2>
                </div>
                <span className="text-xs font-mono text-slate-400">{incident.attachments.length} files</span>
              </div>

              {/* Upload form */}
              <form onSubmit={handleUploadAttachment} className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Select Photo or Document</label>
                    <input
                      type="file"
                      required
                      onChange={e => setAttachmentFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-200 file:text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Attachment Type</label>
                    <select
                      value={attachmentType}
                      onChange={e => setAttachmentType(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-white"
                    >
                      <option value="DAMAGE_EVIDENCE">Damage Photo</option>
                      <option value="DRIVER_EXCHANGE">Other Driver License / Insurance</option>
                      <option value="DASHBOARD_LIGHTS">Dashboard Cluster Warning</option>
                      <option value="POLICE_REPORT_DOC">Police Card / Badge Info</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={attachmentNotes}
                    onChange={e => setAttachmentNotes(e.target.value)}
                    placeholder="Notes (e.g. Scrape on rear right quarter panel)..."
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={isUploading || !attachmentFile}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Attach File'}</span>
                  </button>
                </div>
              </form>

              {/* Attachments List */}
              {incident.attachments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No evidence photos or documents attached yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {incident.attachments.map(att => (
                    <div key={att.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="truncate max-w-[70%]">
                        <span className="font-semibold text-white block truncate">{att.fileName}</span>
                        <span className="text-[10px] text-slate-400">{att.attachmentType} • {(att.fileSize / 1024).toFixed(1)} KB</span>
                        {att.notes && <p className="text-[11px] text-slate-300 mt-0.5 truncate">{att.notes}</p>}
                      </div>
                      <a
                        href={att.downloadUrl}
                        download
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Roadside Assistance Search & Dispatch */}
          <div className="space-y-8">
            {/* Assistance Directory & Dispatch */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Assistance Directory</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                  DEMO DATA
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Contact roadside assistance or non-emergency highway patrol. Dispatching requires explicit user confirmation.
              </p>

              <div className="space-y-3">
                {providers.map(prov => (
                  <div
                    key={prov.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-white text-sm block">{prov.name}</span>
                        <span className="text-[11px] text-slate-400">{prov.serviceArea}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-900 text-emerald-400 border border-slate-800">
                        ⭐ {prov.rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 text-[11px]">
                      <span>ETA: <strong className="text-emerald-400">~{prov.estimatedEtaMinutes} mins</strong></span>
                      <span>Type: {prov.providerType}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2">
                      <a
                        href={`tel:${prov.phoneNumber}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-750 flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call Provider</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProvider(prov);
                          setDispatchConfirmOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glow-emerald transition-all"
                      >
                        Request Dispatch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle & Insurance Snapshot */}
            {incident.vehicle && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md text-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-white">Involved Vehicle Specs</h4>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Vehicle:</span>
                    <strong className="text-white">{incident.vehicle.year} {incident.vehicle.make} {incident.vehicle.model}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Plate Number:</span>
                    <strong className="text-white font-mono">{incident.vehicle.licensePlate}</strong>
                  </div>
                  {incident.vehicle.vin && (
                    <div className="flex justify-between text-slate-300">
                      <span>VIN:</span>
                      <strong className="text-white font-mono text-[10px]">{incident.vehicle.vin}</strong>
                    </div>
                  )}
                  {incident.vehicle.insuranceProvider && (
                    <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-850">
                      <span>Insurance Carrier:</span>
                      <strong className="text-emerald-400">{incident.vehicle.insuranceProvider}</strong>
                    </div>
                  )}
                  {incident.vehicle.insurancePolicyNumber && (
                    <div className="flex justify-between text-slate-300">
                      <span>Policy Number:</span>
                      <strong className="text-white font-mono">{incident.vehicle.insurancePolicyNumber}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Requesting Assistance */}
      <ConfirmationModal
        isOpen={dispatchConfirmOpen}
        title={`Confirm Request: ${selectedProvider?.name}`}
        message={`You are about to submit an assistance request to ${selectedProvider?.name}. \n\nLIFELINK OS will transmit your vehicle details (${incident.vehicle?.licensePlate || 'Unspecified'}) and location to the provider. \n\nDo you authorize this request?`}
        confirmLabel="Authorize & Dispatch"
        onConfirm={handleRequestAssistance}
        onCancel={() => {
          setDispatchConfirmOpen(false);
          setSelectedProvider(null);
        }}
      />

      {/* Mark Resolved Modal */}
      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Resolve Incident</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Document resolution summary (e.g. tow completed to dealership, spare tire fitted, police report # filed):
            </p>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="Resolution summary notes..."
              className="w-full p-3 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveIncident}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetailPage;
