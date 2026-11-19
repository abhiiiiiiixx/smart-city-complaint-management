import React from 'react';
import { ComplaintUpdate } from '../../types/database';
import { formatDate } from '../../lib/utils';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, User, Image as ImageIcon } from 'lucide-react';

interface TimelineViewProps {
  updates: ComplaintUpdate[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ updates }) => {
  if (!updates || updates.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-400">
        No progress history logged yet.
      </div>
    );
  }

  // Sort updates descending (newest first)
  const sorted = [...updates].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {sorted.map((item, idx) => (
        <div key={item.id || idx} className="relative group">
          {/* Timeline node dot */}
          <div className="absolute -left-[27px] top-1 w-6 h-6 rounded-full bg-white border-2 border-navy-900 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-navy-900" />
          </div>

          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 hover:border-slate-300 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.to_status} />
                {item.from_status !== item.to_status && (
                  <span className="text-xs text-slate-400">
                    (from {item.from_status})
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {formatDate(item.created_at)}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {item.remarks}
            </p>

            {/* Proof images if uploaded */}
            {item.proof_images && item.proof_images.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 mb-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Resolution Proof Attached</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.proof_images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group/img overflow-hidden rounded-lg border border-slate-200"
                    >
                      <img
                        src={img}
                        alt="Resolution proof"
                        className="w-24 h-24 object-cover group-hover/img:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500">
              <User className="w-3 h-3 text-slate-400" />
              <span>Logged by: <strong className="text-slate-700 font-medium">{item.updated_by_name || 'System Official'}</strong></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
