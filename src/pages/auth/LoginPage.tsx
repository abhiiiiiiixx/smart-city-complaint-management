import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound, X, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickLoginWithPasskey } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Passkey modal state for 1-click evaluation accounts
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);
  const [targetQuickRole, setTargetQuickRole] = useState<'admin' | 'officer' | 'citizen' | null>(null);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');

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

  const handleOpenPasskey = (role: 'admin' | 'officer' | 'citizen') => {
    setTargetQuickRole(role);
    setPasskeyInput('');
    setPasskeyError('');
    setPasskeyModalOpen(true);
  };

  const handleVerifyPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQuickRole) return;

    if (passkeyInput.trim() !== '769757') {
      setPasskeyError('Incorrect Passkey! Access Denied (Authorized passkey required).');
      return;
    }

    const res = quickLoginWithPasskey(targetQuickRole, '769757');
    if (res.success) {
      setPasskeyModalOpen(false);
      if (targetQuickRole === 'admin') onNavigate('admin-dashboard');
      else if (targetQuickRole === 'officer') onNavigate('officer-dashboard');
      else onNavigate('citizen-dashboard');
    } else {
      setPasskeyError(res.error || 'Access Denied');
    }
  };

  const getRoleDisplayName = (r: 'admin' | 'officer' | 'citizen' | null) => {
    if (r === 'admin') return 'Abhijeet Shah, IAS (Commissioner)';
    if (r === 'officer') return 'Er. Vikram Malhotra (Roads Officer)';
    if (r === 'citizen') return 'Rahul Sharma (Citizen)';
    return '';
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

          {/* Quick Evaluation Accounts Section (Passkey Protected) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Evaluation Accounts
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-teal-600" />
                Passkey Protected
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleOpenPasskey('admin')}
                className="w-full p-2.5 rounded-xl border border-navy-200 bg-navy-50/70 hover:bg-navy-100 text-left transition-colors flex items-center justify-between group cursor-pointer"
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
                onClick={() => handleOpenPasskey('officer')}
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-colors flex items-center justify-between group cursor-pointer"
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
                onClick={() => handleOpenPasskey('citizen')}
                className="w-full p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-left transition-colors flex items-center justify-between group cursor-pointer"
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

      {/* Security Passkey Verification Modal */}
      {passkeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setPasskeyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-navy-950">Security Passkey</h3>
                <p className="text-[11px] text-slate-500">Authorized evaluation access</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              Target Account: <strong className="text-navy-900">{getRoleDisplayName(targetQuickRole)}</strong>
            </div>

            {passkeyError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passkeyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPasskey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit Passkey *
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  maxLength={6}
                  placeholder="••••••"
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value.replace(/\D/g, ''));
                    setPasskeyError('');
                  }}
                  className="w-full px-3 py-2.5 text-center text-lg tracking-[0.4em] font-mono font-bold border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPasskeyModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  className="flex-1 font-bold"
                >
                  Verify & Access
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
