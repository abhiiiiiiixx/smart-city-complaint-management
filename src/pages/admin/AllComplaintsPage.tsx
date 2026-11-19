import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList,
  Search,
  Filter,
  MapPin,
  Calendar,
  Building2,
  Clock,
  UserCheck,
  Eye,
  ArrowUpDown,
  Download,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLATimerBadge } from '../../components/common/SLATimerBadge';
import { TimelineView } from '../../components/common/TimelineView';
import { Modal } from '../../components/ui/Modal';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../../types/database';
import { formatDate } from '../../lib/utils';

export const AllComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    complaints,
    departments,
    categories,
    officers,
    updates,
    assignComplaint,
    changePriority,
    deleteComplaint,
    resetComplaints,
  } = useComplaints();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // Assignment Modal
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [targetDeptId, setTargetDeptId] = useState('');
  const [targetOfficerId, setTargetOfficerId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // View Details Modal
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);

  const filteredComplaints = complaints.filter((comp) => {
    const matchesSearch =
      comp.complaint_number.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      comp.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      comp.ward_or_area.toLowerCase().includes(searchTerm.toLowerCase().trim());

    const matchesDept =
      selectedDept === 'All' || comp.assigned_department_id === selectedDept;

    const matchesCat =
      selectedCat === 'All' || comp.category_id === selectedCat;

    const matchesStatus =
      selectedStatus === 'All' || comp.status === selectedStatus;

    const matchesPriority =
      selectedPriority === 'All' || comp.priority === selectedPriority;

    return matchesSearch && matchesDept && matchesCat && matchesStatus && matchesPriority;
  });

  const handleOpenAssignModal = (comp: Complaint) => {
    setAssigningComplaint(comp);
    setTargetDeptId(comp.assigned_department_id || departments[0]?.id || '');
    setTargetOfficerId(comp.assigned_officer_id || '');
    setAssignmentNotes('');
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningComplaint) return;
    setIsAssigning(true);
    await assignComplaint(
      assigningComplaint.id,
      targetDeptId,
      targetOfficerId || undefined,
      assignmentNotes,
      user?.id
    );
    setIsAssigning(false);
    setAssigningComplaint(null);
  };

  const handlePriorityChange = async (complaintId: string, pri: ComplaintPriority) => {
    await changePriority(complaintId, pri, user?.id, user?.full_name);
  };

  const viewingUpdates = viewingComplaint
    ? updates.filter((u) => u.complaint_id === viewingComplaint.id)
    : [];

  const availableOfficersForDept = officers.filter(
    (o) => o.department_id === targetDeptId
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            All Municipal Grievances ({filteredComplaints.length})
          </h1>
          <p className="text-xs text-slate-500">
            Search, triage, assign department officers, and manage city-wide priorities
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (
              window.confirm(
                'Reset all complaints back to the clean default Jabalpur demo tickets? Any new tickets you created during testing will be removed.'
              )
            ) {
              resetComplaints();
            }
          }}
          className="text-xs text-slate-600 hover:text-rose-700 hover:border-rose-300 font-semibold"
          title="Reset tickets back to default demo data"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
          Reset to Clean Demo Tickets
        </Button>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ID, title, ward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
            <option value="Reopened">Reopened</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Complaints Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Title & Ward</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department & Officer</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status & SLA</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No complaints matching current filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-extrabold text-navy-950 whitespace-nowrap">
                      {comp.complaint_number}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {comp.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {comp.ward_or_area}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800">
                        {comp.category?.name || 'Civic'}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {comp.department?.name || 'Unassigned'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {comp.officer ? comp.officer.designation : 'No Officer'}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={comp.priority}
                        onChange={(e) =>
                          handlePriorityChange(comp.id, e.target.value as ComplaintPriority)
                        }
                        className={`text-xs font-bold rounded-lg px-2 py-0.5 border ${
                          comp.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : comp.priority === 'High'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap space-y-1">
                      <StatusBadge status={comp.status} />
                      <div>
                        <SLATimerBadge
                          createdAt={comp.created_at}
                          slaHours={comp.category?.sla_hours || 48}
                          resolvedAt={comp.resolved_at}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingComplaint(comp)}
                        className="text-xs"
                        title="View Full Audit"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenAssignModal(comp)}
                        className="text-xs font-bold"
                        title="Assign Department Officer"
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to permanently delete ticket ${comp.complaint_number}?`
                            )
                          ) {
                            deleteComplaint(comp.id);
                          }
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Assignment & Routing Modal */}
      {assigningComplaint && (
        <Modal
          isOpen={!!assigningComplaint}
          onClose={() => setAssigningComplaint(null)}
          title={`Assign Grievance: ${assigningComplaint.complaint_number}`}
          description="Route complaint to the responsible municipal department and designate a field officer."
          maxWidth="lg"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-navy-950 block">
                {assigningComplaint.title}
              </span>
              <p className="text-slate-500">
                Location: {assigningComplaint.address} ({assigningComplaint.ward_or_area})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Department *
              </label>
              <select
                required
                value={targetDeptId}
                onChange={(e) => {
                  setTargetDeptId(e.target.value);
                  setTargetOfficerId(''); // reset officer when dept changes
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white font-semibold"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designate Field Officer (Optional)
              </label>
              <select
                value={targetOfficerId}
                onChange={(e) => setTargetOfficerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
              >
                <option value="">-- General Department Pool (Any Officer) --</option>
                {availableOfficersForDept.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.designation} (Badge: {off.badge_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Administrative Dispatch Notes
              </label>
              <textarea
                rows={3}
                placeholder="Instructions for the field engineer: e.g. Inspect road patch by tomorrow 11 AM..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAssigningComplaint(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isAssigning}
              >
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Details Modal */}
      {viewingComplaint && (
        <Modal
          isOpen={!!viewingComplaint}
          onClose={() => setViewingComplaint(null)}
          title={`Grievance Dossier: ${viewingComplaint.complaint_number}`}
          description={`Filed on ${formatDate(viewingComplaint.created_at)}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={viewingComplaint.status} />
              <PriorityBadge priority={viewingComplaint.priority} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{viewingComplaint.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{viewingComplaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <p><strong>Citizen:</strong> {viewingComplaint.citizen?.full_name || 'Rahul Sharma'}</p>
                <p><strong>Phone:</strong> {viewingComplaint.citizen?.phone || '9826012345'}</p>
              </div>
              <div>
                <p><strong>Address:</strong> {viewingComplaint.address}</p>
                <p><strong>Ward:</strong> {viewingComplaint.ward_or_area}</p>
              </div>
            </div>

            {/* Photos */}
            {viewingComplaint.image_urls && viewingComplaint.image_urls.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">Attached Photos:</span>
                <div className="flex gap-2">
                  {viewingComplaint.image_urls.map((img, i) => (
                    <img key={i} src={img} alt="Citizen proof" className="w-24 h-20 object-cover rounded-lg border" />
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Audit History:</span>
              <TimelineView updates={viewingUpdates} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
