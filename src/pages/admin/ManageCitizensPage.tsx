import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { Users, Mail, Phone, MapPin, Calendar, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { DEMO_PROFILES } from '../../lib/mockData';
import { formatDate } from '../../lib/utils';

export const ManageCitizensPage: React.FC = () => {
  const { complaints } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');

  const citizenProfiles = DEMO_PROFILES.filter((p) => p.role === 'citizen');

  const filtered = citizenProfiles.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      c.phone.includes(searchTerm.trim())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Registered Citizen Directory ({citizenProfiles.length})
          </h1>
          <p className="text-xs text-slate-500">
            Verified resident profiles registered under Jabalpur Smart City Municipal Network
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search citizen by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4">Citizen Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Phone (+91)</th>
                <th className="py-3 px-4">Residential Ward / Address</th>
                <th className="py-3 px-4">Complaints Filed</th>
                <th className="py-3 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filtered.map((cit) => {
                const count = complaints.filter(
                  (c) => c.citizen_id === cit.id
                ).length;

                return (
                  <tr key={cit.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-navy-950">
                      {cit.full_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {cit.email}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      +91 {cit.phone}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">
                      {cit.address}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {count} Filed
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(cit.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
