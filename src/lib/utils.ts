import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

export interface SLAInfo {
  isOverdue: boolean;
  hoursRemaining: number;
  totalHours: number;
  label: string;
  badgeColor: string;
}

export function calculateSLAStatus(
  createdAt: string,
  slaHours: number,
  resolvedAt?: string
): SLAInfo {
  const created = new Date(createdAt).getTime();
  const deadline = created + slaHours * 60 * 60 * 1000;
  const compareTime = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();

  const diffMs = deadline - compareTime;
  const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));

  if (resolvedAt) {
    if (compareTime <= deadline) {
      return {
        isOverdue: false,
        hoursRemaining: 0,
        totalHours: slaHours,
        label: 'Resolved within SLA',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    } else {
      return {
        isOverdue: true,
        hoursRemaining: Math.abs(hoursRemaining),
        totalHours: slaHours,
        label: `Resolved ${Math.abs(hoursRemaining)}h overdue`,
        badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    }
  }

  if (hoursRemaining <= 0) {
    return {
      isOverdue: true,
      hoursRemaining: Math.abs(hoursRemaining),
      totalHours: slaHours,
      label: `Overdue by ${Math.abs(hoursRemaining)}h`,
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    };
  }

  if (hoursRemaining <= 6) {
    return {
      isOverdue: false,
      hoursRemaining,
      totalHours: slaHours,
      label: `${hoursRemaining}h remaining (Urgent)`,
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }

  return {
    isOverdue: false,
    hoursRemaining,
    totalHours: slaHours,
    label: `${hoursRemaining}h remaining`,
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
  };
}

export function generateComplaintId(sequence: number, year = 2026): string {
  const padded = String(sequence).padStart(4, '0');
  return `SC-${year}-${padded}`;
}
