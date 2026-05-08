import React, { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, Moon, Sun, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const TopBar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-4 sm:px-8 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 transition-colors gap-4">
      <div className="relative w-full sm:w-auto ml-10 lg:ml-0 mt-2 sm:mt-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari..."
          aria-label="Cari"
          className="pl-10 pr-4 py-2 bg-background dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-textPrimary dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full sm:w-64 transition-colors"
        />
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="p-2 text-slate-400 hover:text-primary dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          aria-label="Notifikasi"
          className="p-2 text-slate-400 hover:text-textPrimary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors hidden sm:block"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          aria-label="Bantuan"
          className="p-2 text-slate-400 hover:text-textPrimary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors hidden sm:block"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        {isAuthenticated ? (
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold ml-1">
            U
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center space-x-1.5 bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-1"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </div>
  );
};
