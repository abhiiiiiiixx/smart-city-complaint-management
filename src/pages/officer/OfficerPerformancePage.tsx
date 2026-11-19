import React from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { Award, Clock, Star, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const OfficerPerformancePage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, feedbackList } = useComplaints();

  // Compute officer performance metrics
  const officerComplaints = complaints.filter(
    (c) => c.assigned_officer_id === 'off-01' || c.assigned_department_id === 'dept-roads'
  );
  const resolved = officerComplaints.filter((c) => c.status === 'Resolved');

  const officerFeedback = feedbackList.filter((f) =>
    officerComplaints.some((c) => c.id === f.complaint_id)
  );

  const avgRating =
    officerFeedback.length > 0
      ? (
          officerFeedback.reduce((acc, curr) => acc + curr.rating, 0) /
          officerFeedback.length
        ).toFixed(1)
      : '4.8';

  const monthlyData = [
    { month: 'Jun', resolved: 14, target: 15 },
    { month: 'Jul', resolved: 19, target: 18 },
    { month: 'Aug', resolved: 22, target: 20 },
    { month: 'Sep', resolved: 25, target: 22 },
    { month: 'Oct', resolved: 28, target: 25 },
    { month: 'Nov', resolved: resolved.length + 8, target: 15 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">
          Officer Performance & Service Level Agreements (SLA)
        </h1>
        <p className="text-xs text-slate-500">
          Individual engineer scorecard, citizen satisfaction metrics, and monthly resolution targets
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{avgRating} / 5.0</div>
              <div className="text-xs text-slate-500 font-medium">Citizen Star Rating</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-teal-700">96.4%</div>
              <div className="text-xs text-slate-500 font-medium">SLA Compliance</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-blue-600">18.5 hrs</div>
              <div className="text-xs text-slate-500 font-medium">Avg Resolution Time</div>
            </div>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600">{resolved.length + 115}</div>
              <div className="text-xs text-slate-500 font-medium">Lifetime Resolved</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-navy-900" />
            Monthly Resolution Trend vs Corporation Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F2942',
                    borderColor: '#1E3A8A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="resolved" fill="#0D9488" radius={[4, 4, 0, 0]} name="Resolved Tickets" />
                <Bar dataKey="target" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Monthly Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
