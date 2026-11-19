import React from 'react';
import { Building2, ShieldCheck, Target, Award, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
          <Award className="w-3.5 h-3.5 text-teal-600" />
          <span>Jabalpur Smart City Mission (JSCL)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950">
          About the Smart City Grievance Redressal System
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Pioneering citizen-centric, technology-driven municipal administration under the National Smart Cities Mission, Ministry of Housing and Urban Affairs (MoHUA), Government of India.
        </p>
      </div>

      {/* Mission Vision Values Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="civic-card-hover">
          <CardContent className="space-y-3 p-6">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center font-bold">
              <Target className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-base font-bold text-navy-950">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To provide Jabalpur's 1.5+ million residents an effortless, direct digital channel to report public grievances and guarantee time-bound service delivery by municipal departments.
            </p>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="space-y-3 p-6">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy-950">Total Transparency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every reported grievance receives an irrevocable digital audit trail with timestamps, officer assignment logs, and mandatory photographic proof of resolution.
            </p>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="space-y-3 p-6">
            <div className="w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-teal-300" />
            </div>
            <h3 className="text-base font-bold text-navy-950">Citizen Accountability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens retain the power to review, rate (1-5 stars), or reopen any resolved ticket if field repairs fail to meet municipal standards.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Citizen Charter & SLA Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-navy-950">
          Citizen Service Charter & Guaranteed SLA Turnaround
        </h3>
        <p className="text-xs text-slate-500">
          In accordance with the Public Services Guarantee Act, the corporation commits to the following maximum resolution windows:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                <th className="py-2.5 px-3">Civic Category</th>
                <th className="py-2.5 px-3">Default Priority</th>
                <th className="py-2.5 px-3">SLA Commitment</th>
                <th className="py-2.5 px-3">Responsible Division</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Sparking Electrical Wire</td>
                <td className="py-2.5 px-3"><span className="text-rose-700 font-bold">Critical</span></td>
                <td className="py-2.5 px-3 font-semibold text-navy-900">Within 12 Hours</td>
                <td className="py-2.5 px-3">Electricity & Power Wing</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Contaminated Drinking Water</td>
                <td className="py-2.5 px-3"><span className="text-amber-700 font-bold">High</span></td>
                <td className="py-2.5 px-3 font-semibold text-navy-900">Within 24 Hours</td>
                <td className="py-2.5 px-3">Water Works & Sewerage</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Choked Sewer / Open Manhole</td>
                <td className="py-2.5 px-3"><span className="text-amber-700 font-bold">High</span></td>
                <td className="py-2.5 px-3 font-semibold text-navy-900">Within 24 Hours</td>
                <td className="py-2.5 px-3">Drainage Division</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Road Potholes & Asphalt Repair</td>
                <td className="py-2.5 px-3"><span className="text-blue-700 font-bold">Medium</span></td>
                <td className="py-2.5 px-3 font-semibold text-navy-900">Within 48 Hours</td>
                <td className="py-2.5 px-3">Roads & Infrastructure</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Garbage Dump Clearance</td>
                <td className="py-2.5 px-3"><span className="text-blue-700 font-bold">Medium</span></td>
                <td className="py-2.5 px-3 font-semibold text-navy-900">Within 18 Hours</td>
                <td className="py-2.5 px-3">Solid Waste Management</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Streetlight Bulb Replacement</td>
                <td className="py-2.5 px-3"><span className="text-blue-700 font-bold">Medium</span></td>
                <td className="py-2.5 px-3 font-semibold text-navy-900">Within 24 Hours</td>
                <td className="py-2.5 px-3">Street Lighting Wing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
