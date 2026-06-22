import React from 'react';
import { Lightbulb } from 'lucide-react';

interface SmartInsightPanelProps {
  insight: string;
}

export const SmartInsightPanel: React.FC<SmartInsightPanelProps> = ({ insight }) => {
  return (
    <div className="bg-teal-600 dark:bg-teal-700 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-teal-100 uppercase tracking-wider mb-1">Health Insight</p>
            <p className="text-sm text-white font-medium leading-relaxed">{insight}</p>
          </div>
        </div>
        <button className="shrink-0 text-xs font-bold text-teal-700 bg-white hover:bg-teal-50 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
          Learn More
        </button>
      </div>
    </div>
  );
};
