import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import {
  Bell,
  ShieldCheck,
  Building2,
  User,
  LogOut,
  ChevronDown,
  Menu,
  FileSearch,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatTimeAgo } from '../../lib/utils';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onTrackSearch?: (complaintNumber: string) => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onTrackSearch,
  onToggleSidebar,
}) => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useComplaints();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auto-close dropdowns when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Filter notifications strictly relevant to current logged-in user
  const userNotifications = notifications.filter(
    (n) => n.user_id === user?.id || (user?.role === 'admin' && n.user_id === 'usr-admin-01')
  );

  const userUnreadCount = userNotifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-sm">
      {/* Top Municipal Helpline Ribbon */}
      <div className="bg-navy-950 text-slate-300 text-[11px] py-1 px-4 sm:px-8 flex flex-wrap justify-between items-center border-b border-navy-900">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-teal-400 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            JABALPUR SMART CITY LIMITED (JSCL)
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">
            Jabalpur Municipal Corporation • Sanskaardhani Urban Portal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-300">
            Toll-Free Control Room: <strong className="text-white">1800-233-0761</strong>
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-teal-400 font-medium hidden sm:inline">24x7 Citizen Grievance Helpline</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo & City Title - STRICTLY ONE LINE EACH */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-navy-900 to-teal-700 flex items-center justify-center text-white shadow-md shadow-navy-900/10 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-teal-300" />
            </div>
            <div className="shrink-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-navy-950 text-base sm:text-lg tracking-tight whitespace-nowrap leading-tight">
                  Smart City
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 whitespace-nowrap leading-none">
                  JABALPUR
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wider uppercase whitespace-nowrap leading-tight mt-0.5">
                Citizen Grievance Portal
              </p>
            </div>
          </div>

          {/* Desktop Public Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 ml-3 xl:ml-5 shrink-0">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'landing'
                  ? 'text-navy-950 bg-slate-100'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('track')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
                currentTab === 'track'
                  ? 'text-teal-700 bg-teal-50 border border-teal-200'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5 shrink-0" />
              <span>Track Grievance</span>
            </button>
            <button
              onClick={() => onNavigate('city-map')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'city-map'
                  ? 'text-navy-950 bg-slate-100'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
              }`}
            >
              Jabalpur Grievance Map
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'how-it-works'
                  ? 'text-navy-950 bg-slate-100'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'about'
                  ? 'text-navy-950 bg-slate-100'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
              }`}
            >
              About Mission
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                currentTab === 'contact'
                  ? 'text-navy-950 bg-slate-100'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
              }`}
            >
              Zonal Helpline
            </button>
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* In-App Notifications Bell (Only when logged in) */}
          {isAuthenticated && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-navy-950 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {userUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {userUnreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  {/* Invisible backdrop to dismiss on any outside click */}
                  <div
                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy-900">Notifications</span>
                        {userUnreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                            {userUnreadCount} New
                          </span>
                        )}
                      </div>
                      {userUnreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-teal-700 hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {userNotifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                          <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-600">No notifications yet</p>
                          <p>You will receive live stage alerts as your complaints progress.</p>
                        </div>
                      ) : (
                        userNotifications.map((notif) => {
                          const isResolved = notif.title.toLowerCase().includes('resolved');
                          const isEscalated =
                            notif.title.toLowerCase().includes('escalated') ||
                            notif.title.toLowerCase().includes('critical');
                          const isAssigned = notif.title.toLowerCase().includes('assigned');
                          const isInProgress = notif.title.toLowerCase().includes('in progress');
                          const isRegistered = notif.title.toLowerCase().includes('registered');

                          return (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markNotificationRead(notif.id);
                                setShowNotifications(false);
                                if (notif.complaint_number && onTrackSearch) {
                                  onTrackSearch(notif.complaint_number);
                                }
                              }}
                              className={`p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                                !notif.is_read ? 'bg-teal-50/40 border-l-4 border-l-teal-600' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-navy-900">
                                    {notif.title}
                                  </span>
                                  {isRegistered && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                      REGISTERED
                                    </span>
                                  )}
                                  {isAssigned && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                                      ASSIGNED
                                    </span>
                                  )}
                                  {isInProgress && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                      IN PROGRESS
                                    </span>
                                  )}
                                  {isEscalated && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                                      ESCALATED
                                    </span>
                                  )}
                                  {isResolved && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                                      RESOLVED
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {formatTimeAgo(notif.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-snug">
                                {notif.message}
                              </p>
                              {notif.complaint_number && (
                                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-teal-700">
                                  <span>Ticket: {notif.complaint_number}</span>
                                  <span className="hover:underline flex items-center gap-0.5">
                                    Click to view timeline &rarr;
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors shrink-0 whitespace-nowrap"
              >
                <div className="w-7 h-7 rounded-full bg-navy-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block pr-1 shrink-0 whitespace-nowrap">
                  <p className="text-xs font-bold text-navy-950 leading-none truncate max-w-[140px] whitespace-nowrap">
                    {user?.full_name}
                  </p>
                  <p className="text-[10px] text-teal-700 font-semibold capitalize leading-none mt-0.5 whitespace-nowrap">
                    {user?.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {showUserMenu && (
                <>
                  {/* Invisible backdrop to dismiss on any outside click */}
                  <div
                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-navy-900">{user?.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 bg-teal-50 text-teal-800 rounded border border-teal-200">
                        {user?.role} Portal
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate(
                          role === 'citizen'
                            ? 'citizen-dashboard'
                            : role === 'officer'
                            ? 'officer-dashboard'
                            : 'admin-dashboard'
                        );
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      My Workspace Dashboard
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        onNavigate('landing');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('login')}
                className="whitespace-nowrap shrink-0"
              >
                Sign In
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={() => onNavigate('register')}
                className="font-bold whitespace-nowrap shrink-0"
              >
                Citizen Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
