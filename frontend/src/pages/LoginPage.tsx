import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../components/design-system/Button';

export const LoginPage: React.FC = () => {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-100 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-9 h-9 rounded-xl bg-forest-950 border border-forest-800/80 flex items-center justify-center text-forest-400 group-hover:border-forest-600 transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LIFELINK OS</span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Sign in to your operating system
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-forest-400 hover:underline">
            create a new LIFELINK account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-card border border-surface-border py-8 px-6 sm:px-8 shadow-elevated rounded-2xl space-y-6 text-left">
          {/* 1-Click Demo Login Banner */}
          <div className="p-4 rounded-xl bg-forest-950/40 border border-forest-800/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-forest-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-forest-400" />
                Evaluation Account
              </span>
              <span className="text-[10px] text-forest-400 uppercase tracking-wider font-mono">
                1-Click
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Instant login as <strong className="text-white">Alex Mercer</strong> with sample breakdown and collision records.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDemoLogin}
              loading={loading}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="mt-1 w-full"
            >
              Sign In as Demo Driver
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@lifelink.os"
                  className="w-full pl-9 pr-3 py-2 bg-surface-900 border border-surface-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-surface-900 border border-surface-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="md"
              loading={loading}
              className="w-full font-semibold"
            >
              Sign In to Incident OS
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
