import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  MapPin,
  ClipboardList,
  CheckCircle2,
  BarChart3,
  Building2,
  Users,
  Shield,
  Layers,
  FileText,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { role, user } = useAuth();
  const { complaints } = useComplaints();

  // Role specific counts
  const citizenCount = complaints.filter((c) => c.citizen_id === user?.id).length;
  const officerCount = complaints.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
  ).length;
  const criticalAdminCount = complaints.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved').length;

  const citizenNav: NavItem[] = [
    {
      id: 'citizen-dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'submit-complaint',
      label: 'File New Grievance',
      icon: <PlusCircle className="w-4 h-4 text-teal-600" />,
      highlight: true,
    },
    {
      id: 'my-complaints',
      label: 'My Complaints',
      icon: <FolderOpen className="w-4 h-4" />,
      badge: citizenCount > 0 ? citizenCount : undefined,
    },
    {
      id: 'city-map',
      label: 'City Grievance Map',
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const officerNav: NavItem[] = [
    {
      id: 'officer-dashboard',
      label: 'Officer Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'assigned-complaints',
      label: 'Assigned Complaints',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: officerCount > 0 ? officerCount : undefined,
    },
    {
      id: 'city-map',
      label: 'Ward Issues Map',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'officer-performance',
      label: 'Performance & SLA',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  const adminNav: NavItem[] = [
    {
      id: 'admin-dashboard',
      label: 'Control Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'all-complaints',
      label: 'All Complaints',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: criticalAdminCount > 0 ? `${criticalAdminCount} Critical` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'manage-departments',
      label: 'Departments',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'manage-officers',
      label: 'Department Officers',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'manage-citizens',
      label: 'Citizen Directory',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'manage-categories',
      label: 'Complaint Categories',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'analytics-reports',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'city-map',
      label: 'City Map Overview',
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const activeNav =
    role === 'admin' ? adminNav : role === 'officer' ? officerNav : citizenNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-16 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div>
          {/* Header on mobile */}
          <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Navigation Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile summary card */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-navy-950 truncate">
                  {user?.full_name}
                </p>
                <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">
                  {user?.role} Portal
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {role} Workspace
            </div>
            {activeNav.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all select-none',
                    isActive
                      ? 'bg-navy-900 text-white shadow-xs'
                      : item.highlight
                      ? 'bg-teal-50 text-teal-800 hover:bg-teal-100/80 border border-teal-200'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-slate-100/80'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-teal-300' : ''}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-slate-200 text-slate-800'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Municipal Quick Helpline Badge */}
        <div className="bg-gradient-to-br from-navy-950 to-navy-900 text-white p-3.5 rounded-xl text-xs border border-navy-800 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-teal-300">Jabalpur Municipal Corp</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            24x7 Control Room: <strong>0761-2611751</strong>
          </p>
          <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400 flex justify-between">
            <span>Sanskaardhani Jabalpur</span>
            <span className="text-teal-400 font-semibold">Smart City Mission</span>
          </div>
        </div>
      </aside>
    </>
  );
};
