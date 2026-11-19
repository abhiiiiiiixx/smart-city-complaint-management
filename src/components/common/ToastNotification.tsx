import React, { useState, useEffect } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle2, ShieldAlert, Wrench, X, ArrowRight } from 'lucide-react';
import { Notification } from '../../types/database';

interface ToastNotificationProps {
  onTrackSearch: (complaintNumber: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ onTrackSearch }) => {
  const { user, isAuthenticated } = useAuth();
  const { notifications, markNotificationRead } = useComplaints();
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const [lastNotifId, setLastNotifId] = useState<string | null>(null);

  // Instantly dismiss any lingering toast when user switches, logs in, or logs out
  useEffect(() => {
    setActiveToast(null);
    setLastNotifId(null);
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setActiveToast(null);
      return;
    }

    // Filter notifications strictly matching the current logged-in user
    const userNotifs = notifications.filter(
      (n) => n.user_id === user.id || (user.role === 'admin' && n.user_id === 'usr-admin-01')
    );

    if (userNotifs.length > 0) {
      const latest = userNotifs[0];

      // Only show live pop-up toast if notification is unread, new, AND created very recently (< 30 seconds ago)
      // Historical or previous session notifications will only show in bell dropdown, preventing unwanted popups!
      const notifTime = new Date(latest.created_at).getTime();
      const isVeryRecent = !isNaN(notifTime) && Date.now() - notifTime < 30000;

      if (!latest.is_read && latest.id !== lastNotifId && isVeryRecent) {
        setLastNotifId(latest.id);
        setActiveToast(latest);

        // Auto dismiss after 7 seconds
        const timer = setTimeout(() => {
          setActiveToast((current) => (current?.id === latest.id ? null : current));
        }, 7000);

        return () => clearTimeout(timer);
      }
    }
  }, [notifications, isAuthenticated, user?.id, lastNotifId]);

  if (!activeToast) return null;

  const getToastIcon = () => {
    const t = activeToast.title.toLowerCase();
    if (t.includes('resolved')) return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    if (t.includes('escalated') || t.includes('critical'))
      return <ShieldAlert className="w-5 h-5 text-rose-600" />;
    if (t.includes('in progress')) return <Wrench className="w-5 h-5 text-amber-600" />;
    return <Bell className="w-5 h-5 text-teal-600" />;
  };

  const getBorderColor = () => {
    const t = activeToast.title.toLowerCase();
    if (t.includes('resolved')) return 'border-emerald-300 bg-emerald-50/90';
    if (t.includes('escalated') || t.includes('critical')) return 'border-rose-300 bg-rose-50/90';
    if (t.includes('in progress')) return 'border-amber-300 bg-amber-50/90';
    return 'border-teal-300 bg-teal-50/90';
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full px-4 sm:px-0 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md bg-white/95 flex flex-col gap-2 relative ${getBorderColor()}`}
      >
        <button
          onClick={() => {
            markNotificationRead(activeToast.id);
            setActiveToast(null);
          }}
          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="p-2 rounded-xl bg-white shadow-xs shrink-0 mt-0.5">
            {getToastIcon()}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-navy-950 tracking-tight">
                {activeToast.title}
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
            </div>
            <p className="text-xs text-slate-600 leading-snug line-clamp-3">
              {activeToast.message}
            </p>
          </div>
        </div>

        {activeToast.complaint_number && (
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono font-bold text-slate-500">
              ID: {activeToast.complaint_number}
            </span>
            <button
              onClick={() => {
                if (activeToast.complaint_number) {
                  onTrackSearch(activeToast.complaint_number);
                }
                markNotificationRead(activeToast.id);
                setActiveToast(null);
              }}
              className="inline-flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
