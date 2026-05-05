import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  baselineValue?: number;
  isHigherBetter?: boolean;
  statusLabel?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-blue-50 dark:bg-blue-900/20',
  baselineValue,
  isHigherBetter = true,
  statusLabel,
}) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const hasBaseline = baselineValue !== undefined && baselineValue > 0 && !isNaN(numericValue);
  const ratio = hasBaseline ? numericValue / baselineValue : 1;
  const percentage = Math.round(Math.abs(ratio - 1) * 100);

  let badgeColor = 'bg-gray-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
  let badgeText = statusLabel || '';

  if (!statusLabel && hasBaseline) {
    if (ratio > 1.05) {
      badgeColor = isHigherBetter
        ? 'bg-emerald-50 text-accent dark:bg-emerald-900/30'
        : 'bg-amber-50 text-warning dark:bg-amber-900/30';
      badgeText = `+${percentage}%`;
    } else if (ratio < 0.95) {
      badgeColor = isHigherBetter
        ? 'bg-amber-50 text-warning dark:bg-amber-900/30'
        : 'bg-emerald-50 text-accent dark:bg-emerald-900/30';
      badgeText = `-${percentage}%`;
    } else {
      badgeColor = 'bg-emerald-50 text-accent dark:bg-emerald-900/30';
      badgeText = 'Normal';
    }
  }

  return (
    <div className="bg-card dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[140px]">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${iconBgColor} transition-colors`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {badgeText && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-textSecondary dark:text-slate-400 font-medium">{title}</p>
        <div className="flex items-baseline space-x-1 mt-0.5">
          <span className="text-2xl font-bold font-mono text-textPrimary dark:text-slate-100">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </span>
          <span className="text-xs font-medium text-textSecondary dark:text-slate-500 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  );
};
