import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLATimerBadge } from '../../components/common/SLATimerBadge';
import { Modal } from '../../components/ui/Modal';
import { ImageUploader } from '../../components/common/ImageUploader';
import { TimelineView } from '../../components/common/TimelineView';
import { ComplaintStatus, ComplaintPriority, Complaint } from '../../types/database';
import { formatDate } from '../../lib/utils';

export const AssignedComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, officers, departments, updates, updateComplaintStatus } = useComplaints();

  // Current officer record
  const currentOfficer = officers.find(
    (o) => o.profile_id === user?.id || o.profile_id === 'usr-officer-01'
  );
  const currentDept = departments.find(
    (d) => d.id === currentOfficer?.department_id || d.id === 'dept-roads'
  );

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected complaint for Update or View
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [viewingDetails, setViewingDetails] = useState<Complaint | null>(null);

  // Form states for status update
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [remarks, setRemarks] = useState('');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // All department complaints
  const deptComplaints = complaints.filter(
    (c) =>
      c.assigned_department_id === currentDept?.id ||
      c.assigned_officer_id === currentOfficer?.id
  );

  const filtered = deptComplaints.filter((comp) => {
    const matchesPriority =
      priorityFilter === 'All' || comp.priority === priorityFilter;

    let matchesStatus = true;
    if (statusFilter === 'Active') {
      matchesStatus = comp.status !== 'Resolved' && comp.status !== 'Rejected';
    } else if (statusFilter !== 'All') {
      matchesStatus = comp.status === statusFilter;
    }

    const matchesSearch =
      comp.complaint_number.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      comp.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      comp.ward_or_area.toLowerCase().includes(searchTerm.toLowerCase().trim());

    return matchesPriority && matchesStatus && matchesSearch;
  });

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

  const viewingUpdates = viewingDetails
    ? updates.filter((u) => u.complaint_id === viewingDetails.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">
          Department Grievance Queue
        </h1>
        <p className="text-xs text-slate-500">
          {currentDept?.name} • Manage field assignments, log maintenance, and submit proof
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['Active', 'All', 'Assigned', 'In Progress', 'Resolved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ID, title, ward..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No complaints found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No active tickets match your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((comp) => (
            <Card
              key={comp.id}
              className={`civic-card-hover border-t-2 ${
                comp.priority === 'Critical'
                  ? 'border-t-rose-600 bg-rose-50/10'
                  : 'border-t-navy-900'
              } flex flex-col justify-between`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-navy-950 tracking-wide">
                    {comp.complaint_number}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={comp.status} />
                    <PriorityBadge priority={comp.priority} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                  {comp.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {comp.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    {comp.ward_or_area}
                  </span>
                  <SLATimerBadge
                    createdAt={comp.created_at}
                    slaHours={comp.category?.sla_hours || 48}
                    resolvedAt={comp.resolved_at}
                  />
                </div>
              </CardContent>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setViewingDetails(comp)}
                  className="text-slate-500 hover:text-navy-950 font-medium flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>

                <Button
                  size="sm"
                  variant="teal"
                  onClick={() => handleOpenUpdate(comp)}
                  className="text-xs font-bold"
                >
                  <Wrench className="w-3 h-3 mr-1" />
                  Update Progress
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {viewingDetails && (
        <Modal
          isOpen={!!viewingDetails}
          onClose={() => setViewingDetails(null)}
          title={`Ticket Details: ${viewingDetails.complaint_number}`}
          description={`Filed on ${formatDate(viewingDetails.created_at)}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={viewingDetails.status} />
              <PriorityBadge priority={viewingDetails.priority} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{viewingDetails.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{viewingDetails.description}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p><strong>Address:</strong> {viewingDetails.address} ({viewingDetails.ward_or_area})</p>
              <p className="mt-1"><strong>Coordinates:</strong> Lat {viewingDetails.latitude?.toFixed(4)}, Lng {viewingDetails.longitude?.toFixed(4)}</p>
            </div>

            {/* Photos */}
            {viewingDetails.image_urls && viewingDetails.image_urls.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">Citizen Photos:</span>
                <div className="flex gap-2">
                  {viewingDetails.image_urls.map((img, i) => (
                    <img key={i} src={img} alt="Citizen proof" className="w-24 h-20 object-cover rounded-lg border" />
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">History & Log:</span>
              <TimelineView updates={viewingUpdates} />
            </div>
          </div>
        </Modal>
      )}

      {/* Status Update Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Update Status: ${selectedComplaint.complaint_number}`}
          description="Log maintenance progress, change ticket stage, and attach photographic proof."
          maxWidth="xl"
        >
          <form onSubmit={handleStatusSubmit} className="space-y-4">
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
                placeholder="Describe action taken on site..."
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
