import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import {
  FolderOpen,
  Search,
  Filter,
  MapPin,
  Calendar,
  Building2,
  Clock,
  Star,
  RotateCcw,
  PlusCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLATimerBadge } from '../../components/common/SLATimerBadge';
import { TimelineView } from '../../components/common/TimelineView';
import { formatDate } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';
import { ComplaintStatus, Complaint } from '../../types/database';

interface MyComplaintsPageProps {
  onNavigate: (tab: string) => void;
  selectedComplaintId?: string | null;
}

export const MyComplaintsPage: React.FC<MyComplaintsPageProps> = ({
  onNavigate,
  selectedComplaintId,
}) => {
  const { user } = useAuth();
  const { complaints, updates, rateComplaint, reopenComplaint, deleteComplaint } = useComplaints();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(() => {
    if (selectedComplaintId) {
      return complaints.find((c) => c.id === selectedComplaintId) || null;
    }
    return null;
  });

  // Modal states for Feedback / Reopen
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Filter complaints filed by this citizen
  const myComplaints = complaints.filter(
    (c) =>
      c.citizen_id === user?.id ||
      (user?.email === 'citizen@smartcity.gov.in' && c.citizen_id === 'usr-citizen-01')
  );

  const filteredComplaints = myComplaints.filter((comp) => {
    const matchesStatus =
      statusFilter === 'All' || comp.status === statusFilter;
    const matchesSearch =
      comp.complaint_number.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      comp.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      comp.ward_or_area.toLowerCase().includes(searchTerm.toLowerCase().trim());
    return matchesStatus && matchesSearch;
  });

  const complaintUpdates = viewingComplaint
    ? updates.filter((u) => u.complaint_id === viewingComplaint.id)
    : [];

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingComplaint) return;
    setSubmittingAction(true);
    await rateComplaint(
      viewingComplaint.id,
      user?.id || 'usr-citizen-01',
      ratingVal,
      feedbackComment
    );
    setSubmittingAction(false);
    setShowRatingModal(false);
    setFeedbackComment('');
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingComplaint || !reopenReason.trim()) return;
    setSubmittingAction(true);
    await reopenComplaint(
      viewingComplaint.id,
      user?.id || 'usr-citizen-01',
      reopenReason
    );
    setSubmittingAction(false);
    setShowReopenModal(false);
    setReopenReason('');
  };

  const statusTabs = ['All', 'Submitted', 'In Progress', 'Resolved', 'Reopened'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            My Submitted Grievances
          </h1>
          <p className="text-xs text-slate-500">
            Track status history, view resolution proof, and rate work quality
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          onClick={() => onNavigate('submit-complaint')}
          className="font-bold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          File New Grievance
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {statusTabs.map((tab) => (
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

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, keyword, ward..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            No complaints found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No grievances match "${searchTerm}". Try a different search keyword.`
              : 'You have not submitted any complaints matching this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((comp) => (
            <Card
              key={comp.id}
              className="civic-card-hover border-t-2 border-t-navy-900 flex flex-col justify-between"
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
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{comp.ward_or_area}</span>
                  </div>
                  <SLATimerBadge
                    createdAt={comp.created_at}
                    slaHours={comp.category?.sla_hours || 48}
                    resolvedAt={comp.resolved_at}
                  />
                </div>
              </CardContent>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {formatDate(comp.created_at)}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingComplaint(comp)}
                    className="text-xs"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Tracking
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Cancel and remove complaint ${comp.complaint_number}?`
                        )
                      ) {
                        deleteComplaint(comp.id);
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Cancel & Delete Complaint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details & Status Modal */}
      {viewingComplaint && (
        <Modal
          isOpen={!!viewingComplaint}
          onClose={() => setViewingComplaint(null)}
          title={`Grievance: ${viewingComplaint.complaint_number}`}
          description={`Logged on ${formatDate(viewingComplaint.created_at)}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={viewingComplaint.status} />
              <PriorityBadge priority={viewingComplaint.priority} />
              <SLATimerBadge
                createdAt={viewingComplaint.created_at}
                slaHours={viewingComplaint.category?.sla_hours || 48}
                resolvedAt={viewingComplaint.resolved_at}
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {viewingComplaint.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {viewingComplaint.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Ward / Area</span>
                <span className="font-semibold text-slate-800">
                  {viewingComplaint.address} ({viewingComplaint.ward_or_area})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Assigned Division</span>
                <span className="font-semibold text-slate-800">
                  {viewingComplaint.department?.name || 'Central Corporation Triage'}
                </span>
              </div>
            </div>

            {/* If resolved, show Citizen Feedback / Reopen options */}
            {viewingComplaint.status === 'Resolved' && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-emerald-900 font-semibold">
                  This complaint is resolved. Please verify the work:
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReopenModal(true)}
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reopen Ticket
                  </Button>
                  <Button
                    size="sm"
                    variant="teal"
                    onClick={() => setShowRatingModal(true)}
                  >
                    <Star className="w-3.5 h-3.5 mr-1" /> Rate Work
                  </Button>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                Live Status Timeline
              </h4>
              <TimelineView updates={complaintUpdates} />
            </div>
          </div>
        </Modal>
      )}

      {/* Citizen Feedback Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Grievance Resolution"
        description="Share your feedback on the work performed by the municipal team."
      >
        <form onSubmit={handleRatingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Star Rating (1 to 5)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingVal(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comments
            </label>
            <textarea
              required
              rows={3}
              placeholder="How well was the issue addressed? Was the area cleaned up properly?"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRatingModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="teal"
              size="sm"
              isLoading={submittingAction}
            >
              Submit Rating
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reopen Complaint Modal */}
      <Modal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        title="Reopen Grievance Ticket"
        description="If the civic issue persists or work was incomplete, explain why."
      >
        <form onSubmit={handleReopenSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Reopening *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain why the problem was not properly solved..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowReopenModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={submittingAction}
            >
              Confirm Reopen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
