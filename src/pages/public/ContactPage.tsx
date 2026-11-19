import React from 'react';
import { Phone, Mail, MapPin, Building2, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export const ContactPage: React.FC = () => {
  const zonalOffices = [
    {
      zone: 'Zone 1 - Wright Town & Civic Centre',
      wards: 'Wards 1 to 15 (Civic Centre, Wright Town, Russell Chowk)',
      address: 'Municipal HQ Campus, Wright Town, Jabalpur',
      phone: '0761-2611751',
      officer: 'Shri Rajesh Mishra (Zonal Officer)',
    },
    {
      zone: 'Zone 2 - Napier Town & Shastri Bridge',
      wards: 'Wards 16 to 28 (Napier Town, Home Science College, Shastri Bridge)',
      address: 'Old Municipal Office, Napier Town, Jabalpur',
      phone: '0761-2611752',
      officer: 'Smt. Sunita Tiwari (Zonal Officer)',
    },
    {
      zone: 'Zone 3 - Gorakhpur & Howbagh',
      wards: 'Wards 29 to 42 (Gorakhpur, Rampur, Howbagh, Katanga)',
      address: 'Zonal Complex, Gorakhpur Main Road, Jabalpur',
      phone: '0761-2611753',
      officer: 'Er. Vivek Verma (Zonal Officer)',
    },
    {
      zone: 'Zone 4 - Madan Mahal & Garha',
      wards: 'Wards 43 to 56 (Madan Mahal, Dashmesh Dwar, Medical College, Garha)',
      address: 'Zonal Office, Medical College Road, Garha, Jabalpur',
      phone: '0761-2611754',
      officer: 'Shri Anoop Sharma (Zonal Officer)',
    },
    {
      zone: 'Zone 5 - Adhartal & ITI',
      wards: 'Wards 57 to 68 (Adhartal, Suhagi, Anand Nagar, ITI)',
      address: 'Zonal Complex, Adhartal Chowk, Jabalpur',
      phone: '0761-2611755',
      officer: 'Er. Neelam Patel (Zonal Officer)',
    },
    {
      zone: 'Zone 6 - Ranjhi & Bada Patthar',
      wards: 'Wards 69 to 79 (Ranjhi, Bada Patthar, Khamaria, Tilhari)',
      address: 'Zonal Depot, Ranjhi Main Market, Jabalpur',
      phone: '0761-2611756',
      officer: 'Shri Hemant Dubey (Zonal Officer)',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950">
          Municipal Zonal Offices & Helpline Directory
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Connect directly with your ward municipal officials or reach the 24x7 Central Command & Control Centre (ICCC).
        </p>
      </div>

      {/* Central Emergency Call Center Banner */}
      <div className="bg-gradient-to-r from-navy-950 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <Clock className="w-3.5 h-3.5" /> 24x7 Integrated Command Centre
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">Central Municipal Control Room</h3>
          <p className="text-xs text-slate-300 max-w-lg">
            Immediate dispatch for hazardous live wires, major water main bursts, sewage overflows, and emergency civic rescue.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center min-w-[200px]">
          <span className="text-[10px] text-teal-300 uppercase tracking-widest font-bold">Toll Free Helpline</span>
          <p className="text-2xl font-extrabold text-white mt-0.5">1800-233-5555</p>
          <span className="text-[10px] text-slate-300">WhatsApp: +91 98260 55555</span>
        </div>
      </div>

      {/* Zonal Offices Directory Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-navy-950">
          Ward Zonal Offices in Jabalpur
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zonalOffices.map((z, idx) => (
            <Card key={idx} className="civic-card-hover">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                    {z.zone}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">{z.wards}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{z.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-800">{z.phone}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    In-Charge: <strong className="text-slate-600">{z.officer}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
