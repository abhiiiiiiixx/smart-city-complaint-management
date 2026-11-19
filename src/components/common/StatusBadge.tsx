import React from 'react';
import { ComplaintStatus } from '../../types/database';
import { cn } from '../../lib/utils';
import {
  FileText,
  Clock,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs: Record<
    ComplaintStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    Submitted: {
      label: 'Submitted',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <FileText className="w-3 h-3" />,
    },
    'Under Review': {
      label: 'Under Review',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <Clock className="w-3 h-3" />,
    },
    Assigned: {
      label: 'Assigned',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: <UserCheck className="w-3 h-3" />,
    },
    'In Progress': {
      label: 'In Progress',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
      icon: <Wrench className="w-3 h-3" />,
    },
    Resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    Rejected: {
      label: 'Rejected',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-300',
      icon: <XCircle className="w-3 h-3" />,
    },
    Reopened: {
      label: 'Reopened',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-300',
      icon: <RotateCcw className="w-3 h-3" />,
    },
  };

  const config = configs[status] || configs.Submitted;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
