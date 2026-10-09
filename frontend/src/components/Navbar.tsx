import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/notificationApi';
import { NotificationItem } from '../types';
import { EmergencyHotlineModal } from './EmergencyHotlineModal';
import {
  ShieldAlert,
  Car,
  Bell,
  Users,
  Settings,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  Menu,
  X,
  History,
  AlertOctagon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationApi
        .getAll()
        .then(setNotifications)
        .catch((err) => console.warn('Could not load notifications', err));
    }
  }, [isAuthenticated, location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark notifications read', err);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Incident', path: '/report', icon: AlertOctagon, highlight: true },
    { name: 'Incidents', path: '/incidents', icon: History },
    { name: 'Vehicle Vault', path: '/vault', icon: Car },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <EmergencyHotlineModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />

      <header className="sticky top-0 z-40 bg-surface-card/95 backdrop-blur-sm border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/'}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-forest-950 border border-forest-800/80 flex items-center justify-center text-forest-400 group-hover:border-forest-600 transition-colors">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                    LIFELINK{' '}
                    <span className="text-[10px] font-mono font-semibold px-1 py-0.5 rounded bg-surface-elevated text-forest-300 border border-surface-border">
                      OS
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Incident Protocol
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated ? (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    location.pathname === link.path ||
                    (link.path === '/incidents' && location.pathname.startsWith('/incidents/'));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        link.highlight
                          ? 'bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-800/60 shadow-subtle'
                          : isActive
                          ? 'bg-surface-elevated text-white border border-surface-border'
                          : 'text-slate-300 hover:text-white hover:bg-surface-850'
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          link.highlight
                            ? 'text-red-400'
                            : isActive
                            ? 'text-forest-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            ) : (
              <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
                <Link to="/#features" className="hover:text-white transition-colors">
                  Scope & Features
                </Link>
                <Link to="/#triage" className="hover:text-white transition-colors">
                  AI Triage Sandbox
                </Link>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/report"
                  className="px-3.5 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Report Incident</span>
                </Link>
              </nav>
            )}

            {/* Right Action Area */}
            <div className="flex items-center gap-2.5">
              {/* Emergency Hotline Button */}
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-800/60 text-xs font-semibold transition-colors"
                title="Immediate Emergency Hotline Assistance"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Emergency SOS</span>
                <span className="sm:hidden font-mono">SOS</span>
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications bell */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-elevated border border-surface-border relative transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-forest-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-elevated border border-surface-border rounded-2xl shadow-elevated p-4 z-50 text-left">
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
                            <p className="text-xs text-slate-400 text-center py-6">
                              No notifications
                            </p>
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

                  {/* Sign Out Button */}
                  <button
                    onClick={logout}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-elevated border border-surface-border transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-surface-elevated border border-surface-border transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-elevated border border-surface-border"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-card border-b border-surface-border px-4 pt-3 pb-5 space-y-2 text-left">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border mb-3 text-xs">
                  <span className="text-slate-400 block text-[11px]">Signed in as</span>
                  <span className="font-semibold text-white">{user?.fullName || 'Driver'}</span>
                </div>

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium ${
                        link.highlight
                          ? 'bg-red-950/70 text-red-200 border border-red-800/60'
                          : isActive
                          ? 'bg-surface-elevated text-white'
                          : 'text-slate-300 hover:bg-surface-elevated'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-surface-elevated text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-surface-elevated"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-surface-elevated"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
