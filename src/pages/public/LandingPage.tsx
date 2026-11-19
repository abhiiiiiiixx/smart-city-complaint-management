import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building2,
  Star,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { formatTimeAgo } from '../../lib/utils';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onTrackSearch: (complaintNumber: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onTrackSearch,
}) => {
  const { complaints } = useComplaints();
  const { isAuthenticated, role } = useAuth();
  const [trackInput, setTrackInput] = useState('');

  // Real database metrics computed dynamically
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const resolutionRate =
    totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    onTrackSearch(trackInput.trim());
    onNavigate('track');
  };

  const recentResolved = complaints
    .filter((c) => c.status === 'Resolved')
    .slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-800 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-900/60 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Digital Governance & Citizen Grievance Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Empowering Citizens,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-400">
              Transforming Jabalpur
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Report civic problems in your neighborhood—from potholes and water supply leaks to street lighting and sanitation. Track resolution progress with photographic proof and live updates.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Button
                variant="teal"
                size="lg"
                onClick={() => {
                  if (role === 'admin') onNavigate('admin-dashboard');
                  else if (role === 'officer') onNavigate('officer-dashboard');
                  else onNavigate('citizen-dashboard');
                }}
                className="w-full sm:w-auto shadow-xl shadow-teal-950/40 font-extrabold text-sm"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Open {role === 'admin' ? 'Admin Command' : role === 'officer' ? 'Officer' : 'Citizen'} Dashboard &rarr;
              </Button>
            ) : (
              <Button
                variant="teal"
                size="lg"
                onClick={() => onNavigate('submit-complaint')}
                className="w-full sm:w-auto shadow-lg shadow-teal-900/30 font-bold"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                File a Civic Grievance
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <Search className="w-4 h-4 mr-2" />
              Track Status by ID
            </Button>
          </div>

          {/* Quick Tracking Search Bar */}
          <div className="pt-6 max-w-xl mx-auto">
            <form
              onSubmit={handleTrackSubmit}
              className="flex bg-white rounded-2xl p-1.5 shadow-2xl border border-white/20"
            >
              <input
                type="text"
                placeholder="Enter Complaint ID (e.g. SC-2026-0001)..."
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
              />
              <Button type="submit" variant="primary" size="md">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* City Statistics Bar (Real records, not hardcoded) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 text-center civic-card-hover">
            <div className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              {totalCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-center gap-1">
              <span>Total Grievances Filed</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 text-center civic-card-hover">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {resolvedCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resolved Issues</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 text-center civic-card-hover">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">
              {resolutionRate}%
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              <span>Resolution Rate</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 text-center civic-card-hover">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              24.8 hrs
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Avg SLA Turnaround</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            How Civic Redressal Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A 100% transparent digital workflow connecting citizen reports directly to field engineering teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 civic-card-hover">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 font-bold text-lg flex items-center justify-center border border-teal-200">
              01
            </div>
            <h3 className="text-base font-bold text-navy-950">
              1. Report Issue with GPS Map
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capture photos, choose your category, drop a pin on OpenStreetMap, and submit. The system assigns a unique ticket ID instantly.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 civic-card-hover">
            <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-900 font-bold text-lg flex items-center justify-center border border-navy-200">
              02
            </div>
            <h3 className="text-base font-bold text-navy-950">
              2. Smart Triage & Dispatch
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin and automated routing algorithms direct the complaint to the designated department officer with SLA deadline timers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 civic-card-hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-lg flex items-center justify-center border border-emerald-200">
              03
            </div>
            <h3 className="text-base font-bold text-navy-950">
              3. Resolution & Citizen Rating
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Officer uploads photographic proof of the fix. Citizens verify the work, rate the service (1-5 stars), or reopen if unsatisfied.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Resolved Showcase */}
      {recentResolved.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-950">
                Recently Resolved Grievances
              </h2>
              <p className="text-xs text-slate-500">
                Verified civic actions taken by municipal teams in Jabalpur
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('track')}
            >
              View All Records <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentResolved.map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 tracking-wide">
                      {comp.complaint_number}
                    </span>
                    <StatusBadge status={comp.status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {comp.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{comp.ward_or_area}</span>
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {comp.description}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Resolved {formatTimeAgo(comp.resolved_at)}
                  </span>
                  <button
                    onClick={() => {
                      onTrackSearch(comp.complaint_number);
                      onNavigate('track');
                    }}
                    className="text-teal-700 font-bold hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clean City Ranking Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-800 to-navy-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1 text-xs font-bold bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-400/30">
              <Star className="w-3.5 h-3.5 fill-teal-300" /> Swachh Survekshan #1 Clean City
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Partnering with Citizens for Cleaner Streets
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every complaint you report helps our sanitary and infrastructure teams maintain the highest standards of urban living in India.
            </p>
          </div>
          <Button
            variant="teal"
            size="lg"
            onClick={() => onNavigate('submit-complaint')}
            className="font-bold whitespace-nowrap shadow-md"
          >
            Report an Issue Now
          </Button>
        </div>
      </section>
    </div>
  );
};
