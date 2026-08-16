import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Target, TrendingUp, HelpCircle, BookOpen, Clock, Zap, Award, Layers } from 'lucide-react';

export default function Analytics({ analyticsData }) {
  const {
    difficultyDist = [],
    categoryStats = [],
    goals = { weeklyTarget: 5, weeklyProgress: 0, monthlyTarget: 20, monthlyProgress: 0 },
    diffPerformance = [],
    solvedOverTime = []
  } = analyticsData;

  const totalProblems = difficultyDist.reduce((sum, d) => sum + d.value, 0);

  // Weekly & Monthly calculations
  const weeklyPct = Math.min(Math.round((goals.weeklyProgress / goals.weeklyTarget) * 100), 100);
  const monthlyPct = Math.min(Math.round((goals.monthlyProgress / goals.monthlyTarget) * 100), 100);

  // Custom Glass Pie Tooltip
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalProblems > 0 ? Math.round((data.value / totalProblems) * 100) : 0;
      return (
        <div style={{ background: '#0e111a', border: `1px solid ${data.color}`, borderRadius: '10px', padding: '0.75rem 1rem', boxShadow: 'var(--shadow-md)' }}>
          <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{data.name} Difficulty</strong>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem', display: 'block' }}>
            Total Solved: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{data.value} ({pct}%)</strong>
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
        <div style={{ background: '#0e111a', border: '1px solid var(--color-primary)', borderRadius: '10px', padding: '0.75rem 1rem', boxShadow: 'var(--shadow-md)' }}>
          <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{data.name}</strong>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem', display: 'block' }}>
            Problems Completed: <strong style={{ color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)' }}>{data.count}</strong>
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-container">
      {/* 1. Page Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Deep Performance Analytics</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Comprehensive telemetry, domain category distribution, and solving goal pacing
          </p>
        </div>
      </div>

      {totalProblems === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <HelpCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Problem Logs Recorded</h3>
          <p style={{ fontSize: '0.9rem' }}>Please log some solved challenges in the Solved Problems tab to populate analytics.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Top Row: Difficulty Donut + Goal Pacing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Donut Chart: Difficulty Distribution */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                Difficulty Distribution Ratio
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ width: '190px', height: '190px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={88}
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
                  
                  {/* Center Total Value */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}>TOTAL</span>
                    <strong style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{totalProblems}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {difficultyDist.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color, boxShadow: `0 0 8px ${item.color}` }}></span>
                      <span style={{ width: '70px', fontWeight: 600, color: '#fff' }}>{item.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>{item.value}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        ({totalProblems > 0 ? Math.round((item.value / totalProblems) * 100) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Goals Pacing */}
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} style={{ color: 'var(--color-primary)' }} />
                <span>Problem Solving Pacing Goals</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Weekly Target */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.92rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Weekly Sprint Target</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      <strong style={{ color: '#fff' }}>{goals.weeklyProgress}</strong> / {goals.weeklyTarget} solved
                    </span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${weeklyPct}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-cyan))',
                        borderRadius: '5px',
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                    {weeklyPct >= 100 ? '🎉 Weekly target achieved!' : `${goals.weeklyTarget - goals.weeklyProgress} more problems to reach your weekly sprint.`}
                  </span>
                </div>

                {/* Monthly Target */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.92rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Monthly Milestone</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      <strong style={{ color: '#fff' }}>{goals.monthlyProgress}</strong> / {goals.monthlyTarget} solved
                    </span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${monthlyPct}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, var(--color-easy), var(--color-cyan))',
                        borderRadius: '5px',
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                    {monthlyPct >= 100 ? '🚀 Monthly milestone reached!' : `${goals.monthlyTarget - goals.monthlyProgress} more problems to hit your monthly goal.`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Category Bar Chart */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Domain & Categorical Distribution
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Breakdown of problems solved across key Data Structures & Algorithms patterns
            </p>

            <div style={{ width: '100%', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    angle={-20} 
                    textAnchor="end" 
                    dy={5}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip content={<CategoryTooltip />} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
