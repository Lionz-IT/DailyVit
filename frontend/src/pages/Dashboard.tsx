import React, { useState, useEffect } from 'react';
import { Footprints, Flame, Heart, Wind, RefreshCw, AlertTriangle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { DailySummary, TrendData, HistoryItem } from '../types/health';
import { SummaryCard } from '../components/SummaryCard';
import { SmartInsightPanel } from '../components/SmartInsightPanel';
import { TrendChart } from '../components/TrendChart';
import { SleepCard } from '../components/SleepCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const dateFromUrl = searchParams.get('date');

  const [date, setDate] = useState<string>(dateFromUrl || new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadData = async (targetDate: string) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, trendRes, historyRes] = await Promise.all([
        api.getSummary(targetDate),
        api.getTrend(targetDate),
        api.getHistory(7),
      ]);
      setSummary(summaryRes.data);
      setTrend(trendRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data. Silakan coba lagi.';
      setError(message);
      setSummary(null);
      setTrend(null);
    } finally {
      setLoading(false);
    }
  };

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
            smart_insight: 'ðŸ‘‹ Halo! Silakan login untuk mulai melacak aktivitas, melihat metrik kesehatan yang akurat, dan mendapatkan wawasan pintar harian Anda.',
            baseline: { avg_steps: 0, avg_heart_rate: 0, avg_calories: 0 }
          });
          setTrend({ date: date, hourlyData: [] });
          setHistory([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [summaryRes, trendRes, historyRes] = await Promise.all([
          api.getSummary(date),
          api.getTrend(date),
          api.getHistory(7),
        ]);
        if (isMounted) {
          setSummary(summaryRes.data);
          setTrend(trendRes.data);
          setHistory(historyRes.data);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Gagal memuat data. Silakan coba lagi.';
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
  }, [date, isAuthenticated]);

  const handleSync = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setSyncing(true);
    setSyncError(null);
    try {
      await api.triggerSync(date);
      setLoading(true);
      try {
        const [summaryRes, trendRes, historyRes] = await Promise.all([
          api.getSummary(date),
          api.getTrend(date),
          api.getHistory(7),
        ]);
        setSummary(summaryRes.data);
        setTrend(trendRes.data);
        setHistory(historyRes.data);
      } catch {
        setError('Gagal memperbarui data setelah sinkronisasi.');
      } finally {
        setLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyinkronkan data.';
      setSyncError(message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary dark:text-slate-100">Ringkasan Kesehatan</h2>
          <p className="text-textSecondary dark:text-slate-400 mt-0.5">{getGreeting()}, {isAuthenticated ? 'pengguna DailyVit' : 'Tamu'}</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Pilih tanggal"
            className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-card dark:bg-slate-800 text-textPrimary dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
          />
          <button
            onClick={handleSync}
            disabled={syncing}
            aria-label={syncing ? 'Sedang menyinkronkan data' : 'Sinkronkan data'}
            className="flex items-center space-x-2 bg-primary hover:bg-opacity-90 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sync...' : 'Sinkronkan'}</span>
          </button>
        </div>
      </div>

      {syncError && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm" role="alert">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center py-12" role="alert">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <p className="text-lg font-medium text-textPrimary dark:text-slate-100 mb-2">Gagal Memuat Data</p>
          <p className="text-textSecondary dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => loadData(date)}
            className="bg-primary hover:bg-opacity-90 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="Detak Jantung"
              value={summary.avg_heart_rate}
              unit="BPM"
              icon={Heart}
              iconColor="text-green-500"
              iconBgColor="bg-green-50 dark:bg-green-900/20"
              baselineValue={summary.baseline?.avg_heart_rate}
              isHigherBetter={false}
              statusLabel={summary.avg_heart_rate > 0 ? undefined : 'N/A'}
            />
            <SummaryCard
              title="Kalori Terbakar"
              value={summary.total_calories}
              unit="Kkal"
              icon={Flame}
              iconColor="text-blue-500"
              iconBgColor="bg-blue-50 dark:bg-blue-900/20"
              baselineValue={summary.baseline?.avg_calories}
              isHigherBetter={true}
            />
            <SummaryCard
              title="Langkah Kaki"
              value={summary.total_steps}
              unit="Langkah"
              icon={Footprints}
              iconColor="text-emerald-500"
              iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
              baselineValue={summary.baseline?.avg_steps}
              isHigherBetter={true}
            />
            <SummaryCard
              title="Oksigen Darah"
              value="--"
              unit="%"
              icon={Wind}
              iconColor="text-sky-500"
              iconBgColor="bg-sky-50 dark:bg-sky-900/20"
              statusLabel="Segera hadir"
            />
          </div>

          {summary.smart_insight && (
            <SmartInsightPanel insight={summary.smart_insight} />
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              {trend && trend.hourlyData && trend.hourlyData.length > 0 ? (
                <TrendChart data={trend.hourlyData} />
              ) : (
                <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-full min-h-[300px] flex flex-col items-center justify-center">
                  <p className="text-textSecondary dark:text-slate-400 mb-4 text-center max-w-sm">
                    {isAuthenticated ? 'Belum ada data aktivitas harian untuk tanggal ini.' : 'Grafik tren aktivitas akan muncul di sini setelah Anda login.'}
                  </p>
                </div>
              )}
            </div>
            <div>
              <SleepCard />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-textSecondary dark:text-slate-400">
          <p className="text-lg mb-2">Tidak ada data untuk tanggal ini.</p>
          <p className="text-sm">Silakan klik Sinkronkan untuk mengambil data.</p>
        </div>
      )}
    </div>
  );
};

