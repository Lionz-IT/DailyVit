import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  sparklineData?: number[];
}

const translations = {
  en: {
    dailyGoal: 'Daily Goal:',
    vsYesterday: 'vs yesterday',
    normal: 'Normal',
  },
  id: {
    dailyGoal: 'Target Harian:',
    vsYesterday: 'vs kemarin',
    normal: 'Normal',
  }
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  color = 'bg-teal-500',
  percentage = 0,
  baseline,
  isLinear,
  isSparkline,
  sparklineData = [],
}) => {
  const { language } = useLanguage();
  const t = translations[language];

  const safePercentage = Math.min(Math.max(percentage * 100, 0), 100);

  // Dynamic sparkline points calculation
  let sparklinePoints = "0,20 100,20"; // Flatline default when no data
  let sparklineEndX = 100;
  let sparklineEndY = 20;

  if (isSparkline && sparklineData && sparklineData.length > 0) {
    const validData = sparklineData.filter(d => d > 0);
    if (validData.length > 1) {
      const min = Math.min(...validData) - 5;
      const max = Math.max(...validData) + 5;
      const range = max - min === 0 ? 1 : max - min;
      
      const points = validData.map((val, i) => {
        const x = (i / (validData.length - 1)) * 100;
        const y = 35 - ((val - min) / range) * 30;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      sparklinePoints = points.join(' ');
      
      sparklineEndX = 100;
      sparklineEndY = 35 - ((validData[validData.length - 1] - min) / range) * 30;
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 min-w-0">
          <Icon className="w-6 h-6 text-teal-500 shrink-0" />
          <span className="text-sm font-semibold uppercase tracking-wider truncate">{title}</span>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-between items-end mt-2">
        <div className={`flex-1 ${isLinear ? 'w-full' : ''}`}>
          <div className="flex items-baseline space-x-1">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              {typeof value === 'number' ? value.toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : value}
            </span>
            <span className="text-sm font-semibold text-slate-500 ml-1">{unit}</span>
          </div>
          
          {isLinear && (
            <div className="mt-6 w-full">
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${safePercentage}%` }}></div>
              </div>
              <div className="flex justify-between mt-3 text-xs font-bold text-slate-500">
                <span>{t.dailyGoal} {baseline?.toLocaleString(language === 'id' ? 'id-ID' : 'en-US') || 0}</span>
                <span className="text-teal-600 dark:text-teal-400">{Math.round(safePercentage)}%</span>
              </div>
            </div>
          )}

          {!isLinear && !isSparkline && (
            <div className="mt-3 text-sm font-bold text-teal-500 flex items-center">
              ↑ 12% {t.vsYesterday}
            </div>
          )}
        </div>

        {!isLinear && !isSparkline && (
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0 ml-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-700" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * safePercentage) / 100} className="text-teal-500 drop-shadow-md transition-all duration-1000 ease-out" strokeLinecap="round" />
            </svg>
            <span className="absolute text-sm font-extrabold text-slate-700 dark:text-slate-200">{Math.round(safePercentage)}%</span>
          </div>
        )}

        {isSparkline && (
          <div className="w-36 h-20 flex items-end shrink-0 ml-4">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible drop-shadow-md">
              <polyline fill="none" stroke="currentColor" strokeWidth="3.5" className="text-rose-500" strokeLinecap="round" strokeLinejoin="round" points={sparklinePoints} />
              <circle cx={sparklineEndX} cy={sparklineEndY} r="5" fill="currentColor" className="text-rose-500" />
            </svg>
          </div>
        )}
      </div>
      
      {isSparkline && (
        <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          {t.normal}
        </span>
      )}
    </div>
  );
};
