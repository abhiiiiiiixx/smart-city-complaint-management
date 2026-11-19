import React from 'react';
import { ComplaintPriority } from '../../types/database';
import { cn } from '../../lib/utils';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const configs: Record<
    ComplaintPriority,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode; pulse?: boolean }
  > = {
    Low: {
      label: 'Low',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      icon: <ArrowDown className="w-3 h-3 text-slate-500" />,
    },
    Medium: {
      label: 'Medium',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <AlertTriangle className="w-3 h-3 text-blue-500" />,
    },
    High: {
      label: 'High',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: <ArrowUp className="w-3 h-3 text-amber-600" />,
    },
    Critical: {
      label: 'Critical',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
      icon: <AlertCircle className="w-3 h-3 text-rose-600" />,
      pulse: true,
    },
  };

  const config = configs[priority] || configs.Medium;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
        </span>
      )}
      {!config.pulse && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
