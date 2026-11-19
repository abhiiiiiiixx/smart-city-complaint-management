import React from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import {
  PlusCircle,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLATimerBadge } from '../../components/common/SLATimerBadge';
import { formatDate } from '../../lib/utils';

interface CitizenDashboardProps {
  onNavigate: (tab: string) => void;
  onSelectComplaint: (complaintId: string) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onNavigate,
  onSelectComplaint,
}) => {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  // Filter complaints filed by this citizen (or demo citizen if guest)
  const myComplaints = complaints.filter(
    (c) =>
      c.citizen_id === user?.id ||
      (user?.email === 'citizen@smartcity.gov.in' && (c.citizen_id === 'usr-citizen-01' || c.citizen_id === 'a0000000-0000-0000-0000-000000000003'))
  );

  const totalFiled = myComplaints.length;
  const inProgress = myComplaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const resolved = myComplaints.filter((c) => c.status === 'Resolved').length;
  const pending = myComplaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Primary CTA Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30">
            Citizen Grievance Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.full_name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Ward: <strong>{user?.address || 'Civic Centre / Wright Town, Jabalpur'}</strong>
          </p>
        </div>

        <Button
          variant="teal"
          size="lg"
          onClick={() => onNavigate('submit-complaint')}
          className="font-bold shadow-lg shadow-teal-950/40 whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          File New Grievance
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-navy-950">{totalFiled}</div>
              <div className="text-xs text-slate-500 font-medium">Total Filed</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-blue-600">{inProgress}</div>
              <div className="text-xs text-slate-500 font-medium">In Progress</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600">{resolved}</div>
              <div className="text-xs text-slate-500 font-medium">Resolved</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-600">{pending}</div>
              <div className="text-xs text-slate-500 font-medium">Under Triage</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Complaints List */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              My Active & Recent Grievances
            </CardTitle>
            <p className="text-xs text-slate-500">
              Real-time progress, assigned department updates, and resolution statuses
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('my-complaints')}
          >
            View All ({totalFiled}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {myComplaints.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No grievances logged yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Spotted a road pothole, dark street, or garbage pile? Report it directly to Jabalpur Municipal Corporation.
              </p>
              <Button
                variant="teal"
                size="sm"
                onClick={() => onNavigate('submit-complaint')}
              >
                File Your First Complaint
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myComplaints.slice(0, 5).map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => {
                    onSelectComplaint(comp.id);
                    onNavigate('my-complaints');
                  }}
                  className="p-5 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-navy-950">
                        {comp.complaint_number}
                      </span>
                      <StatusBadge status={comp.status} />
                      <PriorityBadge priority={comp.priority} />
                      <SLATimerBadge
                        createdAt={comp.created_at}
                        slaHours={comp.category?.sla_hours || 48}
                        resolvedAt={comp.resolved_at}
                      />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {comp.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {comp.ward_or_area}
                      </span>
                      <span>•</span>
                      <span>{comp.category?.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(comp.created_at)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectComplaint(comp.id);
                      onNavigate('my-complaints');
                    }}
                  >
                    View Status Timeline
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
