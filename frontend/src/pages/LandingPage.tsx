import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiApi } from '../api/aiApi';
import { IncidentAssessmentResponse } from '../types';
import {
  ShieldAlert,
  Car,
  Wrench,
  Sparkles,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Lock,
  ChevronRight,
  AlertTriangle,
  Send,
  RotateCcw,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, loginDemo } = useAuth();
  const navigate = useNavigate();

  // Interactive Live Triage Playground state
  const [testDescription, setTestDescription] = useState('My car is blowing thick white steam from under the hood and the red temperature light came on.');
  const [testType, setTestType] = useState<'VEHICLE_BREAKDOWN' | 'VEHICLE_ACCIDENT'>('VEHICLE_BREAKDOWN');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<IncidentAssessmentResponse | null>(null);

  const sampleScenarios = [
    { label: 'Radiator Overheat', type: 'VEHICLE_BREAKDOWN', text: 'Engine temperature spiked into the red on highway shoulder. Hissing white steam from grill.' },
    { label: 'Highway Flat Tire', type: 'VEHICLE_BREAKDOWN', text: 'Rear tire blew out at 65mph. Managed to pull onto left shoulder, traffic passing fast.' },
    { label: 'Intersection Fender Bender', type: 'VEHICLE_ACCIDENT', text: 'Rear-ended at a red light. Both drivers out of vehicle, no bleeding reported, bumper crushed.' },
    { label: 'Dead Battery at Night', type: 'VEHICLE_BREAKDOWN', text: 'Turned key and heard fast clicking sound. Headlights are very dim, engine will not turn over.' },
  ];

  const handleSimulateTriage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testDescription.trim()) return;

    setIsSimulating(true);
    try {
      const res = await aiApi.assess({
        incidentType: testType,
        description: testDescription,
        onActiveRoadway: testDescription.toLowerCase().includes('highway') || testDescription.toLowerCase().includes('shoulder'),
        injuriesReported: testDescription.toLowerCase().includes('bleed') || testDescription.toLowerCase().includes('hurt'),
      });
      setSimulationResult(res);
    } catch (err) {
      console.warn('Simulation failed', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDemoLaunch = async () => {
    await loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-750 text-xs font-semibold text-emerald-400 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIFELINK OS 1.0 • Intelligent Roadside Response</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
            When something goes wrong, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              know what to do next.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            A calm, dependable operating system for vehicle breakdowns and accidents. Real-time safety triage, actionable checklists, verified assistance coordination, and digital vehicle vaults.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
            <button
              onClick={() => navigate(isAuthenticated ? '/report' : '/login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-glow-red flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Report an Incident Now</span>
            </button>

            <button
              onClick={handleDemoLaunch}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-400 font-semibold text-sm border border-emerald-500/30 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Demo Quick-Login</span>
            </button>
          </div>

          {/* Key Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="text-emerald-400 font-bold text-lg mb-1">Safety First</div>
              <p className="text-xs text-slate-400 leading-relaxed">Immediate physical safety prioritized before documentation or claims.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="text-teal-400 font-bold text-lg mb-1">AI Triage</div>
              <p className="text-xs text-slate-400 leading-relaxed">Validated structured JSON output with offline deterministic fallback.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="text-cyan-400 font-bold text-lg mb-1">Vehicle Vault</div>
              <p className="text-xs text-slate-400 leading-relaxed">Insurance policies, PUC, warranty, and service records in one secure vault.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="text-purple-400 font-bold text-lg mb-1">Explicit Consent</div>
              <p className="text-xs text-slate-400 leading-relaxed">Zero silent geolocation tracking. Explicit confirmation for all dispatch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive AI Triage Simulator Sandbox */}
      <section id="triage" className="py-16 bg-slate-900/50 border-y border-slate-850">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-medium mb-3 border border-emerald-800/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Triage Engine Preview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Test how LIFELINK OS evaluates emergency scenarios
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
              Describe any breakdown or collision in plain English. The AI assessment engine provides immediate triage, safety steps, evidence guidance, and assistance needs.
            </p>
          </div>

          {/* Quick Scenario Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-xs text-slate-400 mr-2">Try a scenario:</span>
            {sampleScenarios.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTestType(sc.type as any);
                  setTestDescription(sc.text);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Interactive Input Form */}
          <div className="bg-slate-900 border border-slate-750 rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
            <form onSubmit={handleSimulateTriage} className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTestType('VEHICLE_BREAKDOWN')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      testType === 'VEHICLE_BREAKDOWN'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Vehicle Breakdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestType('VEHICLE_ACCIDENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      testType === 'VEHICLE_ACCIDENT'
                        ? 'bg-red-950 text-red-300 border border-red-700/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Vehicle Accident
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">Natural Language or Structured Input</span>
              </div>

              <textarea
                value={testDescription}
                onChange={e => setTestDescription(e.target.value)}
                rows={3}
                placeholder="Describe what happened (e.g., 'Flat tire on highway shoulder', 'Steam from engine', 'Minor fender bender')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Deterministic fallback active if no OpenAI API key is configured.
                </span>
                <button
                  type="submit"
                  disabled={isSimulating || !testDescription.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-glow-emerald flex items-center gap-2 transition-all ml-auto"
                >
                  {isSimulating ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Situation...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Simulate Triage Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div className="bg-slate-850 border border-slate-700 rounded-2xl p-6 shadow-2xl animate-fade-in space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-750">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Triage Result:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      simulationResult.urgency === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-500 animate-pulse'
                        : simulationResult.urgency === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500'
                        : 'bg-yellow-950 text-yellow-300 border border-yellow-500'
                    }`}
                  >
                    URGENCY: {simulationResult.urgency}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] bg-slate-900 text-slate-300 border border-slate-700">
                    Need: {simulationResult.assistanceNeed}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Engine: {simulationResult.evaluatedBy}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Situational Summary</h4>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">{simulationResult.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Immediate Safety Steps */}
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40">
                  <h5 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Immediate Safety Steps
                  </h5>
                  <ul className="space-y-1.5 text-xs text-red-100">
                    {simulationResult.immediateSafetySteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-750">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Recommended Actions
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {simulationResult.recommendedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Evidence & Documents */}
              {(simulationResult.evidenceToCollect.length > 0 || simulationResult.documentsToCheck.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {simulationResult.evidenceToCollect.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <span className="font-semibold text-slate-300 block mb-1.5">Evidence to Collect (Only When Safe):</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        {simulationResult.evidenceToCollect.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {simulationResult.documentsToCheck.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <span className="font-semibold text-slate-300 block mb-1.5">Relevant Vault Documents:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        {simulationResult.documentsToCheck.map((doc, i) => (
                          <li key={i}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Mandatory Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <strong className="text-slate-300">Disclaimer:</strong> {simulationResult.disclaimer}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            Built for High-Stakes Situations
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            During an incident, cognitive bandwidth is limited. LIFELINK OS delivers high-clarity guidance with minimal friction and maximum privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-800/40">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Step-by-Step Cockpit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prioritized checklist categorized by immediate bodily safety, factual evidence capture, and insurance readiness. Interactive checkboxes ensure no step is missed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-950 flex items-center justify-center text-blue-400 mb-4 border border-blue-800/40">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Vehicle & Document Vault</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Store VIN numbers, license plates, insurance policy IDs, PUC certificates, and service records. Receive proactive 30-day alerts before policies expire.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400 mb-4 border border-purple-800/40">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Transparent Privacy & Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Location is requested only with your explicit click. Passwords use BCrypt hashing, JWT tokens rotate cleanly, and files stay protected behind owner authentication.
            </p>
          </div>
        </div>
      </section>

      {/* Extensibility Architecture Section */}
      <section className="py-14 bg-slate-900/40 border-t border-slate-850">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold text-white mb-3">Extensible Architecture</h3>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            LIFELINK OS is engineered so additional incident scopes—such as Home water leaks and power failure, Travel transit disruptions, and Device data loss—plug into the same structured triage and action engine.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300">
              Vehicle Incidents (Active)
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              Home Emergencies (Next)
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              Travel & Transit (Next)
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              Device & Document Loss (Next)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
