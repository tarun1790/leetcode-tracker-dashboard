import React, { useState } from 'react';
import { Flame, Award, Clock, Zap, Plus, Trophy, ArrowUpRight, CheckCircle2, Sparkles, RefreshCw, Layers } from 'lucide-react';

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

  const [syncUsername, setSyncUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncSubmit = (e) => {
    e.preventDefault();
    if (!syncUsername.trim()) return;
    setIsSyncing(true);
    onSyncLeetcode(syncUsername.trim()).finally(() => setIsSyncing(false));
  };

  // Calculate percentages
  const easyPct = totalSolved > 0 ? Math.round((easyCount / totalSolved) * 100) : 0;
  const mediumPct = totalSolved > 0 ? Math.round((mediumCount / totalSolved) * 100) : 0;
  const hardPct = totalSolved > 0 ? Math.round((hardCount / totalSolved) * 100) : 0;

  // SVG Radial Ring Calculation (Circumference of r=48 is 2 * PI * 48 = 301.6)
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const targetTotal = 500; // Benchmark target
  const progressRatio = Math.min(totalSolved / targetTotal, 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Generate 53 weeks * 7 days of heatmap squares
  const getHeatmapDays = () => {
    const days = [];
    const today = new Date();
    const startDay = new Date(today);
    startDay.setDate(today.getDate() - 364);
    
    // Align to Sunday
    const startDayOfWeek = startDay.getDay();
    startDay.setDate(startDay.getDate() - startDayOfWeek);

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

  // Topic mastery estimations
  const topicBreakdown = [
    { name: 'Arrays & Hashing', count: problems.filter(p => (p.category || '').toLowerCase().includes('array') || (p.category || '').toLowerCase().includes('hash')).length || 18, color: 'var(--color-easy)', target: 25 },
    { name: 'Dynamic Programming', count: problems.filter(p => (p.category || '').toLowerCase().includes('dp') || (p.category || '').toLowerCase().includes('dynamic')).length || 12, color: 'var(--color-hard)', target: 20 },
    { name: 'Trees & Graphs', count: problems.filter(p => (p.category || '').toLowerCase().includes('tree') || (p.category || '').toLowerCase().includes('graph')).length || 14, color: 'var(--color-medium)', target: 20 },
    { name: 'Sliding Window', count: problems.filter(p => (p.category || '').toLowerCase().includes('window') || (p.category || '').toLowerCase().includes('two pointers')).length || 9, color: 'var(--color-cyan)', target: 15 },
  ];

  return (
    <div className="dashboard-container">
      {/* 1. Grand Hero Command Banner */}
      <div className="hero-banner">
        <div className="hero-profile-info">
          <div className="hero-avatar">
            {leetcodeProfile?.username ? leetcodeProfile.username.substring(0, 2).toUpperCase() : 'LC'}
          </div>
          <div className="hero-details">
            <h1>
              <span>{leetcodeProfile?.realName || leetcodeProfile?.username || 'Algorithm Architect'}</span>
              <span className="hero-badge-tier">
                <Trophy size={13} />
                {currentRating >= 1900 ? 'Guardian' : currentRating >= 1600 ? 'Knight Tier' : 'Contender'}
              </span>
            </h1>
            <div className="hero-meta">
              <span>Handle: <strong style={{ color: '#fff' }}>@{leetcodeProfile?.username || 'developer'}</strong></span>
              <span>•</span>
              <span>Global Percentile: <strong style={{ color: 'var(--color-easy)' }}>Top 4.8%</strong></span>
              <span>•</span>
              <span style={{ color: solvedToday ? 'var(--color-easy)' : 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={15} /> {solvedToday ? 'Solved today' : 'Daily challenge pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={onAddProblemClick}>
            <Plus size={18} />
            <span>Log Problem</span>
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onAddContestClick}>
            <Trophy size={18} />
            <span>Add Contest</span>
          </button>
        </div>
      </div>

      {/* 2. Grand Telemetry HUD */}
      <div className="telemetry-grid">
        {/* Total Solved Card with Radial Ring */}
        <div className="card telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">TOTAL SOLVED</span>
            <div className="telemetry-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)' }}>
              <Award size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="telemetry-value-grand">{totalSolved}</div>
              <div className="telemetry-subtext" style={{ marginTop: '0.35rem' }}>of {targetTotal} target goal</div>
            </div>
            <div className="radial-progress-wrapper" style={{ width: '80px', height: '80px' }}>
              <svg className="radial-progress-svg" viewBox="0 0 110 110">
                <circle className="radial-circle-bg" cx="55" cy="55" r={radius} />
                <circle
                  className="radial-circle-fill"
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke="var(--color-primary)"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="radial-progress-center">
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                  {Math.round(progressRatio * 100)}%
                </span>
              </div>
            </div>
          </div>
          <div className="telemetry-footer">
            <span>Easy: <strong style={{ color: 'var(--color-easy)' }}>{easyCount}</strong></span>
            <span>Med: <strong style={{ color: 'var(--color-medium)' }}>{mediumCount}</strong></span>
            <span>Hard: <strong style={{ color: 'var(--color-hard)' }}>{hardCount}</strong></span>
          </div>
        </div>

        {/* Grand Active Streak Card */}
        <div className="card telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">CURRENT STREAK</span>
            <div className="telemetry-icon-box" style={{ background: 'rgba(255, 87, 34, 0.15)', color: 'var(--color-flame)' }}>
              <Flame size={22} />
            </div>
          </div>
          <div className="telemetry-body">
            <span className="telemetry-value-grand" style={{ color: '#ff7043' }}>{currentStreak}</span>
            <span className="telemetry-subtext">DAYS ACTIVE</span>
          </div>
          <div className="telemetry-footer">
            <span>Personal Best: <strong style={{ color: '#fff' }}>{longestStreak} Days</strong></span>
            <span style={{ color: solvedToday ? 'var(--color-easy)' : 'var(--color-medium)' }}>
              {solvedToday ? '🔥 Active Today' : '⚡ Solve 1 to Keep Streak'}
            </span>
          </div>
        </div>

        {/* Contest Rating Card */}
        <div className="card telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">CONTEST RATING</span>
            <div className="telemetry-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-medium)' }}>
              <Trophy size={22} />
            </div>
          </div>
          <div className="telemetry-body">
            <span className="telemetry-value-grand">{currentRating}</span>
            <span className="telemetry-subtext">ELO RATING</span>
          </div>
          <div className="telemetry-footer">
            <span>All-time Peak: <strong style={{ color: 'var(--color-medium)' }}>{peakRating}</strong></span>
            <span style={{ color: 'var(--color-easy)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <ArrowUpRight size={14} /> Top 5%
            </span>
          </div>
        </div>

        {/* Performance & Velocity */}
        <div className="card telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">AVERAGE VELOCITY</span>
            <div className="telemetry-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--color-cyan)' }}>
              <Zap size={22} />
            </div>
          </div>
          <div className="telemetry-body">
            <span className="telemetry-value-grand" style={{ color: 'var(--color-cyan)' }}>{averageBeats}%</span>
            <span className="telemetry-subtext">RUNTIME BEATS</span>
          </div>
          <div className="telemetry-footer">
            <span>Avg Solve Time: <strong style={{ color: '#fff' }}>{averageTime} min</strong></span>
            <span style={{ color: 'var(--text-secondary)' }}>High Efficiency</span>
          </div>
        </div>
      </div>

      {/* 3. Dashboard Main Grid (8 Col / 4 Col) */}
      <div className="dashboard-main-grid">
        {/* Left Column: Difficulty Split + Grand Activity Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Difficulty Tier Breakdown */}
          <div className="card difficulty-breakdown-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Difficulty Distribution & Ratio</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target: 40% Easy • 45% Med • 15% Hard</span>
            </div>

            <div className="difficulty-pill-row">
              {/* Easy Pill */}
              <div className="diff-stat-pill easy">
                <div className="diff-pill-header">
                  <span className="diff-pill-name">Easy Problems</span>
                  <span style={{ color: 'var(--color-easy)', fontWeight: 700, fontSize: '0.85rem' }}>{easyPct}%</span>
                </div>
                <div className="diff-pill-count">{easyCount}</div>
                <div className="diff-pill-bar">
                  <div className="diff-pill-bar-fill" style={{ width: `${easyPct}%`, background: 'var(--color-easy)' }}></div>
                </div>
              </div>

              {/* Medium Pill */}
              <div className="diff-stat-pill medium">
                <div className="diff-pill-header">
                  <span className="diff-pill-name">Medium Problems</span>
                  <span style={{ color: 'var(--color-medium)', fontWeight: 700, fontSize: '0.85rem' }}>{mediumPct}%</span>
                </div>
                <div className="diff-pill-count">{mediumCount}</div>
                <div className="diff-pill-bar">
                  <div className="diff-pill-bar-fill" style={{ width: `${mediumPct}%`, background: 'var(--color-medium)' }}></div>
                </div>
              </div>

              {/* Hard Pill */}
              <div className="diff-stat-pill hard">
                <div className="diff-pill-header">
                  <span className="diff-pill-name">Hard Problems</span>
                  <span style={{ color: 'var(--color-hard)', fontWeight: 700, fontSize: '0.85rem' }}>{hardPct}%</span>
                </div>
                <div className="diff-pill-count">{hardCount}</div>
                <div className="diff-pill-bar">
                  <div className="diff-pill-bar-fill" style={{ width: `${hardPct}%`, background: 'var(--color-hard)' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Activity Matrix / Heatmap */}
          <div className="card heatmap-card">
            <div className="heatmap-header-flex">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Continuous Activity Matrix</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  365-day problem-solving consistency ledger
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Streak:</span>
                <strong style={{ color: '#fff' }}>{currentStreak} Days</strong>
              </div>
            </div>

            <div className="heatmap-matrix-scroll">
              <div className="heatmap-grid-grand">
                {heatmapDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`heatmap-cell-grand level-${day.level}`}
                    title={day.tooltip}
                  />
                ))}
              </div>
            </div>

            <div className="heatmap-footer">
              <span>Hover over any block to view daily log</span>
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="heatmap-cell-grand" style={{ width: '10px', height: '10px' }}></div>
                <div className="heatmap-cell-grand level-1" style={{ width: '10px', height: '10px' }}></div>
                <div className="heatmap-cell-grand level-2" style={{ width: '10px', height: '10px' }}></div>
                <div className="heatmap-cell-grand level-3" style={{ width: '10px', height: '10px' }}></div>
                <div className="heatmap-cell-grand level-4" style={{ width: '10px', height: '10px' }}></div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Topic Mastery + LeetCode Account Sync Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Topic Mastery Progress Radar */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Domain Mastery</span>
              </h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('problems')}
              >
                View All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {topicBreakdown.map((topic, index) => {
                const pct = Math.min(Math.round((topic.count / topic.target) * 100), 100);
                return (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{topic.name}</span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        <strong style={{ color: '#fff' }}>{topic.count}</strong> / {topic.target}
                      </span>
                    </div>
                    <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: topic.color,
                          borderRadius: '4px',
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync Account Box */}
          <div className="card card-elevated" style={{ background: 'linear-gradient(135deg, rgba(20, 24, 40, 0.9), rgba(12, 15, 25, 0.95))' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--color-cyan)' }} />
              <span>Live LeetCode Sync</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Sync your real-time LeetCode profile submission stats & contest ratings via official GraphQL proxy.
            </p>

            <form onSubmit={handleSyncSubmit} style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                className="form-input-grand"
                placeholder="LeetCode username (e.g. neetcode)"
                value={syncUsername}
                onChange={(e) => setSyncUsername(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSyncing}
                style={{ whiteSpace: 'nowrap' }}
              >
                {isSyncing ? <RefreshCw size={16} className="spin" /> : <RefreshCw size={16} />}
                <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
