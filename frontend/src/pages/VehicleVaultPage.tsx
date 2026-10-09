import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vehicleApi } from '../api/vehicleApi';
import { Vehicle, VehicleDocument, VehicleServiceRecord, DocumentType } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { Button } from '../components/design-system/Button';
import { EmptyState } from '../components/design-system/EmptyState';
import { useToast } from '../context/ToastContext';
import {
  Car,
  FileText,
  Wrench,
  Plus,
  Upload,
  Trash2,
  Lock,
  X,
} from 'lucide-react';

export const VehicleVaultPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [services, setServices] = useState<VehicleServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Active tab: 'vehicles' | 'documents' | 'services'
  const initialTab = searchParams.get('tab') === 'documents' ? 'documents' : 'vehicles';
  const [activeTab, setActiveTab] = useState<'vehicles' | 'documents' | 'services'>(initialTab);

  // Add vehicle modal state
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState(2023);
  const [newPlate, setNewPlate] = useState('');
  const [newVin, setNewVin] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newFuel, setNewFuel] = useState('PETROL');
  const [newInsPolicy, setNewInsPolicy] = useState('');
  const [newInsProvider, setNewInsProvider] = useState('');
  const [newInsExpiry, setNewInsExpiry] = useState('');
  const [newPucExpiry, setNewPucExpiry] = useState('');

  // Add document modal state
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [docType, setDocType] = useState<DocumentType>('INSURANCE');
  const [docNumber, setDocNumber] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);

  // Add service modal state
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [serviceMileage, setServiceMileage] = useState('');
  const [serviceCenter, setServiceCenter] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceCost, setServiceCost] = useState('');

  const loadVehicles = async () => {
    try {
      const list = await vehicleApi.getAll();
      setVehicles(list);

      const queryVehId = searchParams.get('vehicleId');
      if (queryVehId) {
        const matching = list.find((v) => v.id === queryVehId);
        if (matching) setSelectedVehicle(matching);
        else if (list.length > 0) setSelectedVehicle(list[0]);
      } else if (list.length > 0 && !selectedVehicle) {
        setSelectedVehicle(list[0]);
      } else if (selectedVehicle) {
        const found = list.find((v) => v.id === selectedVehicle.id);
        if (found) setSelectedVehicle(found);
      }
    } catch (err) {
      console.warn('Failed to load vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      Promise.all([
        vehicleApi.getDocuments(selectedVehicle.id),
        vehicleApi.getServices(selectedVehicle.id),
      ])
        .then(([docs, srvs]) => {
          setDocuments(docs);
          setServices(srvs);
        })
        .catch((err) => console.warn('Failed to load vehicle details', err));
    }
  }, [selectedVehicle]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await vehicleApi.create({
        make: newMake,
        model: newModel,
        year: Number(newYear),
        licensePlate: newPlate,
        vin: newVin || undefined,
        color: newColor || undefined,
        fuelType: newFuel,
        insurancePolicyNumber: newInsPolicy || undefined,
        insuranceProvider: newInsProvider || undefined,
        insuranceExpiryDate: newInsExpiry || undefined,
        pucExpiryDate: newPucExpiry || undefined,
        primary: vehicles.length === 0,
      });
      setAddVehicleOpen(false);
      await loadVehicles();
      setSelectedVehicle(created);
      success(`${created.year} ${created.make} ${created.model} added to vault`);

      // Reset form
      setNewMake('');
      setNewModel('');
      setNewPlate('');
      setNewVin('');
      setNewColor('');
      setNewInsPolicy('');
      setNewInsProvider('');
      setNewInsExpiry('');
      setNewPucExpiry('');
    } catch (err: any) {
      toastError(`Could not create vehicle: ${err.message}`);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !docFile) return;

    setDocUploading(true);
    try {
      await vehicleApi.uploadDocument(
        selectedVehicle.id,
        docFile,
        docType,
        docNumber || undefined,
        docExpiry || undefined
      );
      setAddDocOpen(false);
      setDocFile(null);
      setDocNumber('');
      setDocExpiry('');
      const updatedDocs = await vehicleApi.getDocuments(selectedVehicle.id);
      setDocuments(updatedDocs);
      success(`${docType.replace('_', ' ')} uploaded to vault`);
    } catch (err: any) {
      toastError(`Upload failed: ${err.message}`);
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!selectedVehicle) return;
    if (!window.confirm('Delete this document?')) return;
    try {
      await vehicleApi.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      success('Document removed from vault');
    } catch (err: any) {
      toastError(`Could not delete document: ${err.message}`);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !serviceDesc.trim()) return;

    try {
      await vehicleApi.addService(selectedVehicle.id, {
        serviceDate,
        mileage: serviceMileage ? Number(serviceMileage) : undefined,
        serviceCenter: serviceCenter || undefined,
        description: serviceDesc,
        cost: serviceCost ? Number(serviceCost) : undefined,
      });
      setAddServiceOpen(false);
      setServiceDesc('');
      setServiceMileage('');
      setServiceCost('');
      const updated = await vehicleApi.getServices(selectedVehicle.id);
      setServices(updated);
      success('Service log recorded');
    } catch (err: any) {
      toastError(`Could not save service record: ${err.message}`);
    }
  };

  // Helper for expiry countdown
  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return { status: 'missing', label: 'Not recorded', badgeClass: 'bg-surface-elevated text-slate-400' };
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: `Expired (${Math.abs(diffDays)}d ago)`, badgeClass: 'bg-red-950/70 text-red-200 border-red-800' };
    }
    if (diffDays <= 30) {
      return { status: 'warning', label: `Expires in ${diffDays}d`, badgeClass: 'bg-amber-950/70 text-amber-200 border-amber-800' };
    }
    return { status: 'valid', label: `Valid (${diffDays}d left)`, badgeClass: 'bg-forest-950/70 text-forest-300 border-forest-800/60' };
  };

  const insExpiryStatus = getExpiryStatus(selectedVehicle?.insuranceExpiryDate);
  const pucExpiryStatus = getExpiryStatus(selectedVehicle?.pucExpiryDate);

  return (
    <div className="text-slate-100">
      <EmergencyDisclaimerBanner dismissible={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                Encrypted Vehicle & Document Vault
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Vehicle & Document Vault
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Securely organize your vehicle registrations, insurance policies, PUC emissions certificates, and maintenance records.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setAddVehicleOpen(true)}
          >
            Add New Vehicle
          </Button>
        </div>

        {/* Vault Reassurance Banner */}
        <div className="p-4 rounded-xl bg-surface-card border border-surface-border text-xs text-slate-300 flex items-start gap-3 text-left">
          <Lock className="w-4 h-4 text-forest-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Privacy & Storage Guarantee:</strong> All document files and policy numbers are stored in your encrypted account. Nothing is shared with roadside dispatchers or third parties without your explicit confirmation.
          </p>
        </div>

        {/* Vehicle Selector Pills */}
        {vehicles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-left">
            <span className="text-xs text-slate-400 mr-1">Vehicle:</span>
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVehicle(v);
                  setSearchParams({ vehicleId: v.id, tab: activeTab });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2 ${
                  selectedVehicle?.id === v.id
                    ? 'bg-forest-950 border-forest-600 text-white shadow-subtle'
                    : 'bg-surface-card border-surface-border text-slate-300 hover:bg-surface-elevated'
                }`}
              >
                <Car className={`w-3.5 h-3.5 ${selectedVehicle?.id === v.id ? 'text-forest-400' : 'text-slate-400'}`} />
                <span>
                  {v.year} {v.make} {v.model}
                </span>
                {v.primary && (
                  <span className="text-[10px] px-1 rounded bg-surface-elevated text-slate-300 border border-surface-border">
                    Primary
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Vault Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-2 text-xs">
          <button
            onClick={() => {
              setActiveTab('vehicles');
              setSearchParams({ tab: 'vehicles', ...(selectedVehicle ? { vehicleId: selectedVehicle.id } : {}) });
            }}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'vehicles'
                ? 'bg-surface-elevated text-white border border-surface-border'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicle Specifications</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('documents');
              setSearchParams({ tab: 'documents', ...(selectedVehicle ? { vehicleId: selectedVehicle.id } : {}) });
            }}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'bg-surface-elevated text-white border border-surface-border'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents Vault ({documents.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('services');
              setSearchParams({ tab: 'services', ...(selectedVehicle ? { vehicleId: selectedVehicle.id } : {}) });
            }}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'services'
                ? 'bg-surface-elevated text-white border border-surface-border'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Service History ({services.length})</span>
          </button>
        </div>

        {/* Loading / Empty / Content states */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading vehicle records...</span>
          </div>
        ) : !selectedVehicle ? (
          <EmptyState
            icon={<Car className="w-6 h-6 text-slate-400" />}
            title="No vehicles in vault"
            description="Add your primary vehicle to track insurance policies, PUC emissions certificates, and maintenance records."
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setAddVehicleOpen(true)}
              >
                Add Your First Vehicle
              </Button>
            }
          />
        ) : (
          <div className="space-y-6 text-left">
            {/* TAB 1: VEHICLE SPECIFICATIONS & EXPIRY CALLOUTS */}
            {activeTab === 'vehicles' && (
              <div className="space-y-6">
                {/* Expiry & Missing Information Alert Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Insurance Status Card */}
                  <div
                    className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                      insExpiryStatus.status === 'warning'
                        ? 'bg-amber-950/20 border-amber-800/40'
                        : insExpiryStatus.status === 'expired'
                        ? 'bg-red-950/20 border-red-800/40'
                        : 'bg-surface-card border-surface-border'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">Insurance Policy</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${insExpiryStatus.badgeClass}`}
                        >
                          {insExpiryStatus.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Provider: <strong>{selectedVehicle.insuranceProvider || 'Not registered'}</strong>
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Policy #: {selectedVehicle.insurancePolicyNumber || 'Missing'}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setDocType('INSURANCE');
                        setAddDocOpen(true);
                      }}
                    >
                      Update
                    </Button>
                  </div>

                  {/* PUC Status Card */}
                  <div
                    className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                      pucExpiryStatus.status === 'warning'
                        ? 'bg-amber-950/20 border-amber-800/40'
                        : pucExpiryStatus.status === 'expired'
                        ? 'bg-red-950/20 border-red-800/40'
                        : 'bg-surface-card border-surface-border'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">PUC Emissions Certificate</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${pucExpiryStatus.badgeClass}`}
                        >
                          {pucExpiryStatus.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Expiry Date: {selectedVehicle.pucExpiryDate || 'Missing certificate record'}
                      </p>
                      {!selectedVehicle.pucExpiryDate && (
                        <p className="text-[11px] text-amber-400 mt-0.5">
                          Missing PUC document - upload below for compliance alerts.
                        </p>
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setDocType('PUC');
                        setAddDocOpen(true);
                      }}
                    >
                      Upload PUC
                    </Button>
                  </div>
                </div>

                {/* Vehicle Specifications Grid */}
                <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-forest-400" />
                    <span>Technical & Registration Details</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-surface-900 border border-surface-border">
                      <span className="text-slate-400 block mb-0.5">Make & Model</span>
                      <strong className="text-white">
                        {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-900 border border-surface-border">
                      <span className="text-slate-400 block mb-0.5">License Plate</span>
                      <strong className="text-white font-mono">{selectedVehicle.licensePlate}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-900 border border-surface-border">
                      <span className="text-slate-400 block mb-0.5">VIN</span>
                      <strong className="text-white font-mono truncate block">
                        {selectedVehicle.vin || 'Not provided'}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-900 border border-surface-border">
                      <span className="text-slate-400 block mb-0.5">Fuel Type / Powertrain</span>
                      <strong className="text-white">{selectedVehicle.fuelType || 'PETROL'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DOCUMENTS VAULT */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Document Certificates & Policies
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload PDF or image copies of insurance policies, registration cards, and warranties.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Upload className="w-3.5 h-3.5" />}
                    onClick={() => setAddDocOpen(true)}
                  >
                    Upload Document
                  </Button>
                </div>

                {documents.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="w-6 h-6 text-slate-400" />}
                    title="No documents uploaded for this vehicle"
                    description="Upload your insurance card or PUC certificate for offline emergency access."
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAddDocOpen(true)}
                      >
                        Upload First Document
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc) => {
                      const exp = getExpiryStatus(doc.expiryDate);

                      return (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl bg-surface-card border border-surface-border flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                {doc.fileName}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-slate-300 border border-surface-border">
                                {doc.documentType.replace('_', ' ')}
                              </span>
                            </div>

                            {doc.documentNumber && (
                              <p className="text-xs text-slate-400 font-mono">
                                Doc #: {doc.documentNumber}
                              </p>
                            )}

                            {doc.expiryDate && (
                              <span
                                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${exp.badgeClass}`}
                              >
                                {exp.label}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-surface-elevated transition-colors"
                            aria-label="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SERVICE RECORDS */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Maintenance & Service Log</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Keep track of oil changes, brake replacements, and battery installations.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setAddServiceOpen(true)}
                  >
                    Add Service Record
                  </Button>
                </div>

                {services.length === 0 ? (
                  <EmptyState
                    icon={<Wrench className="w-6 h-6 text-slate-400" />}
                    title="No service records logged"
                    description="Record your maintenance history to provide accurate context during breakdowns."
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setAddServiceOpen(true)}
                      >
                        Log First Maintenance
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{srv.description}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({srv.serviceDate})
                            </span>
                          </div>

                          <div className="text-slate-400 flex items-center gap-3">
                            {srv.serviceCenter && <span>Center: {srv.serviceCenter}</span>}
                            {srv.mileage && <span>Mileage: {srv.mileage.toLocaleString()} mi</span>}
                          </div>
                        </div>

                        {srv.cost && (
                          <span className="font-mono font-semibold text-forest-300 self-end sm:self-auto">
                            ${srv.cost.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {addVehicleOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="bg-surface-elevated border border-surface-border rounded-2xl max-w-lg w-full p-6 shadow-elevated text-left max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <h3 className="text-base font-bold text-white">Add New Vehicle to Vault</h3>
              <button
                onClick={() => setAddVehicleOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Make *</label>
                  <input
                    type="text"
                    required
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    placeholder="e.g. Toyota"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. RAV4"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="e.g. 7XYZ890"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Color</label>
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="e.g. Silver Metallic"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Fuel Type</label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="PETROL">Petrol / Gasoline</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric (EV)</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">VIN (Optional)</label>
                <input
                  type="text"
                  value={newVin}
                  onChange={(e) => setNewVin(e.target.value)}
                  placeholder="17-character VIN"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={newInsProvider}
                    onChange={(e) => setNewInsProvider(e.target.value)}
                    placeholder="e.g. State Farm"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={newInsPolicy}
                    onChange={(e) => setNewInsPolicy(e.target.value)}
                    placeholder="POL-123456"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Insurance Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newInsExpiry}
                    onChange={(e) => setNewInsExpiry(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    PUC Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newPucExpiry}
                    onChange={(e) => setNewPucExpiry(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddVehicleOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {addDocOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="bg-surface-elevated border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-elevated text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <h3 className="text-base font-bold text-white">Upload Document Certificate</h3>
              <button
                onClick={() => setAddDocOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocumentType)}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="INSURANCE">Insurance Policy</option>
                  <option value="PUC">PUC Emissions Certificate</option>
                  <option value="REGISTRATION">Registration Card</option>
                  <option value="WARRANTY">Warranty Document</option>
                  <option value="SERVICE_INVOICE">Service Invoice</option>
                  <option value="OTHER">Other Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Document / Policy #
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="e.g. POL-891024"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={docExpiry}
                  onChange={(e) => setDocExpiry(e.target.value)}
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  File (PDF or Image) *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-surface-elevated file:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddDocOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={docUploading}>
                  Upload File
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {addServiceOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        >
          <div className="bg-surface-elevated border border-surface-border rounded-2xl max-w-md w-full p-6 shadow-elevated text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <h3 className="text-base font-bold text-white">Log Vehicle Maintenance</h3>
              <button
                onClick={() => setAddServiceOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Service Description *
                </label>
                <input
                  type="text"
                  required
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  placeholder="e.g. 50,000-mile synthetic oil & filter change"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Odometer Mileage
                  </label>
                  <input
                    type="number"
                    value={serviceMileage}
                    onChange={(e) => setServiceMileage(e.target.value)}
                    placeholder="e.g. 48500"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Service Center
                  </label>
                  <input
                    type="text"
                    value={serviceCenter}
                    onChange={(e) => setServiceCenter(e.target.value)}
                    placeholder="e.g. City Toyota"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(e.target.value)}
                    placeholder="120.00"
                    className="w-full bg-surface-900 border border-surface-border rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddServiceOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleVaultPage;
