import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (email.includes('admin')) onNavigate('admin-dashboard');
      else if (email.includes('officer')) onNavigate('officer-dashboard');
      else onNavigate('citizen-dashboard');
    } else {
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  const handleQuickDemo = (role: 'citizen' | 'officer' | 'admin') => {
    switchDemoRole(role);
    if (role === 'admin') onNavigate('admin-dashboard');
    else if (role === 'officer') onNavigate('officer-dashboard');
    else onNavigate('citizen-dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-950 to-teal-700 mx-auto flex items-center justify-center text-white shadow-md">
          <ShieldCheck className="w-7 h-7 text-teal-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-navy-950">
          Sign In to Jabalpur Smart City Portal
        </h1>
        <p className="text-xs text-slate-500">
          Access your authorized Citizen, Department Officer, or Municipal Admin workspace
        </p>
      </div>

      <Card className="border-t-4 border-t-teal-600 shadow-md">
        <CardContent className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Email / Citizen Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@smartcity.gov.in or personal email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold"
              isLoading={loading}
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
              Instant 1-Click Evaluation Accounts
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="w-full p-2.5 rounded-xl border border-navy-200 bg-navy-50/70 hover:bg-navy-100 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-navy-950">
                    Abhijeet Shah, IAS (Municipal Commissioner)
                  </div>
                  <div className="text-[10px] text-navy-700">
                    admin@smartcity.gov.in • Full Command & Dispatch
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-navy-900 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('officer')}
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-blue-900">
                    Er. Vikram Malhotra (Roads Officer)
                  </div>
                  <div className="text-[10px] text-blue-700">
                    officer@smartcity.gov.in • Resolve Assigned Tickets
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('citizen')}
                className="w-full p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-teal-900">
                    Rahul Sharma (Citizen)
                  </div>
                  <div className="text-[10px] text-teal-700">
                    citizen@smartcity.gov.in • File & Track Grievances
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-bold text-teal-700 hover:underline"
            >
              Register as Citizen
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
