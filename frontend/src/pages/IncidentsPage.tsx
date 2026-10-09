import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { incidentApi } from '../api/incidentApi';
import { Incident } from '../types';
import { UrgencyBadge, IncidentStatusBadge } from '../components/StatusBadge';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { Card, CardHeader, CardContent } from '../components/design-system/Card';
import { Button } from '../components/design-system/Button';
import { EmptyState } from '../components/design-system/EmptyState';
import {
  History,
  ShieldAlert,
  Wrench,
  Car,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  Search,
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    incidentApi
      .getAll()
      .then(setIncidents)
      .catch((err) => console.warn('Could not fetch incidents', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredIncidents = incidents.filter((i) => {
    const isResolved = i.status === 'RESOLVED' || i.status === 'CANCELLED';
    if (statusFilter === 'ACTIVE' && isResolved) return false;
    if (statusFilter === 'RESOLVED' && !isResolved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = i.title?.toLowerCase().includes(q);
      const matchDesc = i.description?.toLowerCase().includes(q);
      const matchAddr = i.address?.toLowerCase().includes(q);
      const matchVeh = i.vehicleInfo?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchAddr || matchVeh;
    }
    return true;
  });

  const activeCount = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'CANCELLED'
  ).length;

  return (
    <div className="text-slate-100">
      <EmergencyDisclaimerBanner dismissible={true} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-forest-400 uppercase tracking-wider font-mono">
                Incident Response Log
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Incident Records & Action History
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Review active responses, consult past assessment checklists, and resume open triage workflows.
            </p>
          </div>

          <Button
            variant="emergency"
            size="md"
            icon={<ShieldAlert className="w-4 h-4" />}
            onClick={() => navigate('/report')}
          >
            Report an incident
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-3 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-lg border border-surface-border">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-surface-elevated text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records ({incidents.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                statusFilter === 'ACTIVE'
                  ? 'bg-forest-950 text-forest-300 border border-forest-800/60 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Active</span>
              {activeCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-forest-800 text-white text-[10px]">
                  {activeCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === 'RESOLVED'
                  ? 'bg-surface-elevated text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved ({incidents.length - activeCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, vehicle, or location..."
              className="w-full bg-surface-900 border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-forest-500"
            />
          </div>
        </div>

        {/* Incidents List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading incident records...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <EmptyState
            icon={<History className="w-6 h-6 text-slate-400" />}
            title={
              statusFilter === 'ACTIVE'
                ? 'No active incidents'
                : 'No incidents match this filter'
            }
            description={
              statusFilter === 'ACTIVE'
                ? 'All registered vehicles and routes are currently safe and operational.'
                : 'Try adjusting your search query or view all incident records.'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<ShieldAlert className="w-3.5 h-3.5" />}
                onClick={() => navigate('/report')}
              >
                Report an incident
              </Button>
            }
          />
        ) : (
          <div className="space-y-3.5">
            {filteredIncidents.map((inc) => {
              const isAccident = inc.incidentType === 'VEHICLE_ACCIDENT';
              const isResolved = inc.status === 'RESOLVED' || inc.status === 'CANCELLED';

              return (
                <div
                  key={inc.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !isResolved
                      ? 'bg-surface-card border-surface-border hover:border-slate-500'
                      : 'bg-surface-card/60 border-surface-border-subtle hover:border-surface-border'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <UrgencyBadge urgency={inc.urgency} />
                      <IncidentStatusBadge status={inc.status} />
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-elevated text-slate-300 border border-surface-border">
                        {isAccident ? (
                          <>
                            <ShieldAlert className="w-3 h-3 text-red-400" />
                            <span>Accident</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3 h-3 text-amber-400" />
                            <span>Breakdown</span>
                          </>
                        )}
                      </span>
                      {inc.isDemo && (
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          Demo record
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                        {inc.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                        {inc.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(inc.createdAt).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>

                      {inc.address && (
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{inc.address}</span>
                        </span>
                      )}

                      {inc.vehicleInfo && (
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3 text-slate-400" />
                          <span>{inc.vehicleInfo}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    <Link
                      to={`/incidents/${inc.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-surface-800 text-white border border-surface-border transition-colors group"
                    >
                      <span>{!isResolved ? 'Open Cockpit' : 'View Record'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-forest-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentsPage;
