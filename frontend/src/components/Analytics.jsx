import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Target, TrendingUp, HelpCircle, BookOpen, Clock, Zap } from 'lucide-react';

export default function Analytics({ analyticsData }) {
  const {
    difficultyDist = [],
    categoryStats = [],
    goals = { weeklyTarget: 5, weeklyProgress: 0, monthlyTarget: 20, monthlyProgress: 0 },
    diffPerformance = [],
    solvedOverTime = []
  } = analyticsData;

  const totalProblems = difficultyDist.reduce((sum, d) => sum + d.value, 0);

  // Weekly and Monthly Goals progress percentages
  const weeklyPct = Math.min(Math.round((goals.weeklyProgress / goals.weeklyTarget) * 100), 100);
  const monthlyPct = Math.min(Math.round((goals.monthlyProgress / goals.monthlyTarget) * 100), 100);

  // Custom Pie Chart Tooltip
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalProblems > 0 ? Math.round((data.value / totalProblems) * 100) : 0;
      return (
        <div className="card" style={{ padding: '0.5rem 0.75rem', background: '#12121e', border: `1px solid ${data.color}` }}>
          <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{data.name}</strong>
          <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Solved: <strong style={{ color: '#fff' }}>{data.value} ({pct}%)</strong>
          </span>
        </div>
      );
    }
    return null;
  };

  // Custom Bar Chart Tooltip
  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card" style={{ padding: '0.5rem 0.75rem', background: '#12121e', border: '1px solid var(--color-primary)' }}>
          <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{data.name}</strong>
          <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
            Problems: <strong style={{ color: 'var(--color-primary)' }}>{data.count}</strong>
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-container">
      {/* Page Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Performance Analytics</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Deep-dive metrics and trends for your problem-solving metrics
          </p>
        </div>
      </div>

      {totalProblems === 0 ? (
        <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
          <HelpCircle size={48} />
          <h3 style={{ marginTop: '1rem', color: 'var(--text-primary)' }}>No Analytics Available</h3>
          <p style={{ maxWidth: '400px', margin: '0.5rem auto 0' }}>
            Please log some solved LeetCode problems first to populate your charts and dashboards.
          </p>
        </div>
      ) : (
        <>
          {/* Top Row: Difficulty Donut and Goals */}
          <div className="dashboard-grid">
            
            {/* Donut Chart: Difficulty Distribution */}
            <div className="card col-6">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Difficulty Distribution</h3>
              <div className="chart-container-flex">
                <div style={{ width: '180px', height: '180px', position: 'relative' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={difficultyDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {difficultyDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text inside Donut */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
                    <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{totalProblems}</strong>
                  </div>
                </div>

                <div className="donut-legend">
                  {difficultyDist.map((item, idx) => (
                    <div key={idx} className="donut-legend-item">
                      <span className="legend-color-dot" style={{ background: item.color }}></span>
                      <span className="legend-label" style={{ width: '60px' }}>{item.name}</span>
                      <span className="legend-value">{item.value}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        ({totalProblems > 0 ? Math.round((item.value / totalProblems) * 100) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            <div className="card col-6">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Problem Solving Goals</span>
              </h3>
              
              <div className="goal-item" style={{ marginTop: '0.5rem' }}>
                <div className="goal-info">
                  <span style={{ fontWeight: 600 }}>Weekly Target</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{goals.weeklyProgress}</strong> / {goals.weeklyTarget} solved
                  </span>
                </div>
                <div className="goal-progress-bar-bg">
                  <div className="goal-progress-bar-fill" style={{ width: `${weeklyPct}%` }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {weeklyPct >= 100 ? '🎉 Weekly goal achieved!' : `${goals.weeklyTarget - goals.weeklyProgress} more to hit your weekly target.`}
                </span>
              </div>

              <div className="goal-item" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <div className="goal-info">
                  <span style={{ fontWeight: 600 }}>Monthly Target</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{goals.monthlyProgress}</strong> / {goals.monthlyTarget} solved
                  </span>
                </div>
                <div className="goal-progress-bar-bg">
                  <div className="goal-progress-bar-fill" style={{ width: `${monthlyPct}%`, background: 'linear-gradient(90deg, var(--color-secondary) 0%, #3b82f6 100%)' }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {monthlyPct >= 100 ? '🎉 Monthly goal achieved!' : `${goals.monthlyTarget - goals.monthlyProgress} more to hit your monthly target.`}
                </span>
              </div>
            </div>

          </div>

          {/* Middle Row: Category Breakdown and Daily Progress */}
          <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
            
            {/* Category breakdown (BarChart) */}
            <div className="card col-7">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Topic Breakdown</span>
              </h3>
              {categoryStats.length === 0 ? (
                <div className="empty-state" style={{ height: '220px' }}>No category tags found.</div>
              ) : (
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={categoryStats} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CategoryTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={45}>
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Solved Over Time (Progress LineChart) */}
            <div className="card col-5">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} style={{ color: 'var(--color-easy)' }} />
                <span>Daily Velocity (Last 10 Days)</span>
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={solvedOverTime} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ background: '#12121e', borderColor: 'var(--card-border)' }}
                      labelStyle={{ color: 'var(--text-secondary)' }}
                      itemStyle={{ color: 'var(--color-easy)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Solved"
                      stroke="var(--color-easy)"
                      strokeWidth={2.5}
                      dot={{ r: 4, stroke: 'var(--color-easy)', strokeWidth: 1.5, fill: 'var(--bg-primary)' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Bottom Row: Difficulty Performance Averages */}
          <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Solving Metrics by Difficulty</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {diffPerformance.map((perf, index) => {
                const colors = {
                  Easy: 'var(--color-easy)',
                  Medium: 'var(--color-medium)',
                  Hard: 'var(--color-hard)'
                };
                const col = colors[perf.difficulty] || 'var(--color-primary)';

                return (
                  <div 
                    key={index} 
                    className="card" 
                    style={{ 
                      background: 'rgba(255,255,255,0.015)', 
                      borderColor: 'rgba(255,255,255,0.04)', 
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    <div className="flex-between">
                      <span className={`badge badge-${perf.difficulty.toLowerCase()}`}>
                        {perf.difficulty}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>{perf.count}</strong> solved
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                      <div className="flex-center" style={{ flexDirection: 'column', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <Clock size={16} style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Time</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                          {perf.avgTime > 0 ? `${perf.avgTime}m` : '-'}
                        </strong>
                      </div>

                      <div className="flex-center" style={{ flexDirection: 'column', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <Zap size={16} style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Beats</span>
                        <strong style={{ fontSize: '1.1rem', color: col, marginTop: '0.15rem' }}>
                          {perf.avgBeats > 0 ? `${perf.avgBeats}%` : '-'}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
