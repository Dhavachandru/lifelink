import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/notificationApi';
import { contactApi } from '../api/contactApi';
import { NotificationItem, EmergencyContact } from '../types';
import { EmergencyHotlineModal } from './EmergencyHotlineModal';
import {
  ShieldAlert,
  Car,
  Bell,
  Settings,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  Files,
  History,
  AlertOctagon,
  Menu,
  X,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [primaryContact, setPrimaryContact] = useState<EmergencyContact | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    notificationApi
      .getAll()
      .then(setNotifications)
      .catch((err) => console.warn('Could not load notifications', err));

    contactApi
      .getAll()
      .then((contacts) => {
        const prim = contacts.find((c) => c.primary) || contacts[0] || null;
        setPrimaryContact(prim);
      })
      .catch((err) => console.warn('Could not load emergency contacts', err));
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark notifications read', err);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview & readiness',
    },
    {
      name: 'Report incident',
      path: '/report',
      icon: AlertOctagon,
      description: 'Breakdown or accident',
      isEmergencyAction: true,
    },
    {
      name: 'Incidents',
      path: '/incidents',
      icon: History,
      description: 'Active & past cases',
    },
    {
      name: 'Vehicles',
      path: '/vault',
      icon: Car,
      description: 'Garage & warranties',
    },
    {
      name: 'Documents',
      path: '/documents',
      icon: Files,
      description: 'Insurance & PUC vault',
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      description: 'Preferences & privacy',
    },
  ];

  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard';
    if (location.pathname.startsWith('/report')) return 'Report Incident';
    if (location.pathname.startsWith('/incidents/')) return 'Incident Response Cockpit';
    if (location.pathname.startsWith('/incidents')) return 'Incident Records';
    if (location.pathname.startsWith('/vault')) return 'Vehicle Vault';
    if (location.pathname.startsWith('/documents')) return 'Document Vault';
    if (location.pathname.startsWith('/contacts')) return 'Emergency Contacts';
    if (location.pathname.startsWith('/settings')) return 'System Settings';
    return 'LIFELINK OS';
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Emergency Hotline Modal */}
      <EmergencyHotlineModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        primaryContact={primaryContact}
      />

      {/* Desktop Compact Sidebar (hidden on mobile) */}
      <aside
        aria-label="Sidebar Navigation"
        className="hidden md:flex flex-col w-64 bg-surface-card border-r border-surface-border shrink-0 select-none z-30 min-h-screen sticky top-0 h-screen"
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-forest-950 border border-forest-800/80 flex items-center justify-center text-forest-400 group-hover:border-forest-600 transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                LIFELINK <span className="text-[10px] font-mono font-semibold px-1 py-0.5 rounded bg-surface-elevated text-forest-300 border border-surface-border">OS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Incident Response</span>
            </div>
          </Link>
        </div>

        {/* Primary Action Button: Report Incident */}
        <div className="p-3">
          <Link
            to="/report"
            className="w-full py-2.5 px-3.5 rounded-xl bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>Report an incident</span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/incidents' && location.pathname.startsWith('/incidents/')) ||
              (item.path === '/vault' && location.pathname === '/vault' && !location.search.includes('tab=documents')) ||
              (item.path === '/documents' && (location.pathname === '/documents' || (location.pathname === '/vault' && location.search.includes('tab=documents'))));

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-elevated text-white border border-surface-border'
                    : 'text-slate-300 hover:text-white hover:bg-surface-850'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-forest-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.isEmergencyAction && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Quick Call & User Area */}
        <div className="p-3 border-t border-surface-border space-y-2">
          {/* Quick SOS Trigger */}
          <button
            type="button"
            onClick={() => setEmergencyModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-surface-elevated hover:bg-surface-800 text-red-200 border border-red-900/40 text-xs font-medium flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span>Emergency SOS</span>
            </div>
            <span className="text-[10px] text-red-400 font-mono">911/112</span>
          </button>

          {/* User & Sign Out */}
          <div className="pt-2 flex items-center justify-between px-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-slate-400 text-[10px] font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="truncate max-w-[100px] text-slate-300 font-medium">
                {user?.fullName || 'Driver'}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign out of LIFELINK OS"
              className="text-slate-400 hover:text-red-300 p-1 rounded-md hover:bg-surface-850 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-sm border-b border-surface-border px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Mobile brand & page title */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Readiness Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border text-[11px] font-medium text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
              <span>Readiness: <strong className="text-white font-mono">ACTIVE</strong></span>
            </div>

            {/* Emergency Hotline Button */}
            <button
              type="button"
              onClick={() => setEmergencyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-800/60 text-xs font-semibold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Emergency Hotline</span>
              <span className="sm:hidden font-mono">SOS</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-elevated border border-surface-border relative transition-colors"
                aria-label="Open alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-forest-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-elevated border border-surface-border rounded-2xl shadow-elevated p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-2">
                    <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Alerts & Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-forest-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs transition-colors ${
                            n.read
                              ? 'bg-surface-card border-surface-border text-slate-400'
                              : 'bg-surface-850 border-surface-border text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{n.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Dropdown Menu if toggled */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-card border-b border-surface-border p-4 space-y-2 animate-in fade-in duration-150">
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-2 mb-3"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Report an incident</span>
            </Link>

            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-surface-elevated"
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            ))}

            <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs text-slate-300">
              <span>{user?.fullName || 'Driver'}</span>
              <button
                onClick={logout}
                className="text-red-400 hover:text-red-300 font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-8">{children}</main>

        {/* Mobile Accessible Bottom Navigation (sticky at bottom for thumb access) */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card border-t border-surface-border px-2 py-1.5 flex items-center justify-around select-none"
        >
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              location.pathname === '/dashboard' ? 'text-forest-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/incidents"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              location.pathname.startsWith('/incidents') ? 'text-forest-400 font-bold' : 'text-slate-400'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Incidents</span>
          </Link>

          {/* Prominent Center Emergency Report Button */}
          <Link
            to="/report"
            className="flex flex-col items-center -mt-4 p-1 group"
            aria-label="Report an incident"
          >
            <div className="w-11 h-11 rounded-full bg-red-700 hover:bg-red-600 text-white flex items-center justify-center shadow-subtle border-2 border-surface-card">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-red-400 mt-0.5">Report</span>
          </Link>

          <Link
            to="/vault"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              location.pathname === '/vault' || location.pathname === '/documents'
                ? 'text-forest-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Vault</span>
          </Link>

          <Link
            to="/settings"
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition-colors ${
              location.pathname === '/settings' || location.pathname === '/contacts'
                ? 'text-forest-400 font-bold'
                : 'text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default AppShell;
