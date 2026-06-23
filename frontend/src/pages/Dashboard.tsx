import React, { useState, useEffect, useRef } from 'react';
import { Footprints, Flame, Heart, AlertTriangle, Calendar } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { DailySummary, TrendData } from '../types/health';
import { SummaryCard } from '../components/SummaryCard';
import { TrendChart } from '../components/TrendChart';
import { SmartInsightPanel } from '../components/SmartInsightPanel';
import { AnatomyWidget } from '../components/AnatomyWidget';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  en: {
    dailyOverview: 'Daily Overview',
    today: 'Today',
    lastSyncedJustNow: 'Last synced just now',
    totalSteps: 'Total Steps',
    activeCalories: 'Active Calories',
    avgRestingHR: 'Avg Resting HR',
    steps: 'steps',
    kcal: 'kcal',
    bpm: 'bpm',
    noChartData: 'No chart data',
    failedToLoad: 'Failed to load data.',
  },
  id: {
    dailyOverview: 'Ringkasan Harian',
    today: 'Hari ini',
    lastSyncedJustNow: 'Baru saja disinkronkan',
    totalSteps: 'Total Langkah',
    activeCalories: 'Kalori Aktif',
    avgRestingHR: 'Rata-rata Detak Jantung Istirahat',
    steps: 'langkah',
    kcal: 'kkal',
    bpm: 'bpm',
    noChartData: 'Tidak ada data grafik',
    failedToLoad: 'Gagal memuat data.',
  }
};

export const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const dateFromUrl = searchParams.get('date');

  const [date, setDate] = useState<string>(dateFromUrl || new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchWithMountCheck = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          setSummary({
            date: date,
            total_steps: 0,
            total_calories: 0,
            avg_heart_rate: 0,
            smart_insight: {
              trendDeviation: { en: 'Not enough data to determine trends.', id: 'Data tidak cukup untuk menentukan tren.' },
              healthStatus: { en: 'Please log in to start tracking.', id: 'Silakan masuk untuk mulai melacak.' },
              dailyTarget: { en: 'Set your goals after logging in.', id: 'Tetapkan tujuan Anda setelah masuk.' }
            },
            baseline: { avg_steps: 0, avg_heart_rate: 0, avg_calories: 0 }
          });
          setTrend({ date: date, hourlyData: [] });
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [summaryRes, trendRes] = await Promise.all([
          api.getSummary(date),
          api.getTrend(date),
        ]);
        if (isMounted) {
          setSummary(summaryRes.data);
          setTrend(trendRes.data);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : t.failedToLoad;
          setError(message);
          setSummary(null);
          setTrend(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    void fetchWithMountCheck();
    
    return () => {
      isMounted = false;
    };
  }, [date, isAuthenticated, t.failedToLoad]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    navigate(`/?date=${newDate}`);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 w-full min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t.dailyOverview}</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">{t.today}, {new Date(date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' })} • {t.lastSyncedJustNow}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button 
              onClick={() => dateInputRef.current?.showPicker()}
              className="bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl px-5 py-3 flex items-center text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <Calendar className="w-5 h-5 mr-3 text-teal-600" />
              <span>{new Date(date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </button>
            {/* Hidden native input */}
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center space-x-3 border border-red-100 dark:border-red-900/30">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Anatomy Widget */}
          <div className="lg:col-span-4 flex flex-col">
            <AnatomyWidget className="h-full" />
          </div>

          {/* Right Column - Data & Charts */}
          <div className="lg:col-span-8 flex flex-col space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <SummaryCard
                title={t.totalSteps}
                value={summary?.total_steps ?? 0}
                unit={t.steps}
                icon={Footprints}
                color="bg-teal-500"
                percentage={(summary?.total_steps ?? 0) / (summary?.baseline?.avg_steps || 10000)}
                baseline={summary?.baseline?.avg_steps}
              />
              <SummaryCard
                title={t.activeCalories}
                value={summary?.total_calories ?? 0}
                unit={t.kcal}
                icon={Flame}
                color="bg-teal-500"
                percentage={(summary?.total_calories ?? 0) / (summary?.baseline?.avg_calories || 2500)}
                baseline={summary?.baseline?.avg_calories || 2500}
                isLinear={true}
              />
              <SummaryCard
                title={t.avgRestingHR}
                value={summary?.avg_heart_rate ?? 0}
                unit={t.bpm}
                icon={Heart}
                color="bg-teal-500"
                percentage={0}
                baseline={summary?.baseline?.avg_heart_rate}
                isSparkline={true}
                sparklineData={trend?.hourlyData.map(d => d.heartRate) || []}
              />
            </div>

            {summary?.smart_insight && (
              <SmartInsightPanel insight={summary.smart_insight} />
            )}

            {trend ? (
              <TrendChart data={trend.hourlyData} />
            ) : (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex items-center justify-center text-slate-400">
                {t.noChartData}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
