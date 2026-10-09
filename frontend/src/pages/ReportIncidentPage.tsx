import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { incidentApi } from '../api/incidentApi';
import { vehicleApi } from '../api/vehicleApi';
import { aiApi } from '../api/aiApi';
import { Vehicle, IncidentAssessmentResponse, IncidentType } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { ProgressIndicator } from '../components/design-system/ProgressIndicator';
import { Button } from '../components/design-system/Button';
import { Checkbox } from '../components/design-system/Checkbox';
import {
  Wrench,
  MapPin,
  AlertTriangle,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Clock,
  Send,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

export const ReportIncidentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard Step (0 to 4: 0=Type, 1=Symptoms/Description, 2=Vehicle, 3=Safety & Location, 4=Review & Submit)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Type: Breakdown vs Accident
  const paramType = searchParams.get('type') as IncidentType | null;
  const initialType: IncidentType =
    paramType === 'VEHICLE_ACCIDENT' ? 'VEHICLE_ACCIDENT' : 'VEHICLE_BREAKDOWN';
  const [incidentType, setIncidentType] = useState<IncidentType>(initialType);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [customVehicleInfo, setCustomVehicleInfo] = useState<string>('');

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
    vehicleApi
      .getAll()
      .then((list) => {
        setVehicles(list);
        const primary = list.find((v) => v.primary);
        if (primary) setSelectedVehicleId(primary.id);
        else if (list.length > 0) setSelectedVehicleId(list[0].id);
      })
      .catch((err) => console.warn('Could not load vehicles', err));
  }, []);

  const breakdownSymptoms = [
    'Engine Overheating',
    'White Steam from Hood',
    'Flat Tire / Blowout',
    'Dead Battery / Rapid Clicking',
    'Smoke or Burning Smell',
    'Engine Cut Off Suddenly',
    'Brakes Squealing / Low Pressure',
    'Fluid Leak Under Front',
  ];

  const accidentSymptoms = [
    'Rear-End Impact',
    'Side Impact / T-Bone',
    'Airbags Deployed',
    'Vehicle Inoperable / Wheel Jammed',
    'Multiple Cars Involved',
    'Spun Out on Wet Road',
    'Fluid Pooling on Roadway',
    'Minor Fender Scrape',
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      const updated = prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom];

      // Auto-generate a title if empty
      if (!title || title.startsWith('Breakdown:') || title.startsWith('Accident:')) {
        const prefix = incidentType === 'VEHICLE_ACCIDENT' ? 'Accident' : 'Breakdown';
        if (updated.length > 0) {
          setTitle(`${prefix}: ${updated.slice(0, 2).join(', ')}`);
        }
      }
      return updated;
    });
  };

  // Explicit Location Sharing Handler
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
        if (!address) {
          setAddress(
            `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(
              4
            )} (Accurate to ${Math.round(position.coords.accuracy)}m)`
          );
        }
      },
      (error) => {
        setGeoLocating(false);
        setLocationSharedExplicitly(false);
        setGeoError(
          `Location access was denied or timed out (${error.message}). You can type the street, mile marker, or highway exit manually.`
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Generate live assessment preview when reaching review step
  const handleFetchAssessmentPreview = async () => {
    setPreviewLoading(true);
    try {
      const combinedText = [
        title,
        description,
        selectedSymptoms.length > 0 ? `Reported symptoms: ${selectedSymptoms.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('. ');

      const res = await aiApi.assess({
        incidentType,
        description: combinedText || 'Vehicle breakdown roadside triage needed.',
        onActiveRoadway,
        injuriesReported,
      });
      setAssessmentPreview(res);
    } catch (err) {
      console.warn('Could not generate assessment preview', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      // If moving from step 0, ensure a default title exists
      if (!title) {
        setTitle(
          incidentType === 'VEHICLE_ACCIDENT'
            ? 'Vehicle Collision'
            : 'Vehicle Mechanical Breakdown'
        );
      }
    }
    if (currentStep === 3) {
      // Transitioning to review step
      handleFetchAssessmentPreview();
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Submit Incident
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const selectedVeh = vehicles.find((v) => v.id === selectedVehicleId);
      const vehicleInfoString = selectedVeh
        ? `${selectedVeh.year} ${selectedVeh.make} ${selectedVeh.model} (${selectedVeh.licensePlate})`
        : customVehicleInfo || undefined;

      const created = await incidentApi.create({
        vehicleId: selectedVehicleId || undefined,
        incidentType,
        title: title || (incidentType === 'VEHICLE_ACCIDENT' ? 'Vehicle Collision' : 'Vehicle Breakdown'),
        description: [
          description,
          selectedSymptoms.length > 0 ? `Symptoms: ${selectedSymptoms.join(', ')}` : '',
          vehicleInfoString ? `Vehicle: ${vehicleInfoString}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
        address: address || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        locationSharedExplicitly,
        symptoms: selectedSymptoms,
        injuriesReported,
        onActiveRoadway,
      });

      navigate(`/incidents/${created.id}`);
    } catch (err: any) {
      alert(`Could not create incident record: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { id: 'type', label: 'Incident Type', description: 'Breakdown or accident' },
    { id: 'symptoms', label: 'What Happened', description: 'Symptoms & description' },
    { id: 'vehicle', label: 'Vehicle Details', description: 'Select car' },
    { id: 'safety', label: 'Safety & Location', description: 'Triage & location' },
    { id: 'review', label: 'Review & Actions', description: 'Cockpit assessment' },
  ];

  return (
    <div className="text-slate-100">
      <EmergencyDisclaimerBanner dismissible={true} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Progress Navigation Indicator */}
        <div className="mb-8">
          <ProgressIndicator steps={stepsList} currentStepIndex={currentStep} />
        </div>

        {/* Step 1: Choosing Incident Type */}
        {currentStep === 0 && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                Step 1 of 5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                What type of problem are you experiencing?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Selecting the category activates the correct roadside safety triage protocol.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Breakdown Option */}
              <div
                onClick={() => setIncidentType('VEHICLE_BREAKDOWN')}
                role="radio"
                aria-checked={incidentType === 'VEHICLE_BREAKDOWN'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') setIncidentType('VEHICLE_BREAKDOWN');
                }}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  incidentType === 'VEHICLE_BREAKDOWN'
                    ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/60 shadow-subtle'
                    : 'bg-surface-card border-surface-border hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 mb-3">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Vehicle Breakdown</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Mechanical issue, flat tire, battery discharge, strange noise, steam, fluid leak, or sudden stalling.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-border text-xs font-medium text-amber-400 flex items-center justify-between">
                  <span>Selected for triage</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      incidentType === 'VEHICLE_BREAKDOWN'
                        ? 'border-amber-400 bg-amber-500'
                        : 'border-surface-border'
                    }`}
                  >
                    {incidentType === 'VEHICLE_BREAKDOWN' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </div>
                </div>
              </div>

              {/* Accident Option */}
              <div
                onClick={() => setIncidentType('VEHICLE_ACCIDENT')}
                role="radio"
                aria-checked={incidentType === 'VEHICLE_ACCIDENT'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') setIncidentType('VEHICLE_ACCIDENT');
                }}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  incidentType === 'VEHICLE_ACCIDENT'
                    ? 'bg-red-950/30 border-red-500/80 ring-1 ring-red-500/60 shadow-subtle'
                    : 'bg-surface-card border-surface-border hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 mb-3">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Vehicle Accident / Collision</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Collision with another car, guardrail, ditch impact, pedestrian incident, or hit-and-run.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-border text-xs font-medium text-red-400 flex items-center justify-between">
                  <span>Selected for triage</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      incidentType === 'VEHICLE_ACCIDENT'
                        ? 'border-red-400 bg-red-500'
                        : 'border-surface-border'
                    }`}
                  >
                    {incidentType === 'VEHICLE_ACCIDENT' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Service Callout */}
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">
                Is anyone currently injured or bleeding?
              </span>
              <a
                href="tel:911"
                className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 911 / 112</span>
              </a>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Continue to Details
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Symptoms & Description */}
        {currentStep === 1 && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                Step 2 of 5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Describe symptoms and what happened
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select known symptoms to speed up triage, or write what you observe in plain words.
              </p>
            </div>

            {/* Symptom chips */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Common Symptoms (tap to select):
              </label>
              <div className="flex flex-wrap gap-2">
                {(incidentType === 'VEHICLE_ACCIDENT' ? accidentSymptoms : breakdownSymptoms).map(
                  (symptom) => {
                    const isSelected = selectedSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-forest-950 border-forest-600 text-forest-200'
                            : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {symptom}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Incident Title */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Summary Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Engine Overheating on Highway 101"
                className="w-full bg-surface-900 border border-surface-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Detailed Observation (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what you see, hear, or smell (e.g. 'Turned off AC, temperature needle went into red, white smoke from front grille')..."
                className="w-full bg-surface-900 border border-surface-border rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <Button
                variant="quiet"
                size="md"
                onClick={handlePrevStep}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Continue to Vehicle
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Vehicle Selection */}
        {currentStep === 2 && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                Step 3 of 5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Which vehicle is involved?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Connecting a vehicle links your insurance policy and warranty records into the incident assessment.
              </p>
            </div>

            {vehicles.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Select from Saved Vehicles:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicleId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          setCustomVehicleInfo('');
                        }}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            setSelectedVehicleId(v.id);
                            setCustomVehicleInfo('');
                          }
                        }}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-forest-950/40 border-forest-500 ring-1 ring-forest-500/50'
                            : 'bg-surface-card border-surface-border hover:border-slate-600'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">
                              {v.year} {v.make} {v.model}
                            </span>
                            {v.primary && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-950 text-forest-300 border border-forest-800/60 font-mono">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            Plate: {v.licensePlate}
                          </p>
                          {v.insuranceProvider && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              Policy: {v.insurancePolicyNumber || 'Saved'} ({v.insuranceProvider})
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-surface-border text-[11px] text-forest-400 flex items-center justify-between">
                          <span>{isSelected ? '✓ Selected' : 'Tap to select'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Other / Unregistered Vehicle input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Or enter details for another vehicle:
              </label>
              <input
                type="text"
                value={customVehicleInfo}
                onChange={(e) => {
                  setCustomVehicleInfo(e.target.value);
                  setSelectedVehicleId('');
                }}
                placeholder="e.g. 2021 Hyundai Elantra (Rental or friend's car)"
                className="w-full bg-surface-900 border border-surface-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <Button
                variant="quiet"
                size="md"
                onClick={handlePrevStep}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Continue to Safety & Location
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Safety & Location */}
        {currentStep === 3 && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                Step 4 of 5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Safety check & location sharing
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Immediate physical safety comes first. Location is only shared when you choose to.
              </p>
            </div>

            {/* Immediate bodily safety questions */}
            <div className="p-4 rounded-xl bg-surface-card border border-surface-border space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Immediate Safety Triage
              </h3>

              <div className="space-y-2">
                <Checkbox
                  checked={injuriesReported}
                  onChange={(e) => setInjuriesReported(e.target.checked)}
                  label="Are any occupants or pedestrians injured?"
                  description="If yes, an urgent prompt to dial 911 will appear at top of your incident cockpit."
                />

                <Checkbox
                  checked={onActiveRoadway}
                  onChange={(e) => setOnActiveRoadway(e.target.checked)}
                  label="Is the vehicle stuck on an active highway or blind curve?"
                  description="Prioritizes exit-behind-guardrail steps before touching your phone."
                />
              </div>

              {injuriesReported && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200 flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Injuries reported. Call emergency responders first!</span>
                  </div>
                  <a
                    href="tel:911"
                    className="px-2.5 py-1 rounded bg-red-700 hover:bg-red-600 text-white font-semibold text-xs shrink-0"
                  >
                    Dial 911
                  </a>
                </div>
              )}
            </div>

            {/* Explicit Location Sharing */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface-card border border-surface-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-forest-950 border border-forest-800/80 flex items-center justify-center text-forest-400 shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Location Sharing (Explicit Permission Only)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Why we request this: We only use your location to calculate assistance dispatch distance and copy coordinates for first responders. We never track you in the background.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  type="button"
                  variant={locationSharedExplicitly ? 'secondary' : 'primary'}
                  size="sm"
                  loading={geoLocating}
                  icon={<MapPin className="w-3.5 h-3.5" />}
                  onClick={handleRequestLocation}
                >
                  {locationSharedExplicitly
                    ? '✓ GPS Coordinates Acquired'
                    : 'Share GPS Location Now'}
                </Button>

                {locationSharedExplicitly && latitude && longitude && (
                  <span className="text-xs font-mono text-forest-300 self-center">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                )}
              </div>

              {geoError && (
                <p className="text-xs text-amber-400 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/40">
                  {geoError}
                </p>
              )}

              {/* Manual address entry */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Location Landmark, Street, or Highway Exit:
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. I-280 Northbound, Exit 12 near Woodside Rd shoulder"
                  className="w-full bg-surface-900 border border-surface-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <Button
                variant="quiet"
                size="md"
                onClick={handlePrevStep}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Review Assessment
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Triage Preview */}
        {currentStep === 4 && (
          <div className="space-y-6 text-left animate-in fade-in duration-150">
            <div>
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                Step 5 of 5
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Review & Activate Incident Cockpit
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Review your report details and preview recommended safety steps before activating response tracking.
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-surface-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-border text-xs">
                <span className="text-slate-400 font-medium">Incident Type:</span>
                <span className="font-semibold text-white">
                  {incidentType === 'VEHICLE_ACCIDENT' ? 'Accident / Collision' : 'Breakdown'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-surface-border text-xs">
                <span className="text-slate-400 font-medium">Title:</span>
                <span className="font-semibold text-white truncate max-w-xs">{title}</span>
              </div>

              {selectedSymptoms.length > 0 && (
                <div className="flex items-start justify-between pb-2 border-b border-surface-border text-xs">
                  <span className="text-slate-400 font-medium">Symptoms:</span>
                  <span className="text-slate-200 text-right max-w-xs">
                    {selectedSymptoms.join(', ')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-surface-border text-xs">
                <span className="text-slate-400 font-medium">Location:</span>
                <span className="text-slate-200 truncate max-w-xs">
                  {address || (locationSharedExplicitly ? 'GPS coordinates acquired' : 'Not specified')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Immediate Hazard:</span>
                <span
                  className={
                    injuriesReported || onActiveRoadway
                      ? 'text-red-400 font-bold'
                      : 'text-forest-400 font-medium'
                  }
                >
                  {injuriesReported
                    ? 'Injuries Reported (High Urgency)'
                    : onActiveRoadway
                    ? 'Active Roadway Shoulder'
                    : 'Clear Shoulder / Parking'}
                </span>
              </div>
            </div>

            {/* Live Triage Preview Box */}
            <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-forest-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Preliminary Triage Assessment
                  </h3>
                </div>
                {previewLoading ? (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" /> Evaluating...
                  </span>
                ) : (
                  <span className="text-[10px] text-forest-400 font-mono">
                    Engine: {assessmentPreview?.evaluatedBy || 'AI Engine'}
                  </span>
                )}
              </div>

              {assessmentPreview && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-surface-900 border border-surface-border text-xs text-slate-200">
                    <strong className="text-white block mb-0.5">Summary:</strong>
                    {assessmentPreview.summary}
                  </div>

                  {assessmentPreview.immediateSafetySteps.length > 0 && (
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-xs text-red-100">
                      <strong className="text-red-300 block mb-1">
                        Immediate Safety Actions You Will See in Cockpit:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1">
                        {assessmentPreview.immediateSafetySteps.slice(0, 3).map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Disclaimer: {assessmentPreview.disclaimer}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <Button
                variant="quiet"
                size="md"
                onClick={handlePrevStep}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="emergency"
                size="lg"
                loading={submitting}
                onClick={handleSubmit}
                icon={<Send className="w-4 h-4" />}
                iconPosition="right"
              >
                Activate Incident Cockpit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportIncidentPage;
