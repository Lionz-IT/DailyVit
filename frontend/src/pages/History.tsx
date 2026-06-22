import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { HistoryItem } from '../types/health';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Calendar, Download, Footprints, Flame, Moon, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WeeklyChart } from '../components/WeeklyChart';

export const History: React.FC = () => {
  const { isAuthenticated } = useAuth();
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

  const getStatusBadge = (steps: number) => {
    if (steps > 8000) return <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">Goal Reached</span>;
    if (steps > 5000) return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Active</span>;
    return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">Light</span>;
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Statistics History</h1>
          <p className="text-sm text-slate-500 mt-1">Review your detailed health metrics and progress.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Last 7 Days</span>
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center transition-colors duration-200">
          <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 mb-2">Not Logged In</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Please log in to view your detailed daily history.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Login Now
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
                  <Footprints className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Avg Steps/Day</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{avgSteps.toLocaleString('en-US')}</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Total Calories</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalCalories.toLocaleString('en-US')}</span>
                <span className="text-sm font-semibold text-slate-500">kcal</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium">Avg Sleep</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">N/A</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Sleep data not available</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500 mb-2">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Avg Heart Rate</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{avgHR}</span>
                <span className="text-sm font-semibold text-slate-500">bpm</span>
              </div>
            </div>
          </div>

          {history.length > 0 && <WeeklyChart data={history} />}

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Breakdown</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1 transition-colors">
                <span>Export Report</span>
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="py-3 px-6 font-semibold">Date</th>
                    <th className="py-3 px-6 font-semibold">Steps</th>
                    <th className="py-3 px-6 font-semibold">Calories (kcal)</th>
                    <th className="py-3 px-6 font-semibold">Avg HR (bpm)</th>
                    <th className="py-3 px-6 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {history.map((item) => {
                    const dateObj = new Date(item.date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    return (
                      <tr 
                        key={item.date} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/?date=${item.date}`)}
                      >
                        <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formattedDate}
                        </td>
                        <td className="py-4 px-6 text-sm text-blue-600 font-semibold">
                          {item.total_steps.toLocaleString('en-US')}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                          {item.total_calories.toLocaleString('en-US')}
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
                Belum ada data riwayat yang tersimpan.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};