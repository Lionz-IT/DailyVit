import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';

export interface SummaryCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  color?: string;
  percentage?: number;
  baseline?: number;
  isLinear?: boolean;
  isSparkline?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  color = 'bg-blue-500',
  percentage = 0,
  baseline,
  isLinear,
  isSparkline,
}) => {
  const safePercentage = Math.min(Math.max(percentage * 100, 0), 100);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between relative overflow-hidden group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <Icon className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-white font-sans">
              {typeof value === 'number' ? value.toLocaleString('en-US') : value}
            </span>
            <span className="text-xs font-semibold text-slate-500">{unit}</span>
          </div>
          
          {isLinear && (
            <div className="mt-4">
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${safePercentage}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
                <span>Daily Goal: {baseline?.toLocaleString('en-US') || 0}</span>
                <span>{Math.round(safePercentage)}%</span>
              </div>
            </div>
          )}

          {!isLinear && !isSparkline && (
            <div className="mt-2 text-xs font-medium text-green-500 flex items-center">
              ↑ 12% vs yesterday
            </div>
          )}
        </div>

        {!isLinear && !isSparkline && (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-700" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="175" strokeDashoffset={175 - (175 * safePercentage) / 100} className="text-blue-600 drop-shadow-sm transition-all duration-1000 ease-out" />
            </svg>
            <span className="absolute text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(safePercentage)}%</span>
          </div>
        )}

        {isSparkline && (
          <div className="w-24 h-12 flex items-end">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <polyline fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500" strokeLinecap="round" strokeLinejoin="round" points="0,20 20,20 30,5 40,25 50,15 60,20 80,18 100,10" />
              <circle cx="100" cy="10" r="3" fill="currentColor" className="text-red-500" />
            </svg>
          </div>
        )}
      </div>
      
      {isSparkline && (
        <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          Normal
        </span>
      )}
    </div>
  );
};
