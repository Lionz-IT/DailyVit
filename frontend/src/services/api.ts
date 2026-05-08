import axios from 'axios';
import type { DailySummary, TrendData, HistoryItem } from '../types/health';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let authFailureCallback: (() => void) | null = null;

export function setAuthFailureHandler(callback: () => void) {
  authFailureCallback = callback;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      if (authFailureCallback) {
        authFailureCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  getSummary: (date: string) =>
    apiClient.get<DailySummary>(`/api/summary?date=${date}`),

  getTrend: (date: string) =>
    apiClient.get<TrendData>(`/api/trend?date=${date}`),

  getHistory: (days: number = 7) =>
    apiClient.get<HistoryItem[]>(`/api/history?days=${days}`),

  triggerSync: (date?: string, currentHour?: number) =>
    apiClient.post(`/api/sync`, { date, currentHour }),
};
