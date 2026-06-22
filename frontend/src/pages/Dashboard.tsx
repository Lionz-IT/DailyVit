import React, { useState, useEffect } from 'react';
import { Footprints, Flame, Heart, AlertTriangle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { DailySummary, TrendData } from '../types/health';
import { SummaryCard } from '../components/SummaryCard';
import { TrendChart } from '../components/TrendChart';
import { SmartInsightPanel } from '../components/SmartInsightPanel';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const dateFromUrl = searchParams.get('date');

  const [date, setDate] = useState<string>(dateFromUrl || new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
            smart_insight: 'Hello! Please log in to start tracking your activity.',
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
          const message = err instanceof Error ? err.message : 'Failed to load data.';
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

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    navigate(`/?date=${newDate}`);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Daily Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Today, {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • Last synced just now</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 relative">
            <span className="mr-2">📅</span> Select Date
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <SummaryCard
            title="Total Steps"
            value={summary?.total_steps ?? 0}
            unit="steps"
            icon={Footprints}
            color="bg-blue-500"
            percentage={(summary?.total_steps ?? 0) / (summary?.baseline?.avg_steps || 10000)}
            baseline={summary?.baseline?.avg_steps}
          />
          <SummaryCard
            title="Active Calories"
            value={summary?.total_calories ?? 0}
            unit="kcal"
            icon={Flame}
            color="bg-orange-500"
            percentage={(summary?.total_calories ?? 0) / (summary?.baseline?.avg_calories || 2500)}
            baseline={summary?.baseline?.avg_calories || 2500}
            isLinear={true}
          />
          <SummaryCard
            title="Avg Resting HR"
            value={summary?.avg_heart_rate ?? 0}
            unit="bpm"
            icon={Heart}
            color="bg-red-500"
            percentage={0}
            baseline={summary?.baseline?.avg_heart_rate}
            isSparkline={true}
          />
        </div>
      )}

      {!loading && summary?.smart_insight && (
        <SmartInsightPanel insight={summary.smart_insight} />
      )}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">7-Day Activity Trend</h2>
            <p className="text-sm text-slate-500">Steps vs Heart Rate (Mon - Sun)</p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <div className="flex items-center"><div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 rounded-sm mr-2"></div> Steps</div>
            <div className="flex items-center"><div className="w-3 h-1 bg-red-400 rounded-full mr-2"></div> Avg HR</div>
          </div>
        </div>
        <div className="h-72">
          {trend ? <TrendChart data={trend.hourlyData} /> : <div className="h-full flex items-center justify-center text-slate-400">No chart data</div>}
        </div>
      </div>
    </div>
  );
};
