import React, { useState, useEffect } from 'react';
import { vehicleApi } from '../api/vehicleApi';
import { Vehicle, VehicleDocument, VehicleServiceRecord, DocumentType } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import {
  Car,
  FileText,
  Wrench,
  Plus,
  Calendar,
  AlertTriangle,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export const VehicleVaultPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [services, setServices] = useState<VehicleServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceMileage, setServiceMileage] = useState('');
  const [serviceCenter, setServiceCenter] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceCost, setServiceCost] = useState('');

  const loadVehicles = async () => {
    try {
      const list = await vehicleApi.getAll();
      setVehicles(list);
      if (list.length > 0 && !selectedVehicle) {
        setSelectedVehicle(list[0]);
      } else if (selectedVehicle) {
        const found = list.find(v => v.id === selectedVehicle.id);
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
      ]).then(([docs, srvs]) => {
        setDocuments(docs);
        setServices(srvs);
      }).catch(err => console.warn('Failed to load vehicle details', err));
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
      // Reset form
      setNewMake('');
      setNewModel('');
      setNewPlate('');
      setNewVin('');
    } catch (err: any) {
      alert(`Could not create vehicle: ${err.message}`);
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
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!selectedVehicle) return;
    if (!window.confirm('Delete this document?')) return;
    try {
      await vehicleApi.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      alert(`Could not delete document: ${err.message}`);
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
    } catch (err: any) {
      alert(`Could not save service record: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <EmergencyDisclaimerBanner dismissible={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">Encrypted Storage</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Vehicle Vault</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage your vehicles, policies, emissions (PUC) certificates, and service logs with proactive expiry tracking.
            </p>
          </div>

          <button
            onClick={() => setAddVehicleOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-2 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Vehicles Pill Selector */}
        {vehicles.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6">
            {vehicles.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`px-4 py-3 rounded-2xl border text-left flex items-center gap-3 shrink-0 transition-all ${
                  selectedVehicle?.id === v.id
                    ? 'bg-slate-900 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${selectedVehicle?.id === v.id ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block text-white">
                    {v.year} {v.make} {v.model}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{v.licensePlate} {v.primary ? '• Primary' : ''}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedVehicle ? (
          <div className="space-y-8">
            {/* Vehicle Profile Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </h2>
                    {selectedVehicle.primary && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Plate: <strong className="text-slate-200">{selectedVehicle.licensePlate}</strong> • VIN: {selectedVehicle.vin || 'Not specified'} • Fuel: {selectedVehicle.fuelType}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddDocOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload Document</span>
                  </button>
                  <button
                    onClick={() => setAddServiceOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>Log Service</span>
                  </button>
                </div>
              </div>

              {/* Expiry Overview Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Insurance Coverage</span>
                  <div className="font-bold text-sm text-white">
                    {selectedVehicle.insuranceProvider || 'State Farm Mutual'}
                  </div>
                  <span className="text-[11px] font-mono text-slate-300 block">
                    Policy: {selectedVehicle.insurancePolicyNumber || 'POL-7821940-SF'}
                  </span>
                  {selectedVehicle.insuranceExpiryDate && (
                    <span className="text-[10px] font-semibold text-amber-400 block mt-1">
                      Expires: {selectedVehicle.insuranceExpiryDate}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Emissions / PUC Certificate</span>
                  <div className="font-bold text-sm text-white">
                    {selectedVehicle.pucExpiryDate ? `Valid until ${selectedVehicle.pucExpiryDate}` : 'Inspection Current'}
                  </div>
                  <span className="text-[10px] text-emerald-400 block mt-1">Status: Active</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Manufacturer Warranty</span>
                  <div className="font-bold text-sm text-white">
                    {selectedVehicle.warrantyExpiryDate ? `Expires ${selectedVehicle.warrantyExpiryDate}` : 'Powertrain & Roadside'}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Towing coverage eligible</span>
                </div>
              </div>
            </div>

            {/* 2 Column: Documents & Service Records */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Documents Section */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Stored Vault Documents</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{documents.length} files</span>
                </div>

                {documents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No documents uploaded. Click "Upload Document" to protect insurance and PUC files.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="truncate max-w-[70%]">
                          <span className="font-bold text-white block truncate">{doc.fileName}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{doc.documentType}</span>
                            {doc.expiryDate && (
                              <span className="text-amber-400">Exp: {doc.expiryDate}</span>
                            )}
                            <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Maintenance & Service History */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-750 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Service & Repair History</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{services.length} records</span>
                </div>

                {services.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No service records logged yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {services.map(rec => (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{rec.serviceCenter || 'Service Center'}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{rec.serviceDate}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{rec.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>Mileage: {rec.mileage ? `${rec.mileage.toLocaleString()} mi` : 'N/A'}</span>
                          {rec.cost && <span className="font-bold text-emerald-400">${rec.cost.toFixed(2)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <Car className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Vehicles in Vault</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add your car or motorcycle to keep track of maintenance and emergency roadside coverage.
            </p>
            <button
              onClick={() => setAddVehicleOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}
      </main>

      {/* Add Vehicle Modal */}
      {addVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Add Vehicle to Vault</h3>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={newMake}
                    onChange={e => setNewMake(e.target.value)}
                    placeholder="e.g. Tesla"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                    placeholder="e.g. Model Y"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={newYear}
                    onChange={e => setNewYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">License Plate</label>
                  <input
                    type="text"
                    required
                    value={newPlate}
                    onChange={e => setNewPlate(e.target.value)}
                    placeholder="e.g. 7XYZ890"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">VIN (Optional)</label>
                  <input
                    type="text"
                    value={newVin}
                    onChange={e => setNewVin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fuel Type</label>
                  <select
                    value={newFuel}
                    onChange={e => setNewFuel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  >
                    <option value="PETROL">Petrol / Gasoline</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ELECTRIC">Electric (EV)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block">Insurance Details:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={newInsProvider}
                      onChange={e => setNewInsProvider(e.target.value)}
                      placeholder="Insurance Provider"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newInsPolicy}
                      onChange={e => setNewInsPolicy(e.target.value)}
                      placeholder="Policy Number"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Insurance Expiry Date</label>
                    <input
                      type="date"
                      value={newInsExpiry}
                      onChange={e => setNewInsExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">PUC / Emissions Expiry</label>
                    <input
                      type="date"
                      value={newPucExpiry}
                      onChange={e => setNewPucExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddVehicleOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-glow-emerald"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {addDocOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Upload Vehicle Document</h3>
            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                >
                  <option value="INSURANCE">Insurance Policy / Card</option>
                  <option value="PUC">Pollution / Emissions (PUC)</option>
                  <option value="REGISTRATION">Registration (RC / Title)</option>
                  <option value="WARRANTY">Extended Warranty Policy</option>
                  <option value="SERVICE_INVOICE">Service Center Invoice</option>
                  <option value="OTHER">Other Vehicle Document</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Policy / Document Number</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  placeholder="e.g. POL-981240"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={docExpiry}
                  onChange={e => setDocExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Select File</label>
                <input
                  type="file"
                  required
                  onChange={e => setDocFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddDocOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docUploading || !docFile}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold shadow-glow-emerald"
                >
                  {docUploading ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Record Modal */}
      {addServiceOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Log Service / Maintenance</h3>
            <form onSubmit={handleAddService} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Service Date</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={e => setServiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Odometer (Mileage)</label>
                  <input
                    type="number"
                    value={serviceMileage}
                    onChange={e => setServiceMileage(e.target.value)}
                    placeholder="e.g. 35000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Service Center / Mechanic</label>
                <input
                  type="text"
                  value={serviceCenter}
                  onChange={e => setServiceCenter(e.target.value)}
                  placeholder="e.g. City Toyota Center"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Work Description</label>
                <textarea
                  rows={2}
                  required
                  value={serviceDesc}
                  onChange={e => setServiceDesc(e.target.value)}
                  placeholder="Synthetic oil change, brake pads inspected, battery tested..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cost ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={serviceCost}
                  onChange={e => setServiceCost(e.target.value)}
                  placeholder="e.g. 189.50"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddServiceOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-glow-emerald"
                >
                  Record Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleVaultPage;
