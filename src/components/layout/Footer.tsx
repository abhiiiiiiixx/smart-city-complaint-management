import React from 'react';
import { Building2, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Portal info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base">Smart City Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Digital Grievance Redressal Platform for Jabalpur Smart City Limited (JSCL) & Jabalpur Municipal Corporation (JMC).
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-teal-400 cursor-pointer">Submit Grievance</li>
              <li className="hover:text-teal-400 cursor-pointer">Track Complaint Status</li>
              <li className="hover:text-teal-400 cursor-pointer">Ward Zonal Offices</li>
              <li className="hover:text-teal-400 cursor-pointer">Citizen Charter & SLA</li>
            </ul>
          </div>

          {/* Col 3: Key Departments */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Municipal Divisions
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Roads & Flyovers Infrastructure</li>
              <li>Water Supply & Sewage Management</li>
              <li>Street Lighting & Electrical Wing</li>
              <li>Solid Waste & Public Health</li>
            </ul>
          </div>

          {/* Col 4: Emergency Contacts */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Emergency Contacts
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>Municipal HQ: Civic Centre, Wright Town, Jabalpur, M.P. - 482002</p>
              <p>Toll-Free Control Room: <strong className="text-white">1800-233-0761</strong></p>
              <p>WhatsApp Grievance: <strong className="text-teal-400">+91 761 261 1751</strong></p>
              <p>Email: <span className="text-slate-300">smartcity@jabalpur.nic.in</span></p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Jabalpur Municipal Corporation. All Rights Reserved. Built for Smart Cities Mission.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Urban Governance & Transparency
          </p>
        </div>
      </div>
    </footer>
  );
};
