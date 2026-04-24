import React from 'react';

interface SmartInsightPanelProps {
  insight: string;
}

export const SmartInsightPanel: React.FC<SmartInsightPanelProps> = ({ insight }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-blue-100 animate-fade-in-up my-6">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-sm font-bold text-primary uppercase tracking-wider">Insight untuk hari ini</span>
      </div>
      <p className="text-lg text-textPrimary leading-relaxed font-medium">
        {insight}
      </p>
      <div className="mt-4 pt-4 border-t border-blue-200/50">
        <p className="text-xs text-textSecondary flex items-center">
          <span className="mr-1">💡</span> Ini adalah rekomendasi gaya hidup, bukan diagnosis medis.
        </p>
      </div>
    </div>
  );
};
