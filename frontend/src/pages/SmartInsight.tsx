import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { type DailySummary } from '../types/health';
import { Calendar } from 'lucide-react';

export const SmartInsight: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      if (!isAuthenticated) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const date = new Date().toISOString().split('T')[0];
        const res = await api.getSummary(date);
        if (isMounted) setSummary(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInsight();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center text-slate-500">
        Please log in to view Smart Insight.
      </div>
    );
  }

  const steps = summary?.total_steps || 0;
  const baselineSteps = summary?.baseline?.avg_steps || 8000;
  const deviasi = baselineSteps > 0 ? ((steps - baselineSteps) / baselineSteps) * 100 : 0;
  const absDeviasi = Math.abs(Math.round(deviasi));
  const isTurun = deviasi < 0;

  const hr = Math.round(summary?.avg_heart_rate || 0);
  const baselineHr = Math.round(summary?.baseline?.avg_heart_rate || 72);

  const persentaseTarget = Math.round((steps / baselineSteps) * 100);

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 w-full min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Smart Insight</h1>
          <p className="text-sm text-slate-500 mt-1">Rule-based automated analysis of daily activity & heart rate data.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
          <Calendar className="w-4 h-4 mr-2 text-teal-500" /> Today • {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Personal Trend<br/>Deviation</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Deviasi vs rata-rata 7 hari</p>
          <div className="inline-block bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-6 max-w-max">
            {isTurun ? 'Turun Signifikan' : 'Naik Signifikan'}
          </div>
          <div className="flex items-baseline mb-8">
            <span className="text-5xl font-extrabold text-amber-500">{absDeviasi}%</span>
            <span className="text-sm text-slate-500 ml-2">dari baseline</span>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Hari ini</span>
                <span className="font-bold">{steps.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min((steps/10000)*100, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rata-rata 7 hari</span>
                <span className="font-bold">{baselineSteps.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${Math.min((baselineSteps/10000)*100, 100)}%` }}></div>
              </div>
            </div>
          </div>
          <div className="mt-auto bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <p className="text-xs font-bold text-amber-600 mb-1">Smart Insight</p>
            <p className="text-sm text-amber-800">{summary?.smart_insight || 'No insight available.'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Personal Health<br/>Status</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Konteks detak jantung + aktivitas</p>
          <div className="flex space-x-2 mb-6">
            <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-sm font-semibold">Rendah</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-sm font-semibold">Normal</span>
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">Tinggi</span>
          </div>
          <div className="text-4xl font-extrabold text-red-500 mb-8">TINGGI</div>
          <div className="space-y-6 mb-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Detak jantung</p>
                <p className="text-xs text-slate-400">rata-rata {baselineHr} bpm</p>
              </div>
              <p className="font-bold text-lg">{hr} bpm</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Langkah hari ini</p>
                <p className="text-xs text-slate-400">{Math.round((steps/baselineSteps)*100)}% dari baseline</p>
              </div>
              <p className="font-bold text-lg">{steps.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="mt-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-xs font-bold text-red-600 mb-1">Smart Insight</p>
            <p className="text-sm text-red-800">{summary?.smart_insight || 'No insight available.'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><circle cx="12" cy="12" r="6" strokeWidth="2" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Personalized<br/>Daily Target</h2>
          </div>
          <p className="text-sm text-slate-500 mb-8">Target adaptif 105% x rata-rata</p>
          
          <div className="flex justify-center mb-8 relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="15" fill="transparent" className="text-slate-100 dark:text-slate-700" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="15" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * persentaseTarget) / 100} className="text-teal-600" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{Math.min(persentaseTarget, 100)}%</span>
              <span className="text-xs font-medium text-slate-500">tercapai</span>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{steps.toLocaleString('id-ID')} / {(baselineSteps * 1.05).toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">langkah</span></p>
            <p className="text-xs text-slate-400 mt-2">Min 3.000 • Maks 15.000</p>
          </div>

          <div className="mt-auto bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
            <p className="text-xs font-bold text-teal-600 mb-1">Smart Insight</p>
            <p className="text-sm text-teal-800">{summary?.smart_insight || 'No insight available.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};