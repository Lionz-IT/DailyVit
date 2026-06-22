import React from 'react';
import { HeartPulse } from 'lucide-react';

export const Vitals: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <HeartPulse className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Vitals</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Vitals tracking is coming soon. Stay tuned for updates.
        </p>
      </div>
    </div>
  );
};
