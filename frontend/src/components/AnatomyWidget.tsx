import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface AnatomyWidgetProps {
  className?: string;
  gender?: 'male' | 'female';
}

const translations = {
  en: {
    bodyStatus: 'Body Status',
    realTime: 'Real-time health markers',
    head: 'Head',
    normal: 'Normal',
    heart: 'Heart',
    knees: 'Knees',
    stable: 'Stable',
  },
  id: {
    bodyStatus: 'Status Tubuh',
    realTime: 'Penanda kesehatan waktu nyata',
    head: 'Kepala',
    normal: 'Normal',
    heart: 'Jantung',
    knees: 'Lutut',
    stable: 'Stabil',
  }
};

export const AnatomyWidget: React.FC<AnatomyWidgetProps> = ({ className = '', gender = 'male' }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const anatomyImage = gender === 'female' ? '/woman-anatomy.png' : '/man-anatomy.png';

  return (
    <div className={`bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col items-center ${className}`}>
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t.bodyStatus}</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">{t.realTime}</p>
        </div>
      </div>
      
      <div className="relative w-full flex-1 min-h-[450px] flex items-center justify-center py-4">
        <img
          src={anatomyImage}
          alt={`${gender} Anatomy`}
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl hover:drop-shadow-[0_0_15px_rgba(13,148,136,0.5)] transition-all duration-500 p-4"
          onError={(e) => {
            e.currentTarget.src = "https://cdn.pixabay.com/photo/2016/11/24/09/27/anatomy-1855655_1280.jpg";
            e.currentTarget.className = "absolute inset-0 w-full h-full object-cover rounded-3xl opacity-50 grayscale mix-blend-multiply";
          }}
        />

        {/* Head Marker (Left side) */}
        <div className="absolute top-[5%] right-[55%] flex items-center cursor-pointer group z-10">
          <div className="bg-white dark:bg-slate-700 shadow-lg rounded-2xl p-2 sm:p-3 flex flex-col items-start min-w-[90px] transform transition-transform group-hover:scale-105 border border-slate-100 dark:border-slate-600">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t.head}</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">{t.normal}</span>
          </div>
          <div className="w-6 sm:w-12 border-t-2 border-dashed border-teal-400 dark:border-teal-500"></div>
          <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-slate-800 shadow-sm relative -mr-1.5 shrink-0"></div>
        </div>

        {/* Chest/Heart Marker (Right side) */}
        <div className="absolute top-[22%] left-[55%] flex items-center cursor-pointer group z-10">
          <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-slate-800 shadow-sm relative -ml-1.5 shrink-0"></div>
          <div className="w-6 sm:w-12 border-t-2 border-dashed border-teal-400 dark:border-teal-500"></div>
          <div className="bg-white dark:bg-slate-700 shadow-lg rounded-2xl p-2 sm:p-3 flex flex-col items-start min-w-[90px] transform transition-transform group-hover:scale-105 border border-slate-100 dark:border-slate-600">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t.heart}</span>
            <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">90%</span>
          </div>
        </div>

        {/* Knees Marker (Left side) */}
        <div className="absolute top-[63%] right-[55%] flex items-center cursor-pointer group z-10">
          <div className="bg-white dark:bg-slate-700 shadow-lg rounded-2xl p-2 sm:p-3 flex flex-col items-start min-w-[90px] transform transition-transform group-hover:scale-105 border border-slate-100 dark:border-slate-600">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{t.knees}</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">{t.stable}</span>
          </div>
          <div className="w-8 sm:w-16 border-t-2 border-dashed border-teal-400 dark:border-teal-500"></div>
          <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-slate-800 shadow-sm relative -mr-1.5 shrink-0"></div>
        </div>
      </div>
    </div>
  );
};
