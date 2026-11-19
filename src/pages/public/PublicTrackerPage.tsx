import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  Star,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { SLATimerBadge } from '../../components/common/SLATimerBadge';
import { TimelineView } from '../../components/common/TimelineView';
import { formatDate } from '../../lib/utils';
import { Modal } from '../../components/ui/Modal';

interface PublicTrackerPageProps {
  initialSearch?: string;
  onNavigate: (tab: string) => void;
}

export const PublicTrackerPage: React.FC<PublicTrackerPageProps> = ({
  initialSearch = '',
  onNavigate,
}) => {
  const { complaints, updates, rateComplaint, reopenComplaint } = useComplaints();
  const { user, isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeComplaint, setActiveComplaint] = useState(() => {
    if (initialSearch) {
      return complaints.find(
        (c) => c.complaint_number.toLowerCase() === initialSearch.toLowerCase().trim()
      );
    }
    return complaints[0]; // Default to first complaint
  });

  // Modal states for Feedback / Reopen
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = complaints.find(
      (c) =>
        c.complaint_number.toLowerCase() === searchQuery.toLowerCase().trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
    if (found) {
      setActiveComplaint(found);
    }
  };

  const complaintUpdates = activeComplaint
    ? updates.filter((u) => u.complaint_id === activeComplaint.id)
    : [];

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    setSubmittingAction(true);
    await rateComplaint(
      activeComplaint.id,
      user?.id || 'guest-citizen',
      ratingVal,
      feedbackComment
    );
    setSubmittingAction(false);
    setShowRatingModal(false);
    setFeedbackComment('');
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint || !reopenReason.trim()) return;
    setSubmittingAction(true);
    await reopenComplaint(
      activeComplaint.id,
      user?.id || 'guest-citizen',
      reopenReason
    );
    setSubmittingAction(false);
    setShowReopenModal(false);
    setReopenReason('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
          Public Grievance Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Enter any complaint reference number to inspect live stage, assigned department, field inspection reports, and resolution timeline.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. SC-2026-0001"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white shadow-xs"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Track
          </Button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <span className="text-[11px] text-slate-400">Quick Track:</span>
          {complaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchQuery(c.complaint_number);
                setActiveComplaint(c);
              }}
              className="text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 transition-colors"
            >
              {c.complaint_number}
            </button>
          ))}
        </div>
      </div>

      {activeComplaint ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Complaint Overview Card */}
          <Card className="border-t-4 border-t-navy-900">
            <CardHeader className="bg-slate-50/60 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-navy-950">
                    {activeComplaint.complaint_number}
                  </span>
                  <StatusBadge status={activeComplaint.status} />
                  <PriorityBadge priority={activeComplaint.priority} />
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Filed on {formatDate(activeComplaint.created_at)}</span>
                  <span>•</span>
                  <span>{activeComplaint.category?.name || 'Civic Issue'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <SLATimerBadge
                  createdAt={activeComplaint.created_at}
                  slaHours={activeComplaint.category?.sla_hours || 48}
                  resolvedAt={activeComplaint.resolved_at}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeComplaint.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {activeComplaint.description}
                </p>
              </div>

              {/* Location & Department Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Location / Address</span>
                  <div className="flex items-start gap-1.5 mt-1 font-semibold text-slate-800">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{activeComplaint.address} ({activeComplaint.ward_or_area})</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Assigned Department</span>
                  <div className="flex items-start gap-1.5 mt-1 font-semibold text-slate-800">
                    <Building2 className="w-4 h-4 text-navy-900 shrink-0 mt-0.5" />
                    <span>{activeComplaint.department?.name || 'Central Municipal Triage'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Designated Officer</span>
                  <p className="mt-1 font-semibold text-slate-800">
                    {activeComplaint.officer
                      ? `${activeComplaint.officer.designation} (${activeComplaint.officer.badge_number})`
                      : 'Pending Assignment'}
                  </p>
                </div>
              </div>

              {/* Uploaded Complaint Images */}
              {activeComplaint.image_urls && activeComplaint.image_urls.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    Citizen Photos Attached
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {activeComplaint.image_urls.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={img}
                          alt="Grievance proof"
                          className="w-32 h-24 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Citizen Actions: Rate or Reopen if Resolved */}
              {activeComplaint.status === 'Resolved' && (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">
                        Issue Resolved by Municipal Team
                      </p>
                      <p className="text-xs text-emerald-700">
                        Resolved on {formatDate(activeComplaint.resolved_at)}. Are you satisfied with the work?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReopenModal(true)}
                      className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reopen Ticket
                    </Button>
                    <Button
                      size="sm"
                      variant="teal"
                      onClick={() => setShowRatingModal(true)}
                      className="text-xs font-bold"
                    >
                      <Star className="w-3.5 h-3.5 mr-1" /> Rate Resolution
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chronological Status Audit Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-navy-900" />
                Live Status & Resolution Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineView updates={complaintUpdates} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            No Complaint Found with ID "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please verify the complaint reference number format (e.g. SC-2026-0001) and try again.
          </p>
        </div>
      )}

      {/* Citizen Feedback Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Grievance Resolution"
        description="Your feedback directly impacts municipal officer performance scores."
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
              <span className="text-xs font-bold text-slate-700 ml-2">
                {ratingVal === 5
                  ? 'Excellent'
                  : ratingVal === 4
                  ? 'Good'
                  : ratingVal === 3
                  ? 'Satisfactory'
                  : 'Poor'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comments / Citizen Remarks
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
              Submit Feedback
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
              placeholder="e.g. Pothole was only partially filled with gravel; water pipe still dripping..."
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
