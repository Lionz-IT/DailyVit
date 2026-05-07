import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Clock, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/history', label: 'Riwayat', icon: Clock },
  { path: '/settings', label: 'Setting', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <>
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/dailyvit-logo.png" alt="DailyVit Logo" className="w-9 h-9 rounded-lg bg-white p-0.5" />
          <span className="text-xl font-bold text-white">DailyVit</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-green-900/50 rounded-xl p-4 mb-3">
          <p className="text-[11px] font-medium text-green-500 uppercase tracking-wider mb-2">Connected Device</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm font-medium text-white">Huawei Watch</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-4">Belum terhubung</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-950 text-white rounded-lg"
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

      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-green-950 flex flex-col transform transition-transform duration-200 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {nav}
      </aside>
    </>
  );
};
