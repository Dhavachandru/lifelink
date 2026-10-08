import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentApi } from '../api/incidentApi';
import { vehicleApi } from '../api/vehicleApi';
import { contactApi } from '../api/contactApi';
import { Incident, Vehicle, EmergencyContact } from '../types';
import { UrgencyBadge, IncidentStatusBadge } from '../components/StatusBadge';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { OnboardingModal } from './OnboardingModal';
import {
  ShieldAlert,
  Car,
  Wrench,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Phone,
  FileText,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [incList, vehList, conList] = await Promise.all([
        incidentApi.getAll(),
        vehicleApi.getAll(),
        contactApi.getAll(),
      ]);
      setIncidents(incList);
      setVehicles(vehList);
      setContacts(conList);
    } catch (err) {
      console.warn('Dashboard data fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    if (sessionStorage.getItem('lifelink_show_onboarding') === 'true') {
      setShowOnboarding(true);
    }
  }, []);

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');
  const pastIncidents = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CANCELLED');

  // Identify documents expiring within 30 days
  const expiringVehicles = vehicles.filter(v => {
    if (!v.insuranceExpiryDate) return false;
    const expiry = new Date(v.insuranceExpiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 45;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Pervasive safety disclaimer */}
      <EmergencyDisclaimerBanner dismissible={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">Response Readiness: ACTIVE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName || 'Driver'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              LIFELINK OS is monitoring your active vehicles, document validity, and roadside readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-glow-red flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report Incident</span>
            </Link>
            <Link
              to="/vault"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-750 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Car className="w-4 h-4 text-emerald-400" />
              <span>Vehicle Vault</span>
            </Link>
          </div>
        </div>

        {/* Quick Incident Triggers Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/report?type=VEHICLE_BREAKDOWN')}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-800/40 hover:border-amber-500/60 text-left transition-all group flex items-start justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 flex items-center justify-center text-amber-400 border border-amber-700/60 mb-3 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                Vehicle Breakdown
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
                Overheating, flat tire, dead battery, steam, smoke, or mechanical failure. Instant triage protocol.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          <button
            onClick={() => navigate('/report?type=VEHICLE_ACCIDENT')}
            className="p-5 rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-800/40 hover:border-red-500/60 text-left transition-all group flex items-start justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-red-950/80 flex items-center justify-center text-red-400 border border-red-700/60 mb-3 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-red-300 transition-colors">
                Vehicle Accident / Collision
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
                Bodily safety triage, non-emergency dispatch, safe evidence checklists, and insurance claim prep.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>

        {/* Document Expiry Warnings (if any) */}
        {expiringVehicles.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40">
            <div className="flex items-center gap-2.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Action Required: Upcoming Policy & Certificate Expiries
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {expiringVehicles.map(v => (
                <div key={v.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-750 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white">{v.make} {v.model} ({v.licensePlate})</span>
                    <p className="text-[11px] text-amber-400 mt-0.5">
                      Insurance expires: <strong>{v.insuranceExpiryDate}</strong>
                    </p>
                  </div>
                  <Link
                    to="/vault"
                    className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 text-[11px] font-medium border border-amber-700 transition-colors"
                  >
                    Update in Vault
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Active & Recent Incidents */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Incidents */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h2 className="text-base font-bold text-white tracking-tight">Active Incident Protocols</h2>
                </div>
                <span className="text-xs font-mono text-slate-400">{activeIncidents.length} active</span>
              </div>

              {activeIncidents.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">All Clear — No Active Emergencies</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    You have no ongoing breakdowns or accident protocols. If something happens on the road, use the instant report buttons above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeIncidents.map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-750 hover:border-slate-650 cursor-pointer transition-all shadow-md group relative overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <UrgencyBadge urgency={inc.urgency} />
                          <IncidentStatusBadge status={inc.status} />
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {inc.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {inc.summary || inc.description}
                      </p>

                      {inc.address && (
                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                          <span className="truncate max-w-[80%]">📍 {inc.address}</span>
                          <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Open Protocol <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resolved History */}
            {pastIncidents.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Incident History</h3>
                <div className="space-y-2.5">
                  {pastIncidents.slice(0, 3).map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                      className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-750 cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{inc.title}</span>
                          <IncidentStatusBadge status={inc.status} />
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(inc.createdAt).toLocaleDateString()} • {inc.incidentType.replace('_', ' ')}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Vehicle Vault & Contacts */}
          <div className="space-y-8">
            {/* Vehicle Vault Widget */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Registered Vehicles</h3>
                </div>
                <Link to="/vault" className="text-xs text-emerald-400 hover:underline">
                  Manage Vault
                </Link>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 mb-3">No vehicles added yet.</p>
                  <Link
                    to="/vault"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Vehicle</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map(v => (
                    <div key={v.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">
                          {v.year} {v.make} {v.model}
                        </span>
                        {v.primary && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Plate: <strong className="text-slate-200">{v.licensePlate}</strong></span>
                        <span>{v.fuelType}</span>
                      </div>
                      {v.insuranceProvider && (
                        <div className="mt-2 pt-2 border-t border-slate-850 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Insurer: {v.insuranceProvider}</span>
                          <span>Policy: {v.insurancePolicyNumber || 'On file'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency Contacts Widget */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-750 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-bold text-white">Emergency Contacts</h3>
                </div>
                <Link to="/contacts" className="text-xs text-emerald-400 hover:underline">
                  Manage
                </Link>
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 mb-3">No emergency contacts saved.</p>
                  <Link
                    to="/contacts"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contact</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {contacts.map(c => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{c.name}</span>
                          {c.primary && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{c.relationship} • {c.phoneNumber}</span>
                      </div>
                      <a
                        href={`tel:${c.phoneNumber}`}
                        className="p-2 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 transition-colors"
                        title={`Call ${c.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Modal if newly registered */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          loadDashboardData();
        }}
      />
    </div>
  );
};

export default DashboardPage;
