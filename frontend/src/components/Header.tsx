import React, { useEffect, useState } from 'react';
import { Leaf, Sun, Moon, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="bg-card dark:bg-slate-800 shadow-sm mb-6 sticky top-0 z-10 transition-colors duration-200 border-b border-transparent dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-primary dark:text-accent hover:opacity-80 transition-opacity">
          <Leaf className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold font-sans dark:text-slate-100">DailyVit</h1>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/history" className="text-textSecondary dark:text-slate-300 hover:text-primary dark:hover:text-accent font-medium transition-colors">
            Riwayat
          </Link>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 text-textSecondary dark:text-slate-300 hover:text-primary dark:hover:text-accent transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-textSecondary dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
