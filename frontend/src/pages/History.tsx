import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { HistoryItem } from '../types/health';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  const getRelativeDateLabel = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari Ini';
    if (diffDays === 1) return 'Kemarin';
    return `${diffDays} Hari Lalu`;
  };

  const getSleepScoreColor = (score: number) => {
    if (score >= 90) return 'bg-primary';
    if (score >= 80) return 'bg-accent';
    return 'bg-warning';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 transition-colors duration-200">
      <div className="mb-8 mt-6 lg:mt-8">
        <h2 className="text-3xl font-bold text-textPrimary dark:text-slate-100">Riwayat Kesehatan</h2>
        <p className="text-textSecondary dark:text-slate-400 mt-1">Log harian Anda selama 7 hari terakhir</p>
      </div>

      {!isAuthenticated ? (
        <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center transition-colors duration-200">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-textPrimary dark:text-slate-200 mb-2">Belum Login</h3>
          <p className="text-textSecondary dark:text-slate-400 mb-6 max-w-md mx-auto">
            Silakan login terlebih dahulu untuk melihat riwayat kesehatan harian Anda secara detail.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-200 p-2 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-textSecondary dark:text-slate-400 text-sm border-b border-gray-100 dark:border-slate-700">
                  <th className="py-4 px-4 font-semibold">Tanggal</th>
                  <th className="py-4 px-4 font-semibold">Detak Jantung</th>
                  <th className="py-4 px-4 font-semibold">Kalori</th>
                  <th className="py-4 px-4 font-semibold">Langkah</th>
                  <th className="py-4 px-4 font-semibold">Skor Tidur</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  // Generate pseudo-random sleep score between 70-95 based on date
                  const sleepScore = 70 + (item.date.charCodeAt(item.date.length - 1) % 26);
                  
                  return (
                    <tr 
                      key={item.date} 
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/?date=${item.date}`)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary transition-colors group-hover:bg-primary/20">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-textPrimary dark:text-slate-200 text-[15px]">
                            {getRelativeDateLabel(item.date)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-textPrimary dark:text-slate-200 text-lg">
                            {item.avg_heart_rate}
                          </span>
                          <span className="text-xs font-medium text-textSecondary dark:text-slate-400">
                            BPM
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-textPrimary dark:text-slate-200 text-lg">
                            {item.total_calories}
                          </span>
                          <span className="text-xs font-medium text-textSecondary dark:text-slate-400 uppercase">
                            Kcal
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-textPrimary dark:text-slate-200 text-lg">
                            {item.total_steps.toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs font-medium text-textSecondary dark:text-slate-400">
                            Langkah
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getSleepScoreColor(sleepScore)}`} 
                              style={{ width: `${sleepScore}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-textPrimary dark:text-slate-200 text-lg">
                            {sleepScore}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {history.length === 0 && (
            <div className="p-8 text-center text-textSecondary dark:text-slate-400">
              Belum ada data riwayat yang tersimpan.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
