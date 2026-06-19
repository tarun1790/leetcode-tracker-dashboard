import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProblemsTracker from './components/ProblemsTracker';
import ContestRatings from './components/ContestRatings';
import Analytics from './components/Analytics';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for data
  const [dashboardStats, setDashboardStats] = useState({});
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});

  // Direct modal trigger states
  const [defaultOpenProblemModal, setDefaultOpenProblemModal] = useState(false);
  const [defaultOpenContestModal, setDefaultOpenContestModal] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, problemsRes, contestsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`).then(r => {
          if (!r.ok) throw new Error('Failed to fetch dashboard stats');
          return r.json();
        }),
        fetch(`${API_BASE}/problems`).then(r => {
          if (!r.ok) throw new Error('Failed to fetch problems list');
          return r.json();
        }),
        fetch(`${API_BASE}/contests`).then(r => {
          if (!r.ok) throw new Error('Failed to fetch contests list');
          return r.json();
        }),
        fetch(`${API_BASE}/analytics/stats`).then(r => {
          if (!r.ok) throw new Error('Failed to fetch analytics metrics');
          return r.json();
        })
      ]);

      setDashboardStats(statsRes);
      setProblems(problemsRes);
      setContests(contestsRes);
      setAnalyticsData(analyticsRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Could not connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Mutator functions
  const handleSaveProblem = async (problemData) => {
    try {
      const res = await fetch(`${API_BASE}/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemData)
      });
      if (!res.ok) throw new Error('Failed to save problem');
      await fetchAllData();
    } catch (err) {
      alert(`Error saving problem: ${err.message}`);
    }
  };

  const handleDeleteProblem = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/problems/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete problem');
      await fetchAllData();
    } catch (err) {
      alert(`Error deleting problem: ${err.message}`);
    }
  };

  const handleSaveContest = async (contestData) => {
    try {
      const res = await fetch(`${API_BASE}/contests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contestData)
      });
      if (!res.ok) throw new Error('Failed to save contest');
      await fetchAllData();
    } catch (err) {
      alert(`Error saving contest: ${err.message}`);
    }
  };

  const handleDeleteContest = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/contests/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete contest');
      await fetchAllData();
    } catch (err) {
      alert(`Error deleting contest: ${err.message}`);
    }
  };

  // Navigational helpers from Dashboard quick actions
  const triggerAddProblemFlow = () => {
    setDefaultOpenProblemModal(true);
    setActiveTab('problems');
  };

  const triggerAddContestFlow = () => {
    setDefaultOpenContestModal(true);
    setActiveTab('contests');
  };

  // Render sub-components based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
          <div className="loading-spinner"></div>
          <span style={{ color: 'var(--text-secondary)' }}>Loading dashboard metrics...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="card empty-state" style={{ margin: '3rem auto', maxWidth: '500px', padding: '3rem 2rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-hard)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Server Connection Failed</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {error}. Make sure your backend node server is running.
          </p>
          <button className="btn btn-primary" onClick={fetchAllData} style={{ margin: '0 auto' }}>
            Retry Connection
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={dashboardStats}
            onAddProblemClick={triggerAddProblemFlow}
            onAddContestClick={triggerAddContestFlow}
            setActiveTab={setActiveTab}
          />
        );
      case 'problems':
        // Wrap local modal trigger logic in component by checking state
        return (
          <ProblemsTracker
            problems={problems}
            onSaveProblem={handleSaveProblem}
            onDeleteProblem={handleDeleteProblem}
            // Pass down defaults
            defaultOpenAddModal={defaultOpenProblemModal}
            onDefaultOpenModalHandled={() => setDefaultOpenProblemModal(false)}
          />
        );
      case 'contests':
        return (
          <ContestRatings
            contests={contests}
            onSaveContest={handleSaveContest}
            onDeleteContest={handleDeleteContest}
            defaultOpenAddModal={defaultOpenContestModal}
            onDefaultOpenModalHandled={() => setDefaultOpenContestModal(false)}
          />
        );
      case 'analytics':
        return <Analytics analyticsData={analyticsData} />;
      default:
        return <div>Tab not found.</div>;
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        dbType={dashboardStats.dbType} 
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
