import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { HistoryItem } from '../types/health';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Calendar, Download, Footprints, Flame, Moon, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { WeeklyChart } from '../components/WeeklyChart';

const translations = {
  en: {
    title: 'Statistics History',
    subtitle: 'Review your detailed health metrics and progress.',
    last7Days: 'Last 7 Days',
    notLoggedInTitle: 'Not Logged In',
    notLoggedInDesc: 'Please log in to view your detailed daily history.',
    loginNow: 'Login Now',
    avgSteps: 'Avg Steps/Day',
    totalCalories: 'Total Calories',
    avgSleep: 'Avg Sleep',
    sleepNotAvail: 'Sleep data not available',
    avgHR: 'Avg Heart Rate',
    dailyBreakdown: 'Daily Breakdown',
    exportReport: 'Export Report',
    date: 'Date',
    steps: 'Steps',
    calories: 'Calories (kcal)',
    avgHrBpm: 'Avg HR (bpm)',
    status: 'Status',
    noData: 'No history data available.',
    goalReached: 'Goal Reached',
    active: 'Active',
    light: 'Light',
    kcal: 'kcal',
    bpm: 'bpm'
  },
  id: {
    title: 'Riwayat Statistik',
    subtitle: 'Tinjau metrik kesehatan dan kemajuan detail Anda.',
    last7Days: '7 Hari Terakhir',
    notLoggedInTitle: 'Belum Masuk',
    notLoggedInDesc: 'Silakan masuk untuk melihat riwayat harian Anda secara detail.',
    loginNow: 'Masuk Sekarang',
    avgSteps: 'Rata-rata Langkah/Hari',
    totalCalories: 'Total Kalori',
    avgSleep: 'Rata-rata Tidur',
    sleepNotAvail: 'Data tidur tidak tersedia',
    avgHR: 'Rata-rata Detak Jantung',
    dailyBreakdown: 'Rincian Harian',
    exportReport: 'Ekspor Laporan',
    date: 'Tanggal',
    steps: 'Langkah',
    calories: 'Kalori (kkal)',
    avgHrBpm: 'Detak Jantung Rata-rata (bpm)',
    status: 'Status',
    noData: 'Belum ada data riwayat yang tersimpan.',
    goalReached: 'Target Tercapai',
    active: 'Aktif',
    light: 'Ringan',
    kcal: 'kkal',
    bpm: 'bpm'
  }
};

export const History: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) {
        setHistory([]);
        setLoading(false);
        return;
      }
      try {
        const response = await api.getHistory(7);
        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [isAuthenticated]);

  const avgSteps = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.total_steps, 0) / history.length) : 0;
  const totalCalories = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.total_calories, 0)) : 0;
  const avgHR = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.avg_heart_rate, 0) / history.length) : 0;

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = [t.date, t.steps, t.calories, t.avgHrBpm, t.status];
    const rows = history.map((item) => {
      const status = item.total_steps > 8000 ? t.goalReached : item.total_steps > 5000 ? t.active : t.light;
      return [
        item.date,
        item.total_steps,
        Math.round(item.total_calories),
        Math.round(item.avg_heart_rate),
        status,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dailyvit-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (steps: number) => {
    if (steps > 8000) return <span className="bg-teal-100 text-teal-600 px-3 py-1 rounded-full text-xs font-bold">{t.goalReached}</span>;
    if (steps > 5000) return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{t.active}</span>;
    return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">{t.light}</span>;
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 w-full min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{t.last7Days}</span>
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center transition-colors duration-200">
          <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">{t.notLoggedInTitle}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {t.notLoggedInDesc}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {t.loginNow}
          </button>
        </div>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <div className="flex items-center space-x-2">
                  <Footprints className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium">{t.avgSteps}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{avgSteps.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium">{t.totalCalories}</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalCalories.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}</span>
                <span className="text-sm font-semibold text-slate-500">{t.kcal}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium">{t.avgSleep}</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">N/A</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{t.sleepNotAvail}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-medium">{t.avgHR}</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{avgHR}</span>
                <span className="text-sm font-semibold text-slate-500">{t.bpm}</span>
              </div>
            </div>
          </div>

          {history.length > 0 && <WeeklyChart data={history} />}

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.dailyBreakdown}</h3>
              <button onClick={handleExportCSV} className="text-teal-600 hover:text-teal-700 text-sm font-semibold flex items-center space-x-1 transition-colors">
                <span>{t.exportReport}</span>
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="py-3 px-6 font-semibold">{t.date}</th>
                    <th className="py-3 px-6 font-semibold">{t.steps}</th>
                    <th className="py-3 px-6 font-semibold">{t.calories}</th>
                    <th className="py-3 px-6 font-semibold">{t.avgHrBpm}</th>
                    <th className="py-3 px-6 font-semibold">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {history.map((item) => {
                    const dateObj = new Date(item.date);
                    const formattedDate = dateObj.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    return (
                      <tr 
                        key={item.date} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/?date=${item.date}`)}
                      >
                        <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formattedDate}
                        </td>
                        <td className="py-4 px-6 text-sm text-teal-600 font-semibold">
                          {item.total_steps.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                          {item.total_calories.toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                          {Math.round(item.avg_heart_rate)}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(item.total_steps)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {history.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                {t.noData}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};