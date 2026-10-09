import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { incidentApi } from '../api/incidentApi';
import { providerApi } from '../api/providerApi';
import { IncidentDetail, AssistanceProvider } from '../types';
import { UrgencyBadge, IncidentStatusBadge } from '../components/StatusBadge';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ChecklistRow } from '../components/design-system/ChecklistRow';
import { TimelineItem } from '../components/design-system/TimelineItem';
import { Button } from '../components/design-system/Button';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Car,
  Camera,
  Upload,
  Phone,
  Plus,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Truck,
  Share2,
  MapPin,
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError, info: toastInfo } = useToast();

  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [providers, setProviders] = useState<AssistanceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Attachment upload state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentType, setAttachmentType] = useState('DAMAGE_EVIDENCE');
  const [attachmentNotes, setAttachmentNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

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
      setIncident((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          actions: prev.actions.map((a) =>
            a.id === actionId ? { ...a, completed: !a.completed } : a
          ),
        };
      });
      await incidentApi.toggleAction(id, actionId);
      toastInfo('Action status updated');
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
      const updated = await incidentApi.addNote(
        id,
        noteTitle.trim(),
        noteDesc.trim() || undefined
      );
      setIncident(updated);
      setNoteTitle('');
      setNoteDesc('');
      setShowNoteForm(false);
      success('Driver note recorded to timeline');
    } catch (err: any) {
      toastError(`Could not add note: ${err.message}`);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !attachmentFile) return;

    setIsUploading(true);
    try {
      await incidentApi.uploadAttachment(
        id,
        attachmentFile,
        attachmentType,
        attachmentNotes
      );
      setAttachmentFile(null);
      setAttachmentNotes('');
      setShowUploadForm(false);
      loadData();
      success('Evidence document saved to incident vault');
    } catch (err: any) {
      toastError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRequestAssistance = async () => {
    if (!id || !selectedProvider) return;
    try {
      await incidentApi.requestAssistance(
        id,
        selectedProvider.id,
        `Authorized dispatch via LIFELINK OS cockpit`
      );
      setDispatchConfirmOpen(false);
      setSelectedProvider(null);
      loadData();
      success('Roadside assistance dispatch authorized');
    } catch (err: any) {
      toastError(`Dispatch request failed: ${err.message}`);
    }
  };

  const handleResolveIncident = async () => {
    if (!id) return;
    try {
      const updated = await incidentApi.updateStatus(id, 'RESOLVED', resolutionNotes);
      setIncident(updated);
      setResolveModalOpen(false);
      success('Incident resolved and archived');
    } catch (err: any) {
      toastError(`Could not resolve incident: ${err.message}`);
    }
  };

  const copyCoordinates = () => {
    if (!incident) return;
    const text =
      incident.latitude && incident.longitude
        ? `${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`
        : incident.address || '';
    if (text) {
      navigator.clipboard.writeText(text);
      success('Location copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading incident response cockpit...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Unable to Load Incident</h3>
        <p className="text-xs text-slate-400 mb-6">{error || 'Incident not found'}</p>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Categorize checklist steps
  const immediateSafetyActions = incident.actions.filter(
    (a) => a.actionCategory === 'IMMEDIATE_SAFETY'
  );
  const recommendedActions = incident.actions.filter(
    (a) => a.actionCategory === 'RECOMMENDED_ACTION'
  );
  const evidenceActions = incident.actions.filter(
    (a) => a.actionCategory === 'EVIDENCE_COLLECTION'
  );
  const documentActions = incident.actions.filter(
    (a) => a.actionCategory === 'DOCUMENT_CHECK'
  );

  const completedCount = incident.actions.filter((a) => a.completed).length;
  const totalCount = incident.actions.length;
  const isResolved = incident.status === 'RESOLVED' || incident.status === 'CANCELLED';

  return (
    <div className="text-slate-100">
      <EmergencyDisclaimerBanner dismissible={true} />

      {/* Confirmation Modal for Provider Dispatch */}
      <ConfirmationModal
        isOpen={dispatchConfirmOpen}
        title={`Authorize Assistance: ${selectedProvider?.name || 'Roadside Unit'}`}
        message={`You are authorizing LIFELINK OS to share your vehicle details (${
          incident.vehicleInfo || 'Vehicle'
        }) and current location with ${selectedProvider?.name}. \n\nEstimated ETA: ~${
          selectedProvider?.estimatedEtaMinutes || 25
        } mins. \n\nNote: Provider data shown is demo mock coordination for response validation.`}
        confirmLabel="Authorize Dispatch"
        cancelLabel="Cancel"
        onConfirm={handleRequestAssistance}
        onCancel={() => {
          setDispatchConfirmOpen(false);
          setSelectedProvider(null);
        }}
      />

      {/* Confirmation Modal for Incident Resolution */}
      <ConfirmationModal
        isOpen={resolveModalOpen}
        title="Resolve & Close Incident"
        message="Mark this incident response as resolved? All completed checklist actions and timeline events will remain preserved in your audit record."
        confirmLabel="Mark Incident Resolved"
        cancelLabel="Keep Open"
        onConfirm={handleResolveIncident}
        onCancel={() => setResolveModalOpen(false)}
      >
        <div className="mt-3">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Resolution Summary Notes (Optional):
          </label>
          <textarea
            rows={2}
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="e.g. Tow truck arrived, vehicle transported safely to authorized workshop."
            className="w-full bg-surface-card border border-surface-border rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-500"
          />
        </div>
      </ConfirmationModal>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Incident Records</span>
          </Link>

          <span className="font-mono text-[11px] text-slate-400">
            ID: {incident.id.substring(0, 8)}...
          </span>
        </div>

        {/* Top Incident Summary Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border text-left flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={incident.urgency} />
              <IncidentStatusBadge status={incident.status} />
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-slate-300 border border-surface-border">
                {incident.incidentType === 'VEHICLE_ACCIDENT' ? 'Accident' : 'Breakdown'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {incident.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {incident.summary || incident.description}
            </p>

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              {incident.vehicleInfo && (
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Car className="w-3.5 h-3.5 text-forest-400" />
                  <span>{incident.vehicleInfo}</span>
                </span>
              )}

              {incident.address && (
                <span className="flex items-center gap-1.5 truncate max-w-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{incident.address}</span>
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(incident.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {!isResolved ? (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => setResolveModalOpen(true)}
              >
                Mark Resolved
              </Button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-forest-950 text-forest-300 border border-forest-800/60 text-xs font-semibold text-center">
                ✓ Incident Resolved
              </span>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon={<Share2 className="w-3.5 h-3.5" />}
              onClick={copyCoordinates}
            >
              Copy Location
            </Button>
          </div>
        </div>

        {/* Main Content Grid: Checklist (2 Cols) vs Sidebar (Assistance & Timeline) (1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Left 2 Columns: Categorized Checklists & Disclaimers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Checklist Progress summary */}
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white">Action Protocol Progress</span>
                <span className="text-slate-400 ml-2">
                  ({completedCount} of {totalCount} completed)
                </span>
              </div>
              <span className="font-mono font-bold text-forest-400">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>

            {/* 1. Immediate Safety Steps (Always First!) */}
            {immediateSafetyActions.length > 0 && (
              <section aria-labelledby="immediate-safety-heading" className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <h2
                    id="immediate-safety-heading"
                    className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
                  >
                    1. Immediate Physical Safety (Do First)
                  </h2>
                </div>

                <div className="space-y-2">
                  {immediateSafetyActions.map((action) => (
                    <ChecklistRow
                      key={action.id}
                      id={action.id}
                      stepOrder={action.stepOrder}
                      title={action.title}
                      description={action.description}
                      category={action.actionCategory}
                      completed={action.completed}
                      onToggle={handleToggleAction}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 2. Recommended Actions */}
            {recommendedActions.length > 0 && (
              <section aria-labelledby="recommended-actions-heading" className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-400" />
                  <h2
                    id="recommended-actions-heading"
                    className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
                  >
                    2. Recommended Incident Steps
                  </h2>
                </div>

                <div className="space-y-2">
                  {recommendedActions.map((action) => (
                    <ChecklistRow
                      key={action.id}
                      id={action.id}
                      stepOrder={action.stepOrder}
                      title={action.title}
                      description={action.description}
                      category={action.actionCategory}
                      completed={action.completed}
                      onToggle={handleToggleAction}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. Evidence to Collect (Only When Safe) */}
            {evidenceActions.length > 0 && (
              <section aria-labelledby="evidence-heading" className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <h2
                    id="evidence-heading"
                    className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
                  >
                    3. Evidence to Collect (Only When Roadway is Safe)
                  </h2>
                </div>

                <div className="space-y-2">
                  {evidenceActions.map((action) => (
                    <ChecklistRow
                      key={action.id}
                      id={action.id}
                      stepOrder={action.stepOrder}
                      title={action.title}
                      description={action.description}
                      category={action.actionCategory}
                      completed={action.completed}
                      onToggle={handleToggleAction}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 4. Documents to Check */}
            {documentActions.length > 0 && (
              <section aria-labelledby="documents-heading" className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <h2
                    id="documents-heading"
                    className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
                  >
                    4. Vault Documents to Verify
                  </h2>
                </div>

                <div className="space-y-2">
                  {documentActions.map((action) => (
                    <ChecklistRow
                      key={action.id}
                      id={action.id}
                      stepOrder={action.stepOrder}
                      title={action.title}
                      description={action.description}
                      category={action.actionCategory}
                      completed={action.completed}
                      onToggle={handleToggleAction}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Evidence Attachments Section */}
            <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-forest-400" />
                    <span>Incident Photos & Attachments ({incident.attachments.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Save scene photos, odometer readings, or insurance receipts into this incident&apos;s record.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  {showUploadForm ? 'Cancel' : 'Add Photo'}
                </Button>
              </div>

              {/* Upload Form */}
              {showUploadForm && (
                <form
                  onSubmit={handleUploadAttachment}
                  className="p-4 rounded-xl bg-surface-900 border border-surface-border space-y-3 animate-in fade-in duration-100"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Choose Image or Document File:
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-surface-elevated file:text-white hover:file:bg-surface-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Attachment Category:
                    </label>
                    <select
                      value={attachmentType}
                      onChange={(e) => setAttachmentType(e.target.value)}
                      className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-500"
                    >
                      <option value="DAMAGE_EVIDENCE">Damage Evidence / Photo</option>
                      <option value="POLICE_REPORT">Police Report / FIR Copy</option>
                      <option value="INSURANCE_DOCUMENT">Insurance Document / Slip</option>
                      <option value="SCENE_PHOTO">Road Scene / Skid Marks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Notes / Description:
                    </label>
                    <input
                      type="text"
                      value={attachmentNotes}
                      onChange={(e) => setAttachmentNotes(e.target.value)}
                      placeholder="e.g. Rear bumper crack close-up"
                      className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isUploading}
                      icon={<Upload className="w-3.5 h-3.5" />}
                    >
                      Save Attachment
                    </Button>
                  </div>
                </form>
              )}

              {incident.attachments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No attachments yet. Take photos of vehicle damage and the surrounding road when safe.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {incident.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl bg-surface-900 border border-surface-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-forest-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-medium text-white block truncate">
                            {att.fileName}
                          </span>
                          {att.notes && (
                            <span className="text-[11px] text-slate-400 block truncate">
                              {att.notes}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {Math.round(att.fileSize / 1024)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reassuring Legal & Medical Disclaimer */}
            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border text-[11px] text-slate-400 space-y-1">
              <strong className="text-slate-300 block">Guidance & Compliance Disclaimer:</strong>
              <p className="leading-relaxed">
                LIFELINK OS decision engine outputs are advisory checklists and do not constitute a legal fault finding, insurance claim approval guarantee, or professional medical diagnosis. Always obey on-site instructions from traffic police and emergency personnel.
              </p>
            </div>
          </div>

          {/* Right Column: Roadside Assistance Providers & Timeline */}
          <div className="space-y-6">
            {/* Assistance Providers Section */}
            <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Roadside Assistance Units</span>
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400">
                    DEMO DISPATCH DATA
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Pre-screened dispatch partners. Requesting assistance requires your explicit confirmation before coordinates are shared.
              </p>

              <div className="space-y-3">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-surface-900 border border-surface-border hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-xs font-bold text-white block">{p.name}</span>
                        <span className="text-[11px] text-slate-400">{p.providerType.replace('_', ' ')}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated text-forest-300 border border-surface-border">
                        ~{p.estimatedEtaMinutes} min ETA
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-border">
                      <a
                        href={`tel:${p.phoneNumber}`}
                        className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{p.phoneNumber}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProvider(p);
                          setDispatchConfirmOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-forest-900/60 text-forest-300 border border-forest-800/60 text-xs font-medium transition-colors"
                      >
                        Request Dispatch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline of Events & Notes */}
            <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-forest-400" />
                    <span>Incident Timeline</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chronological audit log
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setShowNoteForm(!showNoteForm)}
                >
                  {showNoteForm ? 'Cancel' : 'Add Note'}
                </Button>
              </div>

              {/* Add Note Form */}
              {showNoteForm && (
                <form
                  onSubmit={handleAddNote}
                  className="p-3.5 rounded-xl bg-surface-900 border border-surface-border space-y-2.5 animate-in fade-in duration-100"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Note Title:
                    </label>
                    <input
                      type="text"
                      required
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g. Spoke with officer on scene"
                      className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Details (Optional):
                    </label>
                    <textarea
                      rows={2}
                      value={noteDesc}
                      onChange={(e) => setNoteDesc(e.target.value)}
                      placeholder="e.g. Officer badge #4821, exchange of insurance completed."
                      className="w-full bg-surface-card border border-surface-border rounded-lg p-2 text-xs text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isAddingNote}
                    >
                      Post Note
                    </Button>
                  </div>
                </form>
              )}

              {/* Event items */}
              <div className="space-y-1 pt-2">
                {incident.events.map((evt, idx) => (
                  <TimelineItem
                    key={evt.id}
                    id={evt.id}
                    actorType={evt.actorType}
                    title={evt.title}
                    description={evt.description}
                    createdAt={evt.createdAt}
                    isLast={idx === incident.events.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailPage;
