import React from 'react';
import { calculateSLAStatus } from '../../lib/utils';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SLATimerBadgeProps {
  createdAt: string;
  slaHours?: number;
  resolvedAt?: string;
  className?: string;
}

export const SLATimerBadge: React.FC<SLATimerBadgeProps> = ({
  createdAt,
  slaHours = 48,
  resolvedAt,
  className,
}) => {
  const sla = calculateSLAStatus(createdAt, slaHours, resolvedAt);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border',
        sla.badgeColor,
        className
      )}
      title={`Target SLA: ${slaHours} hours`}
    >
      <Clock className="w-3 h-3 opacity-80" />
      <span>{sla.label}</span>
    </span>
  );
};
