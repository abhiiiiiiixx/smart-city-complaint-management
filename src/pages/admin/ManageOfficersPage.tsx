import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { Shield, Mail, Phone, Building2, CheckCircle2, UserCheck, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DEMO_PROFILES } from '../../lib/mockData';

export const ManageOfficersPage: React.FC = () => {
  const { officers, departments, complaints } = useComplaints();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Department Field Officers & Engineers ({officers.length})
          </h1>
          <p className="text-xs text-slate-500">
            Zonal inspection officers, field engineers, and maintenance squad leaders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {officers.map((off) => {
          const profile = DEMO_PROFILES.find((p) => p.id === off.profile_id);
          const dept = departments.find((d) => d.id === off.department_id);

          const assignedCount = complaints.filter(
            (c) =>
              c.assigned_officer_id === off.id &&
              c.status !== 'Resolved' &&
              c.status !== 'Rejected'
          ).length;

          const resolvedCount = complaints.filter(
            (c) => c.assigned_officer_id === off.id && c.status === 'Resolved'
          ).length;

          return (
            <Card key={off.id} className="civic-card-hover border-t-2 border-t-teal-600 flex flex-col justify-between">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Badge: {off.badge_number}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Available on Duty
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-navy-950">
                    {profile?.full_name || 'Field Officer'}
                  </h3>
                  <p className="text-xs font-semibold text-teal-700">
                    {off.designation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-slate-800">{dept?.name || 'Department'}</strong>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile?.email || 'officer@smartcity.gov.in'}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +91 {profile?.phone || '9826055501'}
                  </p>
                </div>
              </CardContent>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {assignedCount} Active Grievances
                </span>
                <span className="text-emerald-700">
                  {resolvedCount} Lifetime Resolved
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
