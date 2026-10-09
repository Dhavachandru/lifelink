import React from 'react';
import { ShieldAlert, ExternalLink, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-card border-t border-surface-border text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
        {/* Brand */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest-950 border border-forest-800/80 flex items-center justify-center text-forest-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">LIFELINK OS</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            &ldquo;When something goes wrong, know what to do next.&rdquo; Calm, mission-critical incident response for vehicle breakdowns and collisions.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-forest-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero silent tracking • Owner-scoped vault</span>
          </div>
        </div>

        {/* Modules */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Incident Modules</h4>
          <ul className="space-y-2 text-xs">
            <li className="text-forest-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
              <span>Vehicle Breakdown (Live)</span>
            </li>
            <li className="text-forest-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
              <span>Vehicle Accident (Live)</span>
            </li>
            <li className="text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span>Home Emergencies (Upcoming)</span>
            </li>
            <li className="text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span>Travel & Transit (Upcoming)</span>
            </li>
          </ul>
        </div>

        {/* Navigation & Platform */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">System & Vault</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/report" className="hover:text-white">Report an incident</Link>
            </li>
            <li>
              <Link to="/vault" className="hover:text-white">Vehicle & Document Vault</Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-white">Privacy Controls & Data Export</Link>
            </li>
            <li>
              <a
                href="http://localhost:8080/swagger-ui.html"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>OpenAPI Swagger UI</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>

        {/* Safety Notice */}
        <div className="p-4 rounded-xl bg-surface-900 border border-surface-border">
          <h4 className="text-red-300 font-semibold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Safety Notice
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            LIFELINK OS provides guided decision support and does not replace emergency dispatch, medical triage, or legal counsel. Dial 911 / 112 if immediate danger exists.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
        <p>© 2026 LIFELINK OS. Built for roadside safety and calm incident response.</p>
        <p className="text-slate-500 font-mono">React 19 • Vite • Spring Boot • Offline Fallback Ready</p>
      </div>
    </footer>
  );
};

export default Footer;
