import React from 'react';
import { ShieldAlert, ExternalLink, HeartHandshake, Lock, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-white font-bold text-sm tracking-wide">LIFELINK OS</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            “When something goes wrong, know what to do next.” High-reliability incident response for breakdowns and accidents.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero silent tracking • Owner-scoped security</span>
          </div>
        </div>

        {/* Core Domains */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Incident Modules</h4>
          <ul className="space-y-2">
            <li className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Vehicle Breakdown (Live)</span>
            </li>
            <li className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Vehicle Accident (Live)</span>
            </li>
            <li className="text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span>Home Emergencies (Upcoming)</span>
            </li>
            <li className="text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span>Travel & Transit (Upcoming)</span>
            </li>
          </ul>
        </div>

        {/* Developer & Platform */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform & Specs</h4>
          <ul className="space-y-2">
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
            <li>
              <a
                href="http://localhost:8080/v3/api-docs"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>API Specification (JSON)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <Link to="/settings" className="hover:text-white">Privacy Controls & Data Export</Link>
            </li>
          </ul>
        </div>

        {/* Safety Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="text-red-300 font-semibold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Safety & Legal Notice
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            LIFELINK OS does not guarantee third-party assistance availability, determine insurance eligibility, adjudicate legal liability, or diagnose bodily injuries. Always dial official emergency dispatch (911 / 112) for critical hazards.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
        <p>© 2026 LIFELINK OS. Built for mission-critical roadside incident response.</p>
        <p className="text-slate-500">PWA Ready • React 18 / 19 • Java 21 / Spring Boot 3 • PostgreSQL</p>
      </div>
    </footer>
  );
};

export default Footer;
