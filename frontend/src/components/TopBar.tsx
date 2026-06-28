import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const translations = {
  en: {
    synced: 'Smartwatch Synced',
    login: 'Login',
  },
  id: {
    synced: 'Jam Tangan Disinkronkan',
    login: 'Masuk',
  }
};

export const TopBar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md h-16 sm:h-20 px-4 lg:px-10 flex items-center justify-end sticky top-0 z-30 transition-colors shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 ml-12 lg:ml-0">
        {isAuthenticated ? (
          <>
            <div className="hidden sm:flex items-center justify-center w-[185px] py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-full border border-teal-100 dark:border-teal-900/30 whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-teal-500 mr-2 shrink-0" />
              <span className="text-xs font-semibold">{t.synced}</span>
            </div>

            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 flex items-center gap-1.5 text-teal-600 dark:text-teal-400 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 rounded-full transition-colors border border-teal-100 dark:border-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm ml-2">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rafif`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-sm"
          >
            {t.login}
          </Link>
        )}
      </div>
    </header>
  );
};
