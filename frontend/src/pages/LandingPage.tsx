import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiApi } from '../api/aiApi';
import { IncidentAssessmentResponse } from '../types';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import {
  ShieldAlert,
  Car,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Clock,
  Shield,
  AlertTriangle,
  Send,
  XCircle,
  Info,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, loginDemo } = useAuth();
  const navigate = useNavigate();

  // Interactive Live Triage Playground state
  const [testDescription, setTestDescription] = useState(
    'My car is blowing thick white steam from under the hood and the red temperature light came on.'
  );
  const [testType, setTestType] = useState<'VEHICLE_BREAKDOWN' | 'VEHICLE_ACCIDENT'>('VEHICLE_BREAKDOWN');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<IncidentAssessmentResponse | null>(null);

  const sampleScenarios = [
    {
      label: 'Radiator Overheating',
      type: 'VEHICLE_BREAKDOWN' as const,
      text: 'Engine temperature spiked into the red on highway shoulder. Hissing white steam from grill.',
    },
    {
      label: 'Highway Flat Tire',
      type: 'VEHICLE_BREAKDOWN' as const,
      text: 'Rear tire blew out at 65mph. Managed to pull onto left shoulder, traffic passing fast.',
    },
    {
      label: 'Intersection Collision',
      type: 'VEHICLE_ACCIDENT' as const,
      text: 'Rear-ended at a traffic stop. Drivers are outside vehicles, no bleeding reported, bumper crushed.',
    },
    {
      label: 'Dead Battery at Night',
      type: 'VEHICLE_BREAKDOWN' as const,
      text: 'Turned key and heard fast clicking sound. Headlights are dim, engine will not turn over.',
    },
  ];

  const handleSimulateTriage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testDescription.trim()) return;

    setIsSimulating(true);
    try {
      const res = await aiApi.assess({
        incidentType: testType,
        description: testDescription,
        onActiveRoadway:
          testDescription.toLowerCase().includes('highway') ||
          testDescription.toLowerCase().includes('shoulder'),
        injuriesReported:
          testDescription.toLowerCase().includes('bleed') ||
          testDescription.toLowerCase().includes('hurt'),
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
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col antialiased">
      {/* Pervasive emergency disclaimer */}
      <EmergencyDisclaimerBanner dismissible={true} />

      {/* Hero Section */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Calm Preparedness Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-surface-border text-xs font-medium text-forest-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
            <span>Incident Response Operating System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-5">
            When something goes wrong, <br className="hidden sm:inline" />
            <span className="text-forest-400">know what to do next.</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            LIFELINK OS helps people find safe, clear next steps when an unexpected problem happens on the road.
            Step-by-step physical safety guidance, structured incident assessment, verified assistance dispatch, and digital document vaults.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
            <button
              onClick={() => navigate(isAuthenticated ? '/report' : '/login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-semibold text-xs sm:text-sm shadow-subtle flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Report an Incident Now</span>
            </button>

            <button
              onClick={handleDemoLaunch}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-surface-elevated hover:bg-surface-800 active:bg-surface-850 text-forest-300 font-semibold text-xs sm:text-sm border border-surface-border flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-forest-400" />
              <span>Demo Quick-Login</span>
            </button>
          </div>

          {/* Calm key commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-3xl mx-auto pt-4">
            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border">
              <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-400" />
                <span>Clarity Under Stress</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Plain language, immediate physical safety first, and prioritized step checklists.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border">
              <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-forest-400" />
                <span>Explicit Consent</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero silent location tracking. You explicitly authorize roadside dispatch actions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-card border border-surface-border">
              <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-forest-400" />
                <span>Document Readiness</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Insurance policy numbers, PUC, and emergency contacts accessible instantly offline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scope Clarification: What LIFELINK Does vs What it Does NOT Do */}
      <section className="py-12 bg-surface-900/50 border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Understanding LIFELINK OS Scope & Safety Boundaries
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-1">
              Clear expectations keep you safe. Here is exactly how LIFELINK assists you and what falls outside our scope.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What LIFELINK Does */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border text-left">
              <div className="flex items-center gap-2 mb-3 text-forest-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm sm:text-base font-bold text-white">What LIFELINK OS Does</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-forest-400 font-bold">•</span>
                  <span>Provides immediate physical safety checklists (hazard lights, shoulder exit, barriers).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-400 font-bold">•</span>
                  <span>Structures incident symptoms into calm, prioritized action checklists.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-400 font-bold">•</span>
                  <span>Guides safe evidence gathering (photos, notes, driver exchange) only when traffic is secure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-400 font-bold">•</span>
                  <span>Maintains vehicle records, insurance policy numbers, and PUC validity dates in a vault.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-forest-400 font-bold">•</span>
                  <span>Coordinates verified roadside assistance dispatch with explicit user confirmation.</span>
                </li>
              </ul>
            </div>

            {/* What LIFELINK Does NOT Do */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border text-left">
              <div className="flex items-center gap-2 mb-3 text-red-400">
                <XCircle className="w-5 h-5" />
                <h3 className="text-sm sm:text-base font-bold text-white">What LIFELINK OS Does NOT Do</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Not an Emergency Service:</strong> Does not replace 911, 112, or municipal police/paramedics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>No Medical or Legal Advice:</strong> Recommendations do not constitute legal liability determination or medical triage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>No Automated Dispatch Without Approval:</strong> We never share your location or call third-party providers without your explicit click.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>No Insurance Pre-Approval:</strong> Document checklists help claims filing but do not represent insurer guarantee.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Urgent Emergency Instruction Callout */}
          <div className="mt-6 p-4 rounded-xl bg-red-950/30 border border-red-800/50 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-left">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-xs text-red-200">
                <strong>Someone in immediate danger?</strong> Exit the roadway to a safe barrier and dial your local emergency number immediately.
              </span>
            </div>
            <a
              href="tel:911"
              className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-semibold text-xs shrink-0 flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 911 / 112 Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive AI Triage Engine Simulator */}
      <section id="triage" className="py-14 border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card border border-surface-border text-forest-300 text-xs font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5 text-forest-400" />
              <span>Interactive Decision Engine Preview</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Test how LIFELINK OS assesses incidents
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
              Select a sample scenario or describe an incident to preview real-time safety triage and structured actions.
            </p>
          </div>

          {/* Quick Scenario Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-xs text-slate-400 mr-1">Sample Scenarios:</span>
            {sampleScenarios.map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setTestType(sc.type);
                  setTestDescription(sc.text);
                  setSimulationResult(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  testDescription === sc.text
                    ? 'bg-forest-950 border-forest-600 text-forest-200'
                    : 'bg-surface-card border-surface-border text-slate-300 hover:bg-surface-elevated'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Simulation Input Box */}
          <div className="bg-surface-card border border-surface-border rounded-2xl p-5 shadow-subtle mb-6 text-left">
            <form onSubmit={handleSimulateTriage} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-xs font-medium text-slate-300">
                  Incident Type & Description
                </label>
                <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-lg border border-surface-border">
                  <button
                    type="button"
                    onClick={() => setTestType('VEHICLE_BREAKDOWN')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      testType === 'VEHICLE_BREAKDOWN'
                        ? 'bg-surface-elevated text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Breakdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestType('VEHICLE_ACCIDENT')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      testType === 'VEHICLE_ACCIDENT'
                        ? 'bg-surface-elevated text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Accident / Collision
                  </button>
                </div>
              </div>

              <textarea
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                rows={3}
                placeholder="Describe what happened (e.g. 'Flat tire on highway shoulder', 'Steam from radiator')..."
                className="w-full bg-surface-900 border border-surface-border rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 transition-colors"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Deterministic fallback active if AI backend is offline.
                </span>
                <button
                  type="submit"
                  disabled={isSimulating || !testDescription.trim()}
                  className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 transition-colors"
                >
                  {isSimulating ? (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating scenario...</span>
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
            <div className="bg-surface-card border border-surface-border rounded-2xl p-5 sm:p-6 text-left space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Assessment Result:
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      simulationResult.urgency === 'CRITICAL'
                        ? 'bg-red-950 text-red-200 border border-red-700'
                        : simulationResult.urgency === 'HIGH'
                        ? 'bg-amber-950 text-amber-200 border border-amber-700'
                        : 'bg-surface-elevated text-slate-300 border border-surface-border'
                    }`}
                  >
                    Urgency: {simulationResult.urgency}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] bg-surface-elevated text-slate-300 border border-surface-border">
                    Assistance: {simulationResult.assistanceNeed}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Engine: {simulationResult.evaluatedBy}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Summary
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {simulationResult.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Immediate Safety Steps */}
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40">
                  <h5 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
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
                <div className="p-4 rounded-xl bg-surface-elevated border border-surface-border">
                  <h5 className="text-xs font-bold text-forest-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-400" />
                    Recommended Actions
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {simulationResult.recommendedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-forest-400 font-bold">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Evidence & Documents */}
              {(simulationResult.evidenceToCollect.length > 0 ||
                simulationResult.documentsToCheck.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {simulationResult.evidenceToCollect.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-surface-900 border border-surface-border text-xs">
                      <span className="font-semibold text-slate-300 block mb-1">
                        Evidence to Collect (Only When Safe):
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        {simulationResult.evidenceToCollect.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {simulationResult.documentsToCheck.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-surface-900 border border-surface-border text-xs">
                      <span className="font-semibold text-slate-300 block mb-1">
                        Relevant Vault Documents:
                      </span>
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
              <div className="p-3 rounded-xl bg-surface-950 border border-surface-border text-[11px] text-slate-400">
                <strong className="text-slate-300">Disclaimer:</strong> {simulationResult.disclaimer}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-surface-card border-t border-surface-border text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-forest-400" />
            <span className="font-semibold text-white">LIFELINK OS</span>
            <span>— Intelligent roadside safety and response protocol.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/login" className="hover:text-white">Sign In</Link>
            <Link to="/register" className="hover:text-white">Create Account</Link>
            <a href="tel:911" className="text-red-400 font-semibold hover:text-red-300">
              Emergency SOS: 911
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
