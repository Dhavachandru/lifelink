import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/notificationApi';
import { NotificationItem } from '../types';
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
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      notificationApi.getAll()
        .then(setNotifications)
        .catch(err => console.warn('Could not load notifications', err));
    }
  }, [isAuthenticated, location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Failed to mark notifications read', err);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Incident', path: '/report', icon: ShieldAlert, highlight: true },
    { name: 'Vehicle Vault', path: '/vault', icon: Car },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-glow-emerald group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                    LIFELINK <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-800/60">OS</span>
                  </span>
                  <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Incident Protocol</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated ? (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(link => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                        link.highlight
                          ? 'bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-800/60 shadow-glow-red'
                          : isActive
                          ? 'bg-slate-850 text-white border border-slate-700'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${link.highlight ? 'text-red-400' : isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            ) : (
              <nav className="hidden md:flex items-center gap-4">
                <Link to="/#features" className="text-sm font-medium text-slate-300 hover:text-white">Features</Link>
                <Link to="/#triage" className="text-sm font-medium text-slate-300 hover:text-white">AI Triage</Link>
                <Link to="/#vault" className="text-sm font-medium text-slate-300 hover:text-white">Vehicle Vault</Link>
              </nav>
            )}

            {/* Right action area */}
            <div className="flex items-center gap-3">
              {/* Emergency Hotline Button */}
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800/80 text-red-200 border border-red-700/60 text-xs font-semibold shadow-glow-red transition-all"
                title="Immediate Emergency Hotline Assistance"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="hidden sm:inline">Emergency SOS</span>
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications bell */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 relative transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications drop-down */}
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-4 z-50">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Alerts & Notifications</h4>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[11px] text-emerald-400 hover:underline"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto space-y-2">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">No notifications yet.</p>
                          ) : (
                            notifications.slice(0, 6).map(n => (
                              <div
                                key={n.id}
                                className={`p-2.5 rounded-xl text-xs transition-colors ${
                                  n.read ? 'bg-slate-950/40 text-slate-400' : 'bg-slate-850/80 text-slate-200 border border-slate-700/60'
                                }`}
                              >
                                <p className="font-semibold text-white mb-0.5">{n.title}</p>
                                <p className="text-[11px] leading-relaxed text-slate-300">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User profile & logout */}
                  <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                    <span className="text-xs font-medium text-slate-300 max-w-[120px] truncate">{user?.fullName || 'User'}</span>
                    <button
                      onClick={logout}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
            {isAuthenticated ? (
              <>
                {navLinks.map(link => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        link.highlight
                          ? 'bg-red-950/70 text-red-300 border border-red-800/60'
                          : isActive
                          ? 'bg-slate-850 text-white'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-slate-900"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({user?.email})</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 text-center text-sm rounded-xl border border-slate-800 text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 text-center text-sm rounded-xl bg-emerald-600 text-white font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Emergency SOS Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-red-700/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEmergencyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950 flex items-center justify-center text-red-400 border border-red-700 shadow-glow-red animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Services Hotline</h3>
                <p className="text-xs text-red-300">Life-Threatening Emergency Protocol</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              If someone is injured, unconscious, trapped, or there is an active highway hazard or vehicle fire, do not wait for an app response. Contact professional emergency dispatch immediately.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <a
                href="tel:911"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-glow-red transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 911 (US / Canada)</span>
              </a>
              <a
                href="tel:112"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 112 (Europe / Intl)</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">What to tell the dispatcher:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Your exact highway mile marker or closest intersection</li>
                <li>Number of injured occupants and current condition</li>
                <li>Whether traffic lanes are blocked</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
