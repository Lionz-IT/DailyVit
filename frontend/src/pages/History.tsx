import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { HistoryItem } from '../types/health';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
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
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getEmojiForInsight = (insight: string) => {
    const match = insight.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\S)/);
    return match ? match[0] : '📊';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 transition-colors duration-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-textPrimary dark:text-slate-100">Riwayat 7 Hari</h2>
        <p className="text-textSecondary dark:text-slate-400 mt-1">Lihat kembali aktivitas dan kesehatanmu belakangan ini.</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background dark:bg-slate-900 text-textSecondary dark:text-slate-400 text-sm uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 transition-colors">
                  <th className="py-4 px-6 font-medium">Tanggal</th>
                  <th className="py-4 px-6 font-medium text-right">Langkah</th>
                  <th className="py-4 px-6 font-medium text-right">Kalori</th>
                  <th className="py-4 px-6 font-medium text-right">HR (bpm)</th>
                  <th className="py-4 px-6 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                {history.map((item) => (
                  <tr 
                    key={item.date} 
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/?date=${item.date}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-textPrimary dark:text-slate-200">{formatDate(item.date)}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-medium text-textPrimary dark:text-slate-200">
                      {item.total_steps.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-medium text-textPrimary dark:text-slate-200">
                      {item.total_calories}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-medium text-textPrimary dark:text-slate-200">
                      {item.avg_heart_rate}
                    </td>
                    <td className="py-4 px-6 text-center text-xl">
                      <span title={item.smart_insight}>{getEmojiForInsight(item.smart_insight)}</span>
                    </td>
                  </tr>
                ))}
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
