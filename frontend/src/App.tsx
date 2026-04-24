import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';

// Simple wrapper to parse query params for dashboard if needed
const DashboardWrapper = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  
  // Dashboard component manages its own date state, 
  // but if we navigate from history, it might be better to lift the state or use effect in Dashboard
  // To keep it simple based on the structure, we'll let Dashboard handle its own defaults 
  // We can pass date as a prop if we want, but let's let Dashboard use URL or default
  
  return <Dashboard />;
}

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<DashboardWrapper />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
