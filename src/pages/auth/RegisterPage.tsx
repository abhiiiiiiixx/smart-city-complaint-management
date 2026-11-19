import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, Mail, Phone, MapPin, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { isValidIndianPhone } from '../../lib/utils';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const JABALPUR_WARDS = [
  'Ward 12 - Civic Centre / Marhatal',
  'Ward 18 - Wright Town / Stadium',
  'Ward 22 - Napier Town / Shastri Bridge',
  'Ward 25 - Russell Chowk / Ganjipura',
  'Ward 31 - Gorakhpur / Howbagh',
  'Ward 36 - Madan Mahal / Dashmesh Dwar',
  'Ward 42 - Garha / Medical College',
  'Ward 48 - Ghamapur / Lalmati',
  'Ward 55 - Adhartal / ITI',
  'Ward 62 - Ranjhi / Bada Patthar',
  'Ward 68 - Vijay Nagar / ISBT Jabalpur',
  'Ward 74 - Tilhari / Mandla Road',
];

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState(JABALPUR_WARDS[0]); // default Civic Centre
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isValidIndianPhone(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9425112345).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const fullAddress = `${address}, ${ward}, Jabalpur`;
    const res = await register({
      fullName,
      email,
      phone,
      password,
      address: fullAddress,
      city: 'Jabalpur',
    });
    setLoading(false);

    if (res.success) {
      onNavigate('citizen-dashboard');
    } else {
      setErrorMsg(res.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-navy-950 mx-auto flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="w-7 h-7 text-teal-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-950">
          Citizen Registration
        </h1>
        <p className="text-xs text-slate-500">
          Join Jabalpur Smart City Citizen Grievance Network
        </p>
      </div>

      <Card className="border-t-4 border-t-teal-600 shadow-md">
        <CardContent className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name (Citizen) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="rahul.sharma@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Indian Mobile Number (+91) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit number (e.g. 9425112345)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

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
                House / Flat / Street Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 102, Shanti Heights, Civic Centre"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="teal"
              size="md"
              className="w-full font-bold pt-2.5"
              isLoading={loading}
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500">
            Already registered?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-bold text-navy-900 hover:underline"
            >
              Sign in here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
