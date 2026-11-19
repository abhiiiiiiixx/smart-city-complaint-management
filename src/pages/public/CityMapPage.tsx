import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { MapPin, Filter, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { LeafletComplaintMap } from '../../components/map/LeafletComplaintMap';
import { Complaint } from '../../types/database';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Button } from '../../components/ui/Button';

interface CityMapPageProps {
  onNavigate: (tab: string) => void;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const CityMapPage: React.FC<CityMapPageProps> = ({
  onNavigate,
  onSelectComplaint,
}) => {
  const { complaints, categories } = useComplaints();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  const filtered = complaints.filter((c) => {
    const matchesCat = categoryFilter === 'All' || c.category_id === categoryFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            Interactive Jabalpur Civic Grievance Map
          </h1>
          <p className="text-xs text-slate-500">
            Geospatial visualization of local civic problems across municipal wards
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-white p-3 rounded-xl border border-slate-200">
        <span className="font-bold text-slate-700">Map Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
          <span className="text-slate-600">Critical Safety Hazard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-600">High Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-slate-600">Medium / Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-600">Resolved by Field Squad</span>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeafletComplaintMap
            complaints={filtered}
            onComplaintClick={(c) => setActiveComplaint(c)}
            height="540px"
          />
        </div>

        {/* Selected Complaint Detail Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-navy-950">
                Selected Issue Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              {activeComplaint ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950">
                      {activeComplaint.complaint_number}
                    </span>
                    <StatusBadge status={activeComplaint.status} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {activeComplaint.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeComplaint.description}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                    <p><strong>Ward / Locality:</strong> {activeComplaint.ward_or_area}</p>
                    <p><strong>Address:</strong> {activeComplaint.address}</p>
                    <p><strong>Division:</strong> {activeComplaint.department?.name || 'Central Municipal Pool'}</p>
                    <p><strong>GPS Coordinates:</strong> {activeComplaint.latitude?.toFixed(4)}, {activeComplaint.longitude?.toFixed(4)}</p>
                  </div>

                  {activeComplaint.image_urls && activeComplaint.image_urls.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">Photo Attached:</span>
                      <img
                        src={activeComplaint.image_urls[0]}
                        alt="Issue photo"
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Click on any marker on the map to inspect details.</p>
                </div>
              )}

              {activeComplaint && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Button
                    variant="teal"
                    size="sm"
                    className="w-full font-bold text-xs"
                    onClick={() => {
                      if (onSelectComplaint) onSelectComplaint(activeComplaint);
                      onNavigate('track');
                    }}
                  >
                    Open Live Tracking Dossier
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
