import React, { useState, useEffect } from 'react';
import { Footprints, Flame, Heart, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import type { DailySummary, TrendData } from '../types/health';
import { SummaryCard } from '../components/SummaryCard';
import { SmartInsightPanel } from '../components/SmartInsightPanel';
import { TrendChart } from '../components/TrendChart';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dateFromUrl = searchParams.get('date');

  const [date, setDate] = useState<string>(dateFromUrl || new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  const fetchData = async (targetDate: string) => {
    setLoading(true);
    try {
      const [summaryRes, trendRes] = await Promise.all([
        api.getSummary(targetDate),
        api.getTrend(targetDate)
      ]);
      setSummary(summaryRes.data);
      setTrend(trendRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(date);
  }, [date]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.triggerSync(date);
      await fetchData(date);
    } catch (error) {
      console.error("Error syncing data:", error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-textPrimary dark:text-slate-100">Ringkasan Harian</h2>
          <p className="text-textSecondary dark:text-slate-400 mt-1">Pantau aktivitas dan kesehatanmu hari ini.</p>
        </div>
        
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto flex items-center">
            <CalendarIcon className="w-5 h-5 text-textSecondary dark:text-slate-400 absolute left-3" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-card dark:bg-slate-800 text-textPrimary dark:text-slate-100 w-full transition-colors"
            />
          </div>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center space-x-2 bg-primary hover:bg-opacity-90 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{syncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard 
              title="Langkah Kaki" 
              value={summary.total_steps} 
              unit="langkah" 
              icon={Footprints}
              baselineValue={summary.baseline?.avg_steps}
              isHigherBetter={true}
            />
            <SummaryCard 
              title="Kalori Terbakar" 
              value={summary.total_calories} 
              unit="kkal" 
              icon={Flame}
              baselineValue={summary.baseline?.avg_calories}
              isHigherBetter={true}
            />
            <SummaryCard 
              title="Rata-rata Detak Jantung" 
              value={summary.avg_heart_rate} 
              unit="bpm" 
              icon={Heart}
              baselineValue={summary.baseline?.avg_heart_rate}
              isHigherBetter={false}
            />
          </div>

          {summary.smart_insight && (
            <SmartInsightPanel insight={summary.smart_insight} />
          )}

          {trend && (
            <TrendChart data={trend.hourlyData} />
          )}
        </>
      ) : (
        <div className="text-center py-12 text-textSecondary">
          Tidak ada data untuk tanggal ini. Silakan klik Sinkronkan.
        </div>
      )}
    </div>
  );
};
