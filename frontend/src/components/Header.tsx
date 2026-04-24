import React from 'react';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="bg-card shadow-sm mb-6 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
          <Leaf className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold font-sans">DailyVit</h1>
        </Link>
        <nav>
          <Link to="/history" className="text-textSecondary hover:text-primary font-medium transition-colors">
            Riwayat
          </Link>
        </nav>
      </div>
    </header>
  );
};
