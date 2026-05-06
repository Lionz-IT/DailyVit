import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { HistoryItem } from '../types/health';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeeklyChartProps {
  data: HistoryItem[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  const dayLabels = sorted.map(d => {
    const date = new Date(d.date + 'T00:00:00');
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
  });

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const chartData = {
    labels: dayLabels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Langkah',
        data: sorted.map(d => d.total_steps),
        backgroundColor: 'rgba(22, 163, 74, 0.7)',
        borderRadius: 6,
        yAxisID: 'y',
        order: 2,
        barThickness: 20,
      },
      {
        type: 'line' as const,
        label: 'Detak Jantung',
        data: sorted.map(d => d.avg_heart_rate === 0 ? null : d.avg_heart_rate),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        spanGaps: true,
        yAxisID: 'y1',
        order: 1,
        fill: true,
      }
    ]
  };

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          color: textColor,
          font: { family: "'DM Sans', sans-serif", size: 12 },
          padding: 16,
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(30,41,59,0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: "'DM Sans', sans-serif" },
        bodyFont: { family: "'DM Sans', sans-serif" },
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { family: "'DM Sans', sans-serif", size: 11 } },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
        title: { display: false },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: textColor, font: { size: 11 } },
        min: 40,
        max: 160,
        title: { display: false },
      },
    },
  };

  return (
    <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-textPrimary dark:text-slate-100">Aktivitas 7 Hari Terakhir</h3>
        <p className="text-sm text-textSecondary dark:text-slate-400">Cross-analysis detak jantung & langkah kaki</p>
      </div>
      <div className="h-72 w-full">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
};
