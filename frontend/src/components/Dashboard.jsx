import React from 'react';
import { Flame, Award, Clock, Zap, Plus, ExternalLink, HelpCircle } from 'lucide-react';

export default function Dashboard({ stats, onAddProblemClick, onAddContestClick, setActiveTab, onSyncLeetcode }) {
  const {
    totalSolved = 0,
    easyCount = 0,
    mediumCount = 0,
    hardCount = 0,
    currentStreak = 0,
    longestStreak = 0,
    solvedToday = false,
    averageBeats = 0,
    averageTime = 0,
    currentRating = 1500,
    peakRating = 1500,
    contributionMap = {},
    recentProblems = [],
    leetcodeProfile = null
  } = stats;

  // Generate 53 weeks * 7 days of heatmap squares ending today
  const getHeatmapDays = () => {
    const days = [];
    const today = new Date();
    
    // Start 364 days ago
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - 364);
    
    // Roll back to the preceding Sunday to align the calendar columns
    const startDayOfWeek = startDay.getDay();
    startDay.setDate(startDay.getDate() - startDayOfWeek);

    // Generate 371 cells (53 weeks * 7 days)
    for (let i = 0; i < 371; i++) {
      const currentDate = new Date(startDay);
      currentDate.setDate(startDay.getDate() + i);
      
      // format YYYY-MM-DD in local time
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const count = contributionMap[dateStr] || 0;
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count > 3) level = 4;

      days.push({
        date: dateStr,
        count,
        level,
        tooltip: `${count} solved on ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      });
    }
    return days;
  };

  const heatmapDays = getHeatmapDays();

  // Find percentage splits for visual display
  const easyPct = totalSolved > 0 ? Math.round((easyCount / totalSolved) * 100) : 0;
  const mediumPct = totalSolved > 0 ? Math.round((mediumCount / totalSolved) * 100) : 0;
  const hardPct = totalSolved > 0 ? Math.round((hardCount / totalSolved) * 100) : 0;

  return (
    <div className="dashboard-container">
      {/* Upper Grid: Streak and Quick Stats */}
      <div className="dashboard-grid">
        
        {/* Streak Card */}
        <div className="card streak-card col-4">
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Daily Streak</span>
            <div className="stat-icon">
              <span className="streak-flame">🔥</span>
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', display: 'inline-block' }}>
              {currentStreak}
            </h1>
            <span style={{ marginLeft: '0.5rem', fontSize: '1.1rem', fontWeight: 600, color: 'var(--fire-orange)' }}>
              days
            </span>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {solvedToday ? "Solved today! Keep it up!" : "Solve a problem today to continue your streak!"}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', borderTop: '1px solid rgba(255,90,31,0.15)', paddingTop: '1rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LONGEST STREAK</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{longestStreak} days</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>STATUS</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: solvedToday ? 'var(--color-easy)' : 'var(--color-medium)' }}>
                {solvedToday ? 'Active' : 'Awaiting Solve'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="stats-grid" style={{ margin: 0 }}>
            {/* Total Solved */}
            <div className="card stat-card" style={{ padding: '1.25rem' }}>
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                <Award size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">TOTAL SOLVED</span>
                <span className="stat-value">{totalSolved}</span>
              </div>
            </div>

            {/* Average Beats */}
            <div className="card stat-card" style={{ padding: '1.25rem' }}>
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-easy)' }}>
                <Zap size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">AVG RUNTIME BEATS</span>
                <span className="stat-value">{averageBeats}%</span>
              </div>
            </div>

            {/* Avg Time */}
            <div className="card stat-card" style={{ padding: '1.25rem' }}>
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-medium)' }}>
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">AVG SOLVE TIME</span>
                <span className="stat-value">{averageTime}m</span>
              </div>
            </div>

            {/* Contest Rating */}
            <div className="card stat-card" style={{ padding: '1.25rem' }}>
              <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-secondary)' }}>
                <TrophyIcon size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">CONTEST RATING</span>
                <span className="stat-value">{currentRating}</span>
              </div>
            </div>
          </div>

          {/* Difficulty Progress Overview Card */}
          <div className="card" style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', letterSpacing: '0.3px' }}>
              DIFFICULTY DISTRIBUTION
            </h4>
            <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ width: `${easyPct}%`, background: 'var(--color-easy)' }} title={`Easy: ${easyCount}`}></div>
              <div style={{ width: `${mediumPct}%`, background: 'var(--color-medium)' }} title={`Medium: ${mediumCount}`}></div>
              <div style={{ width: `${hardPct}%`, background: 'var(--color-hard)' }} title={`Hard: ${hardCount}`}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span className="flex-center" style={{ gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-easy)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Easy:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{easyCount} ({easyPct}%)</strong>
              </span>
              <span className="flex-center" style={{ gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-medium)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Medium:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{mediumCount} ({mediumPct}%)</strong>
              </span>
              <span className="flex-center" style={{ gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-hard)' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Hard:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{hardCount} ({hardPct}%)</strong>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Contribution Calendar Heatmap */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <div className="heatmap-container">
          <div className="heatmap-header">
            <div>
              <h3 className="heatmap-title">
                <Flame size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Contribution Activity</span>
              </h3>
              <span className="heatmap-subtitle">Visualizing solved problems over the past year</span>
            </div>
            <div className="heatmap-legend">
              <span>Less</span>
              <div className="legend-square level-0"></div>
              <div className="legend-square level-1"></div>
              <div className="legend-square level-2"></div>
              <div className="legend-square level-3"></div>
              <div className="legend-square level-4"></div>
              <span>More</span>
            </div>
          </div>
          
          <div className="heatmap-scroll">
            <div className="heatmap-grid">
              {heatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`heatmap-day level-${day.level}`}
                  data-tooltip={day.tooltip}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Activity & Quick Navigation */}
      <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
        
        {/* Recent Solved Problems */}
        <div className="card col-8">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Recent Submissions</span>
            </h3>
            <button 
              className="text-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => setActiveTab('problems')}
            >
              View all
            </button>
          </div>

          {recentProblems.length === 0 ? (
            <div className="empty-state">
              <HelpCircle size={40} />
              <p>No solved problems logged yet.</p>
            </div>
          ) : (
            <div className="table-container" style={{ background: 'none', border: 'none', borderRadius: 0 }}>
              <table className="tracker-table">
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Problem</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Difficulty</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Beats</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProblems.map((prob) => (
                    <tr key={prob._id || prob.id}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        {prob.link ? (
                          <a href={prob.link} target="_blank" rel="noopener noreferrer" className="text-link">
                            {prob.title}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span>{prob.title}</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {prob.category}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>
                        {prob.runtimeBeats ? `${prob.runtimeBeats}%` : '-'}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(prob.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="card col-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            {/* Synced Profile Information */}
            {leetcodeProfile && (
              <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={leetcodeProfile.userAvatar || 'https://assets.leetcode.com/users/default_avatar.jpg'}
                  alt="LeetCode Avatar"
                  style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--color-primary)', boxShadow: '0 0 8px var(--color-primary-glow)' }}
                  onError={(e) => { e.target.src = 'https://assets.leetcode.com/users/default_avatar.jpg'; }}
                />
                <div style={{ flex: 1 }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{leetcodeProfile.username}</span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>Linked</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.1rem' }}>
                    Global Rank: <strong>{leetcodeProfile.ranking > 1000000 ? '> 1M' : `#${leetcodeProfile.ranking.toLocaleString()}`}</strong>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                    Profile Solved: <span className="text-easy" style={{fontWeight:600}}>{leetcodeProfile.easyCount}E</span> | <span className="text-medium" style={{fontWeight:600}}>{leetcodeProfile.mediumCount}M</span> | <span className="text-hard" style={{fontWeight:600}}>{leetcodeProfile.hardCount}H</span>
                  </span>
                </div>
              </div>
            )}

            {/* Sync Section */}
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Sync LeetCode Account</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Fetch public submissions and contest histories automatically.
              </p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const username = e.target.username.value.trim();
                if (username) {
                  onSyncLeetcode(username);
                  localStorage.setItem('leetcode_username', username);
                }
              }} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="username"
                  className="input-control"
                  placeholder="Username"
                  defaultValue={localStorage.getItem('leetcode_username') || ''}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  Sync
                </button>
              </form>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Quick Actions</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Logged a new solve, or completed a LeetCode contest? Add it to your stats now.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={onAddProblemClick} style={{ width: '100%' }}>
                <Plus size={16} />
                <span>Log Solved Problem</span>
              </button>
              <button className="btn" onClick={onAddContestClick} style={{ width: '100%', borderColor: 'rgba(255,255,255,0.06)' }}>
                <Plus size={16} />
                <span>Log Contest Result</span>
              </button>
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--card-border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>🎯 Weekly Target</strong>
            Log at least 5 solves per week. Go to the <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setActiveTab('analytics')}>Analytics</span> tab to see progress.
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline Trophy icon (Recharts requires standard components, we define locally or import)
function TrophyIcon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
    </svg>
  );
}
