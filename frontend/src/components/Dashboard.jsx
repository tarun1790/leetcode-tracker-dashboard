import React from 'react';
import { Flame, Award, Clock, Zap, Plus, ExternalLink, HelpCircle } from 'lucide-react';

export default function Dashboard({ stats, problems = [], onAddProblemClick, onAddContestClick, setActiveTab, onSyncLeetcode }) {
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
    leetcodeProfile = null
  } = stats;

  // Filter problems for the three columns
  const easyProblems = problems.filter(p => p.difficulty === 'Easy');
  const mediumProblems = problems.filter(p => p.difficulty === 'Medium');
  const hardProblems = problems.filter(p => p.difficulty === 'Hard');

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
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: Stats, Heatmap, 3-Columns (Span 8) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Stats Grid */}
          <div className="stats-grid" style={{ margin: 0 }}>
            {/* Total Solved */}
            <div className="card stat-card card-easy">
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                <Award size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">TOTAL SOLVED</span>
                <span className="stat-value">{totalSolved}</span>
              </div>
            </div>

            {/* Average Beats */}
            <div className="card stat-card card-easy">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-easy)' }}>
                <Zap size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">AVG RUNTIME BEATS</span>
                <span className="stat-value">{averageBeats}%</span>
              </div>
            </div>

            {/* Avg Time */}
            <div className="card stat-card card-medium">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-medium)' }}>
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-label">AVG SOLVE TIME</span>
                <span className="stat-value">{averageTime}m</span>
              </div>
            </div>

            {/* Contest Rating */}
            <div className="card stat-card card-hard">
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
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', letterSpacing: '0.3px' }}>
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

          {/* Contribution Calendar Heatmap */}
          <div className="card" style={{ padding: '1.5rem' }}>
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

          {/* Solved Problems Columns Layout (Easy / Medium / Hard) */}
          <div>
            <h3 className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Solved Problems Board</span>
            </h3>
            <div className="solved-columns-container">
              
              {/* Easy Column */}
              <div className="solved-column card-easy">
                <div className="solved-column-header easy">
                  <span>🟢 Easy Solves</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.5rem', borderRadius: '20px', fontWeight: 700 }}>
                    {easyProblems.length}
                  </span>
                </div>
                <div className="solved-column-list">
                  {easyProblems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      No Easy problems solved.
                    </div>
                  ) : (
                    easyProblems.map(p => (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="solved-problem-card easy" key={p._id || p.id}>
                        <div className="solved-problem-title-row">
                          <span className="solved-problem-title" title={p.title}>{p.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(p.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="solved-problem-meta">
                          <span className="solved-problem-category">{p.category}</span>
                          {p.runtimeBeats && (
                            <span className="solved-problem-beats easy">Beats {p.runtimeBeats}%</span>
                          )}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>

              {/* Medium Column */}
              <div className="solved-column card-medium">
                <div className="solved-column-header medium">
                  <span>🟡 Medium Solves</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', padding: '0.1rem 0.5rem', borderRadius: '20px', fontWeight: 700 }}>
                    {mediumProblems.length}
                  </span>
                </div>
                <div className="solved-column-list">
                  {mediumProblems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      No Medium problems solved.
                    </div>
                  ) : (
                    mediumProblems.map(p => (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="solved-problem-card medium" key={p._id || p.id}>
                        <div className="solved-problem-title-row">
                          <span className="solved-problem-title" title={p.title}>{p.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(p.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="solved-problem-meta">
                          <span className="solved-problem-category">{p.category}</span>
                          {p.runtimeBeats && (
                            <span className="solved-problem-beats medium">Beats {p.runtimeBeats}%</span>
                          )}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>

              {/* Hard Column */}
              <div className="solved-column card-hard">
                <div className="solved-column-header hard">
                  <span>🔴 Hard Solves</span>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', padding: '0.1rem 0.5rem', borderRadius: '20px', fontWeight: 700 }}>
                    {hardProblems.length}
                  </span>
                </div>
                <div className="solved-column-list">
                  {hardProblems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      No Hard problems solved.
                    </div>
                  ) : (
                    hardProblems.map(p => (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="solved-problem-card hard" key={p._id || p.id}>
                        <div className="solved-problem-title-row">
                          <span className="solved-problem-title" title={p.title}>{p.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(p.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="solved-problem-meta">
                          <span className="solved-problem-category">{p.category}</span>
                          {p.runtimeBeats && (
                            <span className="solved-problem-beats hard">Beats {p.runtimeBeats}%</span>
                          )}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Streak, Profile Sync, Quick Actions, Target Progress (Span 4) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Streak Card */}
          <div className="card streak-card card-streak" style={{ width: '100%' }}>
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

          {/* Actions & Profile Sync Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            
            {/* Synced Profile Information */}
            {leetcodeProfile && (
              <div style={{ marginBottom: '0.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Sync LeetCode Account</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
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

            {/* Quick Actions */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quick Actions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Manually record a new solve or log a contest performance.
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

          </div>

          {/* Goal Tracker Info Box */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid var(--card-border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>🎯 Weekly Target</strong>
            Log at least 5 solves per week. Go to the <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setActiveTab('analytics')}>Analytics</span> tab to see progress.
          </div>

        </div>

      </div>
    </div>
  );
}

// Inline Trophy icon
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
