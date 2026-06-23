export interface LocalizedInsight {
  trendDeviation: { en: string; id: string };
  healthStatus: { en: string; id: string };
  dailyTarget: { en: string; id: string };
}

export interface DailySummary {
  date: string;
  total_steps: number;
  total_calories: number;
  avg_heart_rate: number;
  smart_insight: string | LocalizedInsight;
  baseline: {
    avg_steps: number;
    avg_heart_rate: number;
    avg_calories: number;
  };
}

export interface HourlyDataPoint {
  hour: number;
  label: string;
  steps: number;
  heartRate: number;
  calories: number;
}

export interface TrendData {
  date: string;
  hourlyData: HourlyDataPoint[];
}

export interface HistoryItem {
  date: string;
  total_steps: number;
  total_calories: number;
  avg_heart_rate: number;
  smart_insight: string | LocalizedInsight;
  created_at: string;
  updated_at: string;
}
