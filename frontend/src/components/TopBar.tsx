import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <div className="flex items-center justify-between py-4 px-8 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 transition-colors">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari..."
          aria-label="Cari"
          className="pl-10 pr-4 py-2 bg-background dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-textPrimary dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64 transition-colors"
        />
      </div>
      <div className="flex items-center space-x-3">
        <button
          aria-label="Notifikasi"
          className="p-2 text-slate-400 hover:text-textPrimary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          aria-label="Bantuan"
          className="p-2 text-slate-400 hover:text-textPrimary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold ml-1">
          U
        </div>
      </div>
    </div>
  );
};
