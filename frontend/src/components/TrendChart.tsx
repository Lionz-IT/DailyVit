import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  data: HourlyDataPoint[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
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
        pointBackgroundColor: '#FFFFFF',
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
          font: {
            family: "'DM Sans', sans-serif"
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleFont: { family: "'DM Sans', sans-serif" },
        bodyFont: { family: "'DM Sans', sans-serif" },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 12, font: { family: "'DM Mono', monospace" } }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Langkah' },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'BPM' },
        grid: { drawOnChartArea: false },
        min: 40,
        max: 200
      },
    },
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold text-textPrimary mb-6">Aktivitas & Detak Jantung — 24 Jam</h3>
      <div className="h-80 w-full relative">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
};
