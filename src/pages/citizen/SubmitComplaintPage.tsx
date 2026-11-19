import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Building2,
  MapPin,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { LeafletComplaintMap } from '../../components/map/LeafletComplaintMap';
import { ImageUploader } from '../../components/common/ImageUploader';
import { analyzeComplaintPriority } from '../../lib/priorityEngine';
import { findPotentialDuplicates } from '../../lib/duplicateEngine';
import { ComplaintPriority } from '../../types/database';
import { JABALPUR_WARDS } from '../auth/RegisterPage';

interface SubmitComplaintPageProps {
  onNavigate: (tab: string) => void;
  onComplaintSubmitted: (complaintId: string) => void;
}

export const SubmitComplaintPage: React.FC<SubmitComplaintPageProps> = ({
  onNavigate,
  onComplaintSubmitted,
}) => {
  const { categories, departments, complaints, submitComplaint } = useComplaints();
  const { user } = useAuth();

  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-roads');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(JABALPUR_WARDS[0]); // default Civic Centre
  const [address, setAddress] = useState('');
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number }>({
    lat: 23.1678, // Jabalpur Civic Centre coordinates
    lng: 79.9328,
  });
  const [images, setImages] = useState<string[]>([]);
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [isPriorityAutoSuggested, setIsPriorityAutoSuggested] = useState(true);
  const [autoPriorityReason, setAutoPriorityReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Current category details
  const currentCategory = categories.find((c) => c.id === categoryId);
  const suggestedDept = departments.find(
    (d) => d.id === currentCategory?.default_department_id
  );

  // Auto-select valid loaded category once categories are fetched from Supabase
  useEffect(() => {
    if (categories.length > 0 && (!categoryId || !categories.some((c) => c.id === categoryId))) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Live priority analysis using smart keyword engine
  useEffect(() => {
    if (isPriorityAutoSuggested) {
      const defaultPri = currentCategory?.default_priority || 'Medium';
      const suggestion = analyzeComplaintPriority(title, description, defaultPri);
      setPriority(suggestion.priority);
      setAutoPriorityReason(suggestion.reason);
    }
  }, [title, description, categoryId, isPriorityAutoSuggested]);

  // Duplicate detection
  const potentialDuplicates = findPotentialDuplicates(
    categoryId,
    ward,
    mapLocation.lat,
    mapLocation.lng,
    complaints
  );

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapLocation({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address.trim()) return;

    setLoading(true);
    const res = await submitComplaint({
      citizenId: user?.id || 'usr-citizen-01',
      categoryId,
      title: title.trim(),
      description: description.trim(),
      priority,
      address: address.trim(),
      wardOrArea: ward,
      latitude: mapLocation.lat,
      longitude: mapLocation.lng,
      imageUrls: images,
    });
    setLoading(false);

    if (res.success && res.complaint) {
      setSubmittedId(res.complaint.complaint_number);
      onComplaintSubmitted(res.complaint.id);
    }
  };

  if (submittedId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-navy-950">
            Grievance Registered Successfully!
          </h2>
          <p className="text-xs text-slate-500">
            Your complaint has been logged into Jabalpur Municipal Corporation's central grievance repository.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-200/80 pb-2">
            <span className="text-slate-500">Reference Number:</span>
            <strong className="text-navy-950 text-sm font-extrabold tracking-wide">
              {submittedId}
            </strong>
          </div>
          <div className="flex justify-between border-b border-slate-200/80 pb-2">
            <span className="text-slate-500">Suggested Department:</span>
            <strong className="text-slate-800">{suggestedDept?.name}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-200/80 pb-2">
            <span className="text-slate-500">Assigned Priority:</span>
            <strong className="text-teal-700 font-bold">{priority}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Service SLA:</span>
            <strong className="text-slate-800">{currentCategory?.sla_hours || 48} Hours</strong>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setSubmittedId(null);
              setTitle('');
              setDescription('');
              setImages([]);
            }}
          >
            File Another Issue
          </Button>
          <Button
            variant="teal"
            onClick={() => onNavigate('my-complaints')}
          >
            View My Complaints
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-navy-950">
          File a Civic Grievance
        </h1>
        <p className="text-xs text-slate-500">
          Submit local civic problems directly to Jabalpur Municipal Corporation departments with GPS coordinates and photos.
        </p>
      </div>

      {/* Duplicate Warning Alert if detected nearby */}
      {potentialDuplicates.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Possible Duplicate Grievance Detected Nearby in Jabalpur</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {potentialDuplicates[0].reason} You can still submit this report, but our field engineering team may already be addressing this problem.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Category & Auto-Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-navy-900" />
              1. Issue Category & Routing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Civic Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.sla_hours}h SLA)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {currentCategory?.description}
                </p>
              </div>

              {/* Suggested Department Pill */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Target Municipal Division
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-navy-950">
                    {suggestedDept?.name || 'Central Corporation Pool'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Standard SLA: <strong>{currentCategory?.sla_hours || 48} Hours</strong></span>
                </div>
              </div>
            </div>

            {/* Smart Priority Suggester Box */}
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-950">
                    Smart Priority Engine:
                  </span>{' '}
                  <span className="text-teal-900">{autoPriorityReason}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">Assigned:</span>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value as ComplaintPriority);
                    setIsPriorityAutoSuggested(false);
                  }}
                  className="px-2 py-1 text-xs font-bold rounded-lg border border-teal-300 bg-white text-navy-950"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Problem Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-navy-900" />
              2. Problem Title & Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grievance Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Broken water pipeline leaking near Civic Centre square"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Provide specific details: landmark, approximate size/severity, how long it has been occurring..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            {/* Photo Attachments */}
            <ImageUploader
              images={images}
              onChange={setImages}
              maxFiles={3}
              label="Attach Site Photos (Optional but Highly Recommended)"
            />
          </CardContent>
        </Card>

        {/* Step 3: Location & Interactive Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-navy-900" />
              3. Location & GPS Coordinate Pin (Jabalpur)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Municipal Ward / Area in Jabalpur *
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                >
                  {JABALPUR_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street / Landmark / Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Marhatal Cut, Civic Centre Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">
                  Interactive Map Pin Dropper
                </span>
                <span className="text-[11px] text-teal-700 font-semibold">
                  Lat: {mapLocation.lat.toFixed(4)}, Lng: {mapLocation.lng.toFixed(4)}
                </span>
              </div>
              <LeafletComplaintMap
                center={[23.1678, 79.9328]}
                selectedLocation={mapLocation}
                onLocationSelect={handleLocationSelect}
                interactiveSelect={true}
                height="320px"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Submission Action */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onNavigate('citizen-dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="teal"
            size="lg"
            className="font-bold shadow-md shadow-teal-900/20"
            isLoading={loading}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Grievance to Jabalpur Municipal Corp
          </Button>
        </div>
      </form>
    </div>
  );
};
