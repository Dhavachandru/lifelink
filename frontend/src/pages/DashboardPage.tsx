import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentApi } from '../api/incidentApi';
import { vehicleApi } from '../api/vehicleApi';
import { contactApi } from '../api/contactApi';
import { Incident, Vehicle, EmergencyContact } from '../types';
import { UrgencyBadge, IncidentStatusBadge } from '../components/StatusBadge';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { Button } from '../components/design-system/Button';
import { OnboardingModal } from './OnboardingModal';
import {
  ShieldAlert,
  Car,
  Wrench,
  AlertTriangle,
  Clock,
  ArrowRight,
  Phone,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Users,
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

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'CANCELLED'
  );
  const pastIncidents = incidents.filter(
    (i) => i.status === 'RESOLVED' || i.status === 'CANCELLED'
  );

  // Identify documents expiring within 45 days
  const expiringVehicles = vehicles.filter((v) => {
    if (!v.insuranceExpiryDate) return false;
    const expiry = new Date(v.insuranceExpiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 45;
  });

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading response dashboard...</p>
      </div>
    );
  }

  return (
    <div className="text-slate-100">
      <EmergencyDisclaimerBanner dismissible={true} />

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-8">
        {/* Welcome & Preparedness Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                System Status: Ready
              </span>
              <span className="w-2 h-2 rounded-full bg-forest-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome, {user?.fullName || 'Driver'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              LIFELINK OS is monitoring your registered vehicles, document validity, and emergency response readiness.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="emergency"
              size="md"
              icon={<ShieldAlert className="w-4 h-4" />}
              onClick={() => navigate('/report')}
            >
              Report an incident
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Car className="w-4 h-4 text-forest-400" />}
              onClick={() => navigate('/vault')}
            >
              Vehicle Vault
            </Button>
          </div>
        </div>

        {/* Prominent "What happened?" Incident Entry Point */}
        <section aria-labelledby="what-happened-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="what-happened-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                What happened?
              </h2>
              <p className="text-xs text-slate-400">
                Choose an incident type below to start guided safety steps and incident triage.
              </p>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Instant step-by-step triage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle Breakdown Trigger */}
            <button
              onClick={() => navigate('/report?type=VEHICLE_BREAKDOWN')}
              className="p-5 rounded-2xl bg-surface-card hover:bg-surface-elevated border border-surface-border hover:border-amber-700/60 text-left transition-all group flex items-start justify-between shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <div className="pr-4">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-700/60 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  Vehicle Breakdown
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Mechanical fault, flat tire, dead battery, engine overheating, or strange smoke. Instant roadside safety protocol.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Start breakdown protocol</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
            </button>

            {/* Vehicle Accident Trigger */}
            <button
              onClick={() => navigate('/report?type=VEHICLE_ACCIDENT')}
              className="p-5 rounded-2xl bg-surface-card hover:bg-surface-elevated border border-surface-border hover:border-red-700/60 text-left transition-all group flex items-start justify-between shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <div className="pr-4">
                <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center justify-center text-red-400 mb-3 group-hover:scale-105 transition-transform">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-red-300 transition-colors">
                  Vehicle Accident / Collision
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Traffic collision, scratch, fender bender, or ditch slide. Bodily safety triage, non-emergency dispatch, and safe evidence checklists.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Start accident protocol</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
            </button>
          </div>
        </section>

        {/* Active Incidents Section (Shown first) */}
        <section aria-labelledby="active-incidents-title" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 id="active-incidents-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                Active Incidents
              </h2>
              {activeIncidents.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/60 text-xs font-semibold">
                  {activeIncidents.length} in progress
                </span>
              )}
            </div>
            {activeIncidents.length > 0 && (
              <Link to="/incidents" className="text-xs font-medium text-forest-400 hover:underline">
                View all incidents
              </Link>
            )}
          </div>

          {activeIncidents.length === 0 ? (
            <div className="p-6 rounded-2xl bg-surface-card border border-surface-border text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center text-forest-400 mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">No active incidents</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-0.5 mb-3">
                All registered vehicles and routes are clear. If trouble occurs, tap &ldquo;What happened?&rdquo; above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeIncidents.map((incident) => (
                <div
                    key={incident.id}
                    className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-500 transition-all text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <UrgencyBadge urgency={incident.urgency} />
                          <IncidentStatusBadge status={incident.status} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(incident.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {incident.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {incident.description}
                      </p>

                      <div className="mt-3 text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        {incident.vehicleInfo && (
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5" />
                            <span>{incident.vehicleInfo}</span>
                          </span>
                        )}
                        {incident.address && (
                          <span className="truncate max-w-[200px]">
                            {incident.address}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
                      <span className="text-[11px] text-forest-400 font-medium">
                        Cockpit action required
                      </span>
                      <Link
                        to={`/incidents/${incident.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-800 text-white font-medium text-xs border border-surface-border transition-colors group"
                      >
                        <span>Resume Cockpit</span>
                        <ChevronRight className="w-3.5 h-3.5 text-forest-400 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Expiring Documents & Warnings */}
        {expiringVehicles.length > 0 && (
          <section aria-label="Expiring Documents Alert">
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/25 border border-amber-800/40 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-200">
                    Policy Expiry Alert ({expiringVehicles.length} {expiringVehicles.length === 1 ? 'vehicle' : 'vehicles'})
                  </h4>
                  <p className="text-xs text-amber-100/90 mt-0.5">
                    {expiringVehicles.map((v) => `${v.make} ${v.model} insurance expires on ${v.insuranceExpiryDate}`).join(' • ')}
                  </p>
                </div>
              </div>
              <Link
                to="/vault?tab=documents"
                className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-medium text-xs shrink-0 transition-colors"
              >
                Renew / Update Policy
              </Link>
            </div>
          </section>
        )}

        {/* Secondary Grid: Saved Vehicles & Emergency Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Saved Vehicles (2 Cols) */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Car className="w-4 h-4 text-forest-400" />
                <span>Registered Vehicles</span>
              </h3>
              <Link to="/vault" className="text-xs text-forest-400 hover:underline">
                Manage Vault ({vehicles.length})
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <div className="p-5 rounded-xl bg-surface-card border border-surface-border text-center">
                <p className="text-xs text-slate-400 mb-2">No vehicles registered yet.</p>
                <Button size="sm" variant="secondary" onClick={() => navigate('/vault')}>
                  Add First Vehicle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">
                        {v.year} {v.make} {v.model}
                      </span>
                      {v.primary && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-950 text-forest-300 border border-forest-800/60 font-mono">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-400">
                      <p className="font-mono text-slate-300">Plate: {v.licensePlate}</p>
                      {v.insuranceProvider && (
                        <p className="truncate">Insurer: {v.insuranceProvider}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-surface-border flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {v.insuranceExpiryDate
                          ? `Expires: ${v.insuranceExpiryDate}`
                          : 'No expiry registered'}
                      </span>
                      <Link
                        to={`/vault?vehicleId=${v.id}`}
                        className="text-forest-400 hover:underline font-medium"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Contacts Widget (1 Col) */}
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-forest-400" />
                <span>Emergency Contacts</span>
              </h3>
              <Link to="/contacts" className="text-xs text-forest-400 hover:underline">
                Manage ({contacts.length})
              </Link>
            </div>

            {contacts.length === 0 ? (
              <div className="p-5 rounded-xl bg-surface-card border border-surface-border text-center">
                <p className="text-xs text-slate-400 mb-2">No emergency contacts saved.</p>
                <Button size="sm" variant="secondary" onClick={() => navigate('/contacts')}>
                  Add Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {contacts.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-surface-card border border-surface-border flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {c.name}
                        </span>
                        {c.primary && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-forest-950 text-forest-300 border border-forest-800/60 font-mono">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {c.relationship} • {c.phoneNumber}
                      </span>
                    </div>

                    <a
                      href={`tel:${c.phoneNumber}`}
                      className="p-2 rounded-lg bg-surface-elevated hover:bg-forest-900/60 text-slate-300 hover:text-forest-300 border border-surface-border transition-colors"
                      title={`Call ${c.name}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}

                <Link
                  to="/contacts"
                  className="block text-center py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  + Manage all emergency contacts
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Past Incidents Activity Section if available */}
        {pastIncidents.length > 0 && (
          <section aria-labelledby="past-activity-title" className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <h3 id="past-activity-title" className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recent Resolved Incidents</span>
              </h3>
              <Link to="/incidents" className="text-xs text-slate-400 hover:underline">
                View all past records
              </Link>
            </div>

            <div className="space-y-2">
              {pastIncidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <IncidentStatusBadge status={inc.status} />
                    <span className="text-xs font-semibold text-white">{inc.title}</span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {new Date(inc.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/incidents/${inc.id}`}
                    className="text-xs text-forest-400 hover:underline font-medium self-end sm:self-auto"
                  >
                    View audit record &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
