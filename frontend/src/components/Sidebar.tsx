import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Settings, LogOut, Menu, X, Users, HeartPulse, LineChart, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/vitals', label: 'Vitals', icon: HeartPulse },
  { path: '/history', label: 'Analytics', icon: LineChart },
  { path: '/smart-insight', label: 'Smart Insight', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.triggerSync();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const nav = (
    <>
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-blue-600 rounded-lg p-1.5 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-800 dark:text-white leading-tight">DailyVit</span>
            <span className="text-[10px] text-slate-500 font-medium leading-none">Health Monitoring</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-3">
        {isAuthenticated && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        )}
        
        {isAuthenticated && (
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
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

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-200 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {nav}
      </aside>
    </>
  );
};
