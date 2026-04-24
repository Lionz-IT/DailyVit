import axios from 'axios';
import type { DailySummary, TrendData, HistoryItem } from '../types/health';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  getSummary: (date: string) => 
    axios.get<DailySummary>(`${API_BASE}/api/summary?date=${date}`),
  
  getTrend: (date: string) => 
    axios.get<TrendData>(`${API_BASE}/api/trend?date=${date}`),
  
  getHistory: (days: number = 7) => 
    axios.get<HistoryItem[]>(`${API_BASE}/api/history?days=${days}`),
  
  triggerSync: (date?: string) => 
    axios.post(`${API_BASE}/api/sync`, { date }),
};
