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
  type ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { HourlyDataPoint } from '../types/health';

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
  Legend
);

interface TrendChartProps {
  data: HourlyDataPoint[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
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

  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Langkah Kaki',
        data: data.map(d => d.steps),
        backgroundColor: 'rgba(15, 76, 129, 0.7)',
        borderRadius: 4,
        yAxisID: 'y',
        order: 2
      },
      {
        type: 'line' as const,
        label: 'Detak Jantung (bpm)',
        data: data.map(d => d.heartRate === 0 ? null : d.heartRate),
        borderColor: '#00C896',
        backgroundColor: 'rgba(0, 200, 150, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderColor: '#00C896',
        pointBorderWidth: 2,
        spanGaps: true,
        yAxisID: 'y1',
        order: 1
      }
    ]
  };

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          color: textColor,
          font: {
            family: "'DM Sans', sans-serif"
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        titleFont: { family: "'DM Sans', sans-serif" },
        bodyFont: { family: "'DM Sans', sans-serif" },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, maxTicksLimit: 12, font: { family: "'DM Mono', monospace" } }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Langkah', color: textColor },
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'BPM', color: textColor },
        grid: { drawOnChartArea: false },
        ticks: { color: textColor },
        min: 40,
        max: 200
      },
    },
  };

  return (
    <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mt-6 transition-colors duration-200">
      <h3 className="text-lg font-bold text-textPrimary dark:text-slate-100 mb-6 transition-colors">Aktivitas & Detak Jantung – 24 Jam</h3>
      <div className="h-80 w-full relative">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
};
