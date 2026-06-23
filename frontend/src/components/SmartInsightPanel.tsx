import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import type { LocalizedInsight } from '../types/health';
import { useLanguage } from '../context/LanguageContext';

interface SmartInsightPanelProps {
  insight: string | LocalizedInsight;
}

export const SmartInsightPanel: React.FC<SmartInsightPanelProps> = ({ insight }) => {
  const { language } = useLanguage();
  
  const headerText = language === 'id' ? 'Wawasan Kesehatan' : 'Health Insight';
  const buttonText = language === 'id' ? 'Pelajari Lebih Lanjut' : 'Learn More';

  const renderContent = () => {
    let parsedInsight = insight;
    if (typeof insight === 'string') {
      try {
        parsedInsight = JSON.parse(insight);
      } catch (e) {
        return <p className="text-sm text-white font-medium leading-relaxed">{insight}</p>;
      }
    }

    const obj = parsedInsight as LocalizedInsight;

    if (obj && obj.trendDeviation && obj.healthStatus && obj.dailyTarget) {
      return (
        <ul className="mt-2 space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
            <span className="text-sm text-white font-medium"><strong className="text-teal-200">{language === 'id' ? 'Deviasi Tren:' : 'Trend Deviation:'}</strong> {obj.trendDeviation[language]}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
            <span className="text-sm text-white font-medium"><strong className="text-teal-200">{language === 'id' ? 'Status Jantung:' : 'Health Status:'}</strong> {obj.healthStatus[language]}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
            <span className="text-sm text-white font-medium"><strong className="text-teal-200">{language === 'id' ? 'Target Harian:' : 'Daily Target:'}</strong> {obj.dailyTarget[language]}</span>
          </li>
        </ul>
      );
    }

    return <p className="text-sm text-white font-medium leading-relaxed">{String(insight)}</p>;
  };

  return (
    <div className="bg-teal-600 dark:bg-teal-700 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-200">
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-start sm:items-center gap-4 min-w-0 w-full">
          <div className="bg-white/20 p-2.5 rounded-xl shrink-0 mt-1 sm:mt-0">
            <Lightbulb className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-teal-100 uppercase tracking-wider mb-1">{headerText}</p>
            {renderContent()}
          </div>
        </div>
        <button className="shrink-0 text-xs font-bold text-teal-700 bg-white hover:bg-teal-50 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap self-start sm:self-center">
          {buttonText}
        </button>
      </div>
    </div>
  );
};
