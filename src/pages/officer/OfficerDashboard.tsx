import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Star,
  Award,
  Wrench,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLATimerBadge } from '../../components/common/SLATimerBadge';
import { Modal } from '../../components/ui/Modal';
import { ImageUploader } from '../../components/common/ImageUploader';
import { ComplaintStatus, Complaint } from '../../types/database';
import { formatDate } from '../../lib/utils';

interface OfficerDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenUpdateModal?: (complaint: Complaint) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  onNavigate,
}) => {
  const { user } = useAuth();
  const { complaints, officers, departments, updateComplaintStatus } = useComplaints();

  // Find officer record
  const currentOfficer = officers.find(
    (o) => o.profile_id === user?.id || o.profile_id === 'usr-officer-01'
  );
  const currentDept = departments.find(
    (d) => d.id === currentOfficer?.department_id || d.id === 'dept-roads'
  );

  // Complaints assigned to this department or specific officer
  const assignedComplaints = complaints.filter(
    (c) =>
      c.assigned_department_id === currentDept?.id ||
      c.assigned_officer_id === currentOfficer?.id
  );

  const activeQueue = assignedComplaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
  );
  const resolvedCount = assignedComplaints.filter((c) => c.status === 'Resolved').length;
  const criticalCount = activeQueue.filter((c) => c.priority === 'Critical').length;
  const inProgressCount = activeQueue.filter((c) => c.status === 'In Progress').length;

  // Status update modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [remarks, setRemarks] = useState('');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenUpdate = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setNewStatus(comp.status === 'Assigned' ? 'In Progress' : 'Resolved');
    setRemarks('');
    setProofImages([]);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);
    await updateComplaintStatus(
      selectedComplaint.id,
      newStatus,
      remarks,
      proofImages,
      user?.id,
      user?.full_name
    );
    setSubmitting(false);
    setSelectedComplaint(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Header Card */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Shield className="w-3.5 h-3.5" />
            Field Engineering & Zonal Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.full_name || 'Er. Vikram Malhotra'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
            <span>Badge: <strong>{currentOfficer?.badge_number || 'IMC-ENG-402'}</strong></span>
            <span>•</span>
            <span>{currentDept?.name || 'Road Infrastructure'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-2xl border border-white/20 text-xs">
          <Award className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-sm">4.8 / 5.0 Rating</div>
            <div className="text-[11px] text-slate-300">96.4% SLA Compliance</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-navy-950">{activeQueue.length}</div>
              <div className="text-xs text-slate-500 font-medium">Active Queue</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-blue-600">{inProgressCount}</div>
              <div className="text-xs text-slate-500 font-medium">In Progress</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-rose-600">{criticalCount}</div>
              <div className="text-xs text-slate-500 font-medium">Critical Tickets</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600">{resolvedCount}</div>
              <div className="text-xs text-slate-500 font-medium">Resolved by Dept</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Department Queue Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              Assigned Field Grievance Queue
            </CardTitle>
            <p className="text-xs text-slate-500">
              Complaints routed to {currentDept?.name} requiring action or resolution proof
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('assigned-complaints')}
          >
            View Full Queue ({assignedComplaints.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {activeQueue.slice(0, 6).map((comp) => (
              <div
                key={comp.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
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
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      {comp.address} ({comp.ward_or_area})
                    </span>
                    <span>•</span>
                    <span>{comp.category?.name}</span>
                    <span>•</span>
                    <span className="text-slate-400">
                      Reported {formatDate(comp.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => handleOpenUpdate(comp)}
                    className="font-bold text-xs"
                  >
                    <Wrench className="w-3.5 h-3.5 mr-1.5" />
                    Update Progress & Proof
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Update & Proof Upload Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Update Grievance: ${selectedComplaint.complaint_number}`}
          description="Log maintenance progress, change ticket stage, and attach photographic proof."
          maxWidth="xl"
        >
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-navy-950 block">
                {selectedComplaint.title}
              </span>
              <p className="text-slate-500">{selectedComplaint.address}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Status Stage *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white font-semibold"
              >
                <option value="In Progress">In Progress (Maintenance Team Mobilized)</option>
                <option value="Resolved">Resolved (Work Completed & Inspected)</option>
                <option value="Rejected">Rejected (Out of Municipal Jurisdiction / Invalid)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Officer Remarks & Action Taken *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe action: e.g. Cold asphalt mixture applied and compacted; 72W LED lamp replaced..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <ImageUploader
              images={proofImages}
              onChange={setProofImages}
              maxFiles={2}
              label="Resolution Proof Photos (Mandatory for Resolved Status)"
              helperText="Upload photos showing repaired road patch, working light, clean drain..."
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedComplaint(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={submitting}
              >
                Save Status & Notify Citizen
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
