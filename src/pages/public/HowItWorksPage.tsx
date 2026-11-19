import React from 'react';
import {
  FileText,
  Cpu,
  UserCheck,
  Camera,
  Star,
  CheckCircle2,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Citizen Reports Problem',
      icon: <FileText className="w-6 h-6 text-teal-600" />,
      desc: 'Citizen clicks "File Grievance", selects category, attaches site photos, types address or drops a pin on the interactive map.',
      highlight: 'Auto-generates unique Ticket ID (e.g. SC-2026-0001) & warns if duplicate issue is already active nearby.',
    },
    {
      step: '02',
      title: 'Automated Routing & Priority Triage',
      icon: <Cpu className="w-6 h-6 text-navy-900" />,
      desc: 'Rule-based priority engine evaluates safety keywords (fire, sparking wire, open manhole) and tags the ticket with proper urgency.',
      highlight: 'Routes ticket directly to the designated department queue (Roads, Water, Electricity, Sanitation).',
    },
    {
      step: '03',
      title: 'Department Officer Assignment',
      icon: <UserCheck className="w-6 h-6 text-blue-600" />,
      desc: 'Municipal Administrator or Executive Engineer assigns the ticket to the specific Zonal Field Officer with a live SLA countdown clock.',
      highlight: 'Officer receives instant in-app assignment notification.',
    },
    {
      step: '04',
      title: 'Field Execution & Proof Upload',
      icon: <Camera className="w-6 h-6 text-emerald-600" />,
      desc: 'Officer mobilizes the maintenance squad to the GPS site coordinates, completes necessary repairs, and uploads photographic proof of resolution.',
      highlight: 'Ticket status transitions to "Resolved" with timestamp and remarks.',
    },
    {
      step: '05',
      title: 'Citizen Notification & Rating',
      icon: <Star className="w-6 h-6 text-amber-500" />,
      desc: 'Citizen receives a status notification. They review the resolution proof and rate the work from 1 to 5 stars. If dissatisfied, they can reopen the ticket with one click.',
      highlight: 'Ratings feed into department performance scorecards and monthly smart city audits.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950">
          How the Complaint Management Workflow Operates
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          An end-to-end, accountable lifecycle ensuring no civic complaint is lost or neglected.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((st, idx) => (
          <div key={idx} className="relative">
            <Card className="civic-card-hover border-l-4 border-l-navy-900">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {st.icon}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Step {st.step}
                    </span>
                    <h3 className="text-base font-bold text-navy-950">{st.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {st.desc}
                  </p>
                  <p className="text-xs font-medium text-teal-800 bg-teal-50/60 p-2 rounded-lg border border-teal-100 mt-2">
                    💡 <strong>Smart Feature:</strong> {st.highlight}
                  </p>
                </div>
              </CardContent>
            </Card>

            {idx < steps.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowDown className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
