import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { incidentApi } from '../api/incidentApi';
import { vehicleApi } from '../api/vehicleApi';
import { aiApi } from '../api/aiApi';
import { Vehicle, IncidentAssessmentResponse, IncidentType } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import {
  ShieldAlert,
  Wrench,
  Car,
  MapPin,
  Compass,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Send,
  Navigation,
  ArrowRight,
  Info,
} from 'lucide-react';

export const ReportIncidentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode: Breakdown vs Accident
  const initialType: IncidentType = (searchParams.get('type') as IncidentType) || 'VEHICLE_BREAKDOWN';
  const [incidentType, setIncidentType] = useState<IncidentType>(initialType);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  // Incident Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Safety checks
  const [injuriesReported, setInjuriesReported] = useState(false);
  const [onActiveRoadway, setOnActiveRoadway] = useState(false);

  // Explicit Location State
  const [locationSharedExplicitly, setLocationSharedExplicitly] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Live Assessment Preview
  const [assessmentPreview, setAssessmentPreview] = useState<IncidentAssessmentResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    vehicleApi.getAll().then(list => {
      setVehicles(list);
      const primary = list.find(v => v.primary);
      if (primary) setSelectedVehicleId(primary.id);
      else if (list.length > 0) setSelectedVehicleId(list[0].id);
    }).catch(err => console.warn('Could not load vehicles', err));
  }, []);

  const breakdownSymptoms = [
    'Engine Overheating',
    'White Steam from Hood',
    'Flat Tire / Blowout',
    'Dead Battery / Fast Clicking',
    'Smoke or Burning Smell',
    'Engine Cut Off Suddenly',
    'Brakes Squealing / Low Pressure',
    'Colored Fluid Leak Under Front',
  ];

  const accidentSymptoms = [
    'Rear-End Impact',
    'Side Impact / T-Bone',
    'Airbags Deployed',
    'Vehicle Inoperable / Wheel Damaged',
    'Multiple Cars Involved',
    'Spun Out on Wet Road',
    'Hazardous Fluid Pooling',
    'Minor Fender Scrape',
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  // Explicit GPS Request Handler
  const handleRequestLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationSharedExplicitly(true);
        setGeoLocating(false);
        // Fallback default address text with coordinates
        if (!address) {
          setAddress(`GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (Accurate to ${Math.round(position.coords.accuracy)}m)`);
        }
      },
      (error) => {
        setGeoLocating(false);
        setLocationSharedExplicitly(false);
        setGeoError(`Location access denied or unavailable (${error.message}). You can type the landmark or highway exit manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Live Triage Assessment Preview
  const handlePreviewTriage = async () => {
    if (!description.trim() && selectedSymptoms.length === 0) return;
    setPreviewLoading(true);

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    try {
      const res = await aiApi.assess({
        incidentType,
        description: description || selectedSymptoms.join(', '),
        symptoms: selectedSymptoms,
        vehicleDetails: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : undefined,
        injuriesReported,
        onActiveRoadway,
        locationDescription: address,
      });
      setAssessmentPreview(res);
      if (!title) {
        setTitle(res.summary.length > 60 ? res.summary.substring(0, 57) + '...' : res.summary);
      }
    } catch (err) {
      console.warn('Preview triage error', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && selectedSymptoms.length === 0) {
      alert('Please provide a description or select symptoms.');
      return;
    }

    setSubmitting(true);
    try {
      const generatedTitle = title.trim() || (incidentType === 'VEHICLE_ACCIDENT' ? 'Vehicle Collision Incident' : 'Roadside Breakdown');
      const combinedDescription = description.trim() +
        (selectedSymptoms.length > 0 ? ` [Symptoms: ${selectedSymptoms.join(', ')}]` : '');

      const incident = await incidentApi.create({
        vehicleId: selectedVehicleId || undefined,
        incidentType,
        title: generatedTitle,
        description: combinedDescription,
        address: address || undefined,
        latitude: locationSharedExplicitly && latitude ? latitude : undefined,
        longitude: locationSharedExplicitly && longitude ? longitude : undefined,
        locationSharedExplicitly,
        symptoms: selectedSymptoms,
        injuriesReported,
        onActiveRoadway,
      });

      // Redirect directly to the interactive protocol cockpit
      navigate(`/incidents/${incident.id}`);
    } catch (err: any) {
      alert(`Could not report incident: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <EmergencyDisclaimerBanner />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Report Flow</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Step 1 of 2: Situational Intake</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Report an Incident</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Provide details below. Our triage engine will instantly generate prioritized safety instructions, evidence checklists, and assistance options.
          </p>
        </div>

        {/* Severe Injury Prompt Banner if injuries reported */}
        {injuriesReported && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/90 border-2 border-red-500 shadow-glow-red animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">BODILY INJURIES REPORTED</h4>
                <p className="text-xs text-red-200">
                  Do NOT delay for app triage. Call professional emergency dispatch immediately.
                </p>
              </div>
            </div>
            <a
              href="tel:911"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 911 / 112 Now</span>
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Type Switcher */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              1. Incident Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIncidentType('VEHICLE_BREAKDOWN')}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  incidentType === 'VEHICLE_BREAKDOWN'
                    ? 'bg-amber-950/50 border-amber-500 text-amber-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${incidentType === 'VEHICLE_BREAKDOWN' ? 'bg-amber-900 text-amber-300' : 'bg-slate-900 text-slate-500'}`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block text-white">Vehicle Breakdown</span>
                  <span className="text-xs text-slate-400">Overheating, flat tire, dead battery, fluid leak, mechanical stall.</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIncidentType('VEHICLE_ACCIDENT')}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  incidentType === 'VEHICLE_ACCIDENT'
                    ? 'bg-red-950/50 border-red-500 text-red-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${incidentType === 'VEHICLE_ACCIDENT' ? 'bg-red-900 text-red-300' : 'bg-slate-900 text-slate-500'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block text-white">Vehicle Accident</span>
                  <span className="text-xs text-slate-400">Collision, fender bender, airbag deployment, side scrape, spin out.</span>
                </div>
              </button>
            </div>
          </div>

          {/* Vehicle Selector */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Select Involved Vehicle
            </label>
            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-400">
                No saved vehicles found. You can add vehicle details after reporting in the Vehicle Vault.
              </p>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model} — Plate: {v.licensePlate} {v.primary ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Symptom Chips & Description */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              3. What is happening? (Symptoms & Description)
            </label>

            {/* Chips */}
            <div>
              <span className="text-xs text-slate-400 block mb-2">Tap common symptoms to add:</span>
              <div className="flex flex-wrap gap-2">
                {(incidentType === 'VEHICLE_ACCIDENT' ? accidentSymptoms : breakdownSymptoms).map((sym, i) => {
                  const active = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-glow-emerald'
                          : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Natural language description */}
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Natural-language description:
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Engine started sputtering at 60mph and high temperature gauge illuminated. Pulled over safely to shoulder..."
                className="w-full p-3.5 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Incident Title (Auto-suggested or manual) */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Incident Headline (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Engine Overheating on I-280 Northbound"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Safety Check Questions */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              4. Safety Assessment Questions
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-750">
              <input
                type="checkbox"
                checked={injuriesReported}
                onChange={e => setInjuriesReported(e.target.checked)}
                className="mt-1 rounded bg-slate-900 border-slate-700 text-red-500 focus:ring-red-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">Are any persons injured or in physical distress?</span>
                <span className="text-slate-400">If checked, LIFELINK OS immediately sets urgency to CRITICAL and provides 911 dispatch guidance.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-750">
              <input
                type="checkbox"
                checked={onActiveRoadway}
                onChange={e => setOnActiveRoadway(e.target.checked)}
                className="mt-1 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">Is the vehicle positioned in an active traffic lane or high-speed highway shoulder?</span>
                <span className="text-slate-400">Prioritizes emergency hazards, hazard blinkers, and evacuation behind highway barriers.</span>
              </div>
            </label>
          </div>

          {/* Location Permission & Sharing */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  5. Incident Location (Consent-Driven)
                </label>
                <p className="text-xs text-slate-400">
                  Location is requested only upon your explicit action. We never track silently.
                </p>
              </div>
              {locationSharedExplicitly ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  GPS Shared
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-500">Not shared</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={geoLocating}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Navigation className={`w-4 h-4 text-emerald-400 ${geoLocating ? 'animate-spin' : ''}`} />
                <span>{geoLocating ? 'Acquiring GPS...' : 'Share Current Location (GPS)'}</span>
              </button>

              <div className="flex-1">
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Or enter highway exit / street address (e.g. I-280 North at Page Mill Rd)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {geoError && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{geoError}</span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={handlePreviewTriage}
              disabled={previewLoading || (!description.trim() && selectedSymptoms.length === 0)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{previewLoading ? 'Evaluating...' : 'Preview Triage Assessment'}</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-glow-red flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <span>Generating Protocol & Dispatching...</span>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Generate Incident Cockpit Protocol</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Preview Card (if generated) */}
        {assessmentPreview && (
          <div className="mt-8 p-6 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Preliminary AI Triage Assessment</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-white">
                Urgency: {assessmentPreview.urgency}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {assessmentPreview.summary}
            </p>

            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-100">
              <strong className="text-red-300 block mb-1">Immediate Safety Protocol:</strong>
              <ul className="list-disc pl-4 space-y-1">
                {assessmentPreview.immediateSafetySteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportIncidentPage;
