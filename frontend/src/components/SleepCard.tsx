import React from 'react';
import { Moon } from 'lucide-react';

export const SleepCard: React.FC = () => {
  return (
    <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors flex flex-col">
      <h3 className="text-lg font-bold text-textPrimary dark:text-slate-100 mb-4">Kualitas Tidur</h3>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-slate-700" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8"
              className="text-primary"
              strokeLinecap="round"
              strokeDasharray={`${0.75 * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Moon className="w-4 h-4 text-primary mb-1" />
            <span className="text-xl font-bold text-textPrimary dark:text-slate-100 font-mono">--</span>
            <span className="text-xs text-textSecondary dark:text-slate-400">Belum ada data</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span className="text-sm text-textSecondary dark:text-slate-400">Tidur Pulas</span>
          </div>
          <span className="text-sm font-mono font-medium text-textPrimary dark:text-slate-200">--</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-textSecondary dark:text-slate-400">Tidur Ringan</span>
          </div>
          <span className="text-sm font-mono font-medium text-textPrimary dark:text-slate-200">--</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-sm text-textSecondary dark:text-slate-400">REM</span>
          </div>
          <span className="text-sm font-mono font-medium text-textPrimary dark:text-slate-200">--</span>
        </div>
      </div>

      <button className="mt-4 w-full py-2.5 bg-green-900 dark:bg-green-800 text-white text-sm font-medium rounded-xl hover:bg-green-800 dark:hover:bg-green-700 transition-colors">
        Lihat Detail
      </button>
    </div>
  );
};
