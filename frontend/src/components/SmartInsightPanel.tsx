import React from 'react';
import { Lightbulb } from 'lucide-react';

interface SmartInsightPanelProps {
  insight: string;
}

export const SmartInsightPanel: React.FC<SmartInsightPanelProps> = ({ insight }) => {
  return (
    <div className="bg-gradient-to-r from-green-900 to-primary rounded-2xl p-5 shadow-sm my-6 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="bg-white/10 p-2.5 rounded-xl shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Wawasan Kesehatan</p>
            <p className="text-sm text-white/90 leading-relaxed">{insight}</p>
          </div>
        </div>
        <button className="shrink-0 text-xs font-semibold text-green-900 bg-white hover:bg-white/90 px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
          Pelajari Lebih Lanjut
        </button>
      </div>
    </div>
  );
};
