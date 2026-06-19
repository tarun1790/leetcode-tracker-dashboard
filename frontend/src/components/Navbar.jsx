import React from 'react';
import { BarChart3, LayoutDashboard, CheckSquare, Trophy, Database } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, dbType }) {
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setActiveTab('dashboard')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        <span>LeetCode Tracker</span>
      </div>

      <div className="nav-links">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'problems' ? 'active' : ''}`}
          onClick={() => setActiveTab('problems')}
        >
          <CheckSquare size={18} />
          <span>Solved Problems</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'contests' ? 'active' : ''}`}
          onClick={() => setActiveTab('contests')}
        >
          <Trophy size={18} />
          <span>Contests</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </button>
      </div>

      {dbType && (
        <div className={`db-status ${dbType === 'Local JSON' ? 'local' : ''}`}>
          <Database size={14} />
          <span>{dbType}</span>
          <span className="db-dot"></span>
        </div>
      )}
    </nav>
  );
}
