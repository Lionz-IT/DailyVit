import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  baselineValue: number;
  isHigherBetter?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  baselineValue,
  isHigherBetter = true,
}) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const ratio = baselineValue > 0 ? numericValue / baselineValue : 1;
  const percentage = Math.abs(ratio - 1) * 100;
  
  let statusColor = "text-textSecondary";
  let indicatorText = "";

  if (ratio > 1.05) {
    statusColor = isHigherBetter ? "text-accent" : "text-warning";
    indicatorText = `↑ ${percentage.toFixed(0)}% dari rata-rata`;
  } else if (ratio < 0.95) {
    statusColor = isHigherBetter ? "text-warning" : "text-accent";
    indicatorText = `↓ ${percentage.toFixed(0)}% dari rata-rata`;
  } else {
    indicatorText = "Sesuai rata-rata";
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="bg-background p-3 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-textSecondary text-sm font-medium">{title}</h3>
        <div className="flex items-baseline mt-1 space-x-1">
          <span className="text-3xl font-bold font-mono text-textPrimary">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </span>
          <span className="text-sm font-medium text-textSecondary">{unit}</span>
        </div>
      </div>
      
      <div className={`mt-4 text-sm font-medium ${statusColor}`}>
        {indicatorText}
      </div>
    </div>
  );
};
