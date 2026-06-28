import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Menu, X, LineChart, Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

const translations = {
  en: {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    smartInsight: 'Smart Insight',
    settings: 'Settings',
    healthMonitoring: 'Health Monitoring',
    syncData: 'Sync Data',
    syncing: 'Syncing...',
    logout: 'Logout',
    syncFailed: 'Sync failed. Please try again.',
  },
  id: {
    dashboard: 'Beranda',
    analytics: 'Analitik',
    smartInsight: 'Wawasan Cerdas',
    settings: 'Pengaturan',
    healthMonitoring: 'Pemantauan Kesehatan',
    syncData: 'Sinkronisasi Data',
    syncing: 'Menyinkronkan...',
    logout: 'Keluar',
    syncFailed: 'Sinkronisasi gagal. Silakan coba lagi.',
  }
};

export const Sidebar: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const navItems = [
    { path: '/', label: t.dashboard, icon: LayoutDashboard },
    { path: '/history', label: t.analytics, icon: LineChart },
    { path: '/smart-insight', label: t.smartInsight, icon: Sparkles },
    { path: '/settings', label: t.settings, icon: Settings },
  ];

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.triggerSync();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(t.syncFailed);
    } finally {
      setSyncing(false);
    }
  };

  const nav = (
    <>
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link to="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="flex items-center justify-center flex-shrink-0">
            <img src="/dailyvit-logo.png" alt="DailyVit Logo" className="w-9 h-9 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300">
              <span className="text-xl font-bold text-slate-800 dark:text-white leading-tight">DailyVit</span>
              <span className="text-[10px] text-slate-500 font-medium leading-none">{t.healthMonitoring}</span>
            </div>
          )}
        </Link>
      </div>

      <nav className={`flex-1 space-y-2 overflow-y-auto mt-6 ${isCollapsed ? 'px-3' : 'px-4'}`}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? label : undefined}
              className={`flex items-center ${isCollapsed ? 'justify-center py-4 px-3' : 'space-x-4 py-4 px-5'} rounded-2xl text-base font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 mt-auto space-y-3 border-t border-slate-100 dark:border-slate-800/50 pt-6 ${isCollapsed ? 'px-3' : 'px-4'}`}>
        {isAuthenticated && (
          <button
            onClick={handleSync}
            disabled={syncing}
            title={isCollapsed ? t.syncData : undefined}
            className={`flex items-center justify-center ${isCollapsed ? 'px-3' : 'space-x-3 px-4'} py-3 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-70`}
          >
            <RefreshCw className={`w-5 h-5 flex-shrink-0 ${syncing ? 'animate-spin' : ''}`} />
            {!isCollapsed && <span className="whitespace-nowrap">{syncing ? t.syncing : t.syncData}</span>}
          </button>
        )}
        
        {isAuthenticated && (
          <button
            onClick={logout}
            title={isCollapsed ? t.logout : undefined}
            className={`flex items-center justify-center ${isCollapsed ? 'px-3' : 'space-x-3 px-4'} py-3 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{t.logout}</span>}
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      } ${
        mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Floating Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-9 z-50 items-center justify-center w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-teal-600 hover:border-teal-500 shadow-sm transition-all"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 ml-0.5" /> : <ChevronLeft className="w-4 h-4 pr-0.5" />}
        </button>

        {nav}
      </aside>
    </>
  );
};
