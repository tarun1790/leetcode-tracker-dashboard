import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Plus, Trash2, Edit2, Trophy, BarChart3, TrendingUp, Award, Calendar, CheckCircle } from 'lucide-react';

export default function ContestRatings({ contests = [], onSaveContest, onDeleteContest, defaultOpenAddModal, onDefaultOpenModalHandled }) {
  const [showModal, setShowModal] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    solvedCount: '3',
    rank: '',
    rating: '',
    date: '',
    notes: ''
  });

  const handleOpenAddModal = () => {
    setEditingContest(null);
    setFormState({
      name: '',
      solvedCount: '3',
      rank: '',
      rating: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  React.useEffect(() => {
    if (defaultOpenAddModal) {
      handleOpenAddModal();
      onDefaultOpenModalHandled();
    }
  }, [defaultOpenAddModal]);

  const handleOpenEditModal = (contest) => {
    setEditingContest(contest);
    setFormState({
      name: contest.name || '',
      solvedCount: contest.solvedCount || '3',
      rank: contest.rank || '',
      rating: contest.rating || '',
      date: contest.date ? new Date(contest.date).toISOString().split('T')[0] : '',
      notes: contest.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this contest entry?')) {
      onDeleteContest(id);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.rank || !formState.rating) {
      alert('Name, Rank, and Rating are required.');
      return;
    }

    const payload = {
      ...formState,
      solvedCount: Number(formState.solvedCount),
      rank: Number(formState.rank),
      rating: Number(formState.rating),
      date: formState.date ? new Date(formState.date) : new Date(),
    };

    if (editingContest) {
      payload._id = editingContest._id;
      payload.id = editingContest.id;
    }

    onSaveContest(payload);
    setShowModal(false);
  };

  // Process data for charts
  const chartData = [...contests]
    .map(c => ({
      ...c,
      formattedDate: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
    .reverse();

  // Metrics
  const totalContests = contests.length;
  const peakRating = totalContests > 0 ? Math.max(...contests.map(c => c.rating)) : 1500;
  const currentRating = totalContests > 0 ? contests[0].rating : 1500;
  const bestRank = totalContests > 0 ? Math.min(...contests.map(c => c.rank)) : '—';
  const averageSolved = totalContests > 0 
    ? parseFloat((contests.reduce((sum, c) => sum + c.solvedCount, 0) / totalContests).toFixed(1))
    : 0;

  // Custom Glass Chart Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#0e111a', border: '1px solid var(--color-primary)', borderRadius: '12px', padding: '1rem', boxShadow: 'var(--shadow-lg)' }}>
          <strong style={{ color: '#fff', fontSize: '1rem', display: 'block', marginBottom: '0.4rem' }}>{data.name}</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Rating: <strong style={{ color: 'var(--color-primary-light)', fontFamily: 'var(--font-mono)' }}>{data.rating}</strong>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Global Rank: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>#{data.rank}</strong>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Solved: <strong style={{ color: 'var(--color-easy)', fontFamily: 'var(--font-mono)' }}>{data.solvedCount} / 4</strong>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="contests-container">
      {/* 1. Page Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Contest Performance & Elo Trajectory</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Track your competitive rating curve, weekly ranks, and solving consistency across official rounds
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Add Contest</span>
        </button>
      </div>

      {/* 2. Top Metrics Grid */}
      <div className="telemetry-grid">
        <div className="card telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">CURRENT RATING</span>
            <div className="telemetry-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="telemetry-body">
            <span className="telemetry-value-grand">{currentRating}</span>
            <span className="telemetry-subtext">ELO POINTS</span>
          </div>
          <div className="telemetry-footer">
            <span>Rank Tier: <strong style={{ color: '#fff' }}>{currentRating >= 1900 ? 'Guardian' : currentRating >= 1600 ? 'Knight' : 'Contender'}</strong></span>
            <span style={{ color: 'var(--color-easy)' }}>Active Contestant</span>
          </div>
        </div>

        <div className="card telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">ALL-TIME PEAK</span>
            <div className="telemetry-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-medium)' }}>
              <Trophy size={22} />
            </div>
          </div>
          <div className="telemetry-body">
            <span className="telemetry-value-grand" style={{ color: 'var(--color-medium)' }}>{peakRating}</span>
            <span className="telemetry-subtext">RECORD HIGH</span>
          </div>
          <div className="telemetry-footer">
            <span>Best Result</span>
            <span style={{ color: 'var(--text-secondary)' }}>Top 4% Worldwide</span>
          </div>
        </div>

        <div className="card telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">BEST GLOBAL RANK</span>
            <div className="telemetry-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-easy)' }}>
              <Award size={22} />
            </div>
          </div>
          <div className="telemetry-body">
            <span className="telemetry-value-grand" style={{ color: 'var(--color-easy)' }}>
              {bestRank !== '—' ? `#${bestRank}` : '—'}
            </span>
          </div>
          <div className="telemetry-footer">
            <span>Contests Tracked: <strong style={{ color: '#fff' }}>{totalContests}</strong></span>
            <span style={{ color: 'var(--text-secondary)' }}>Live Standings</span>
          </div>
        </div>

        <div className="card telemetry-card">
          <div className="telemetry-header">
            <span className="telemetry-label">AVG SOLVED / 4</span>
            <div className="telemetry-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--color-cyan)' }}>
              <BarChart3 size={22} />
            </div>
          </div>
          <div className="telemetry-body">
            <span className="telemetry-value-grand" style={{ color: 'var(--color-cyan)' }}>{averageSolved}</span>
            <span className="telemetry-subtext">OUT OF 4</span>
          </div>
          <div className="telemetry-footer">
            <span>Accuracy Rate: <strong style={{ color: '#fff' }}>{Math.round((averageSolved / 4) * 100)}%</strong></span>
            <span style={{ color: 'var(--color-easy)' }}>Strong Q1-Q3 Velocity</span>
          </div>
        </div>
      </div>

      {/* 3. Grand Contest Rating Curve Chart */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Rating Progression Timeline</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Historical Elo rating trajectory with Knight (1600) and Guardian (1900) target milestones
            </p>
          </div>
        </div>

        <div style={{ width: '100%', height: '360px' }}>
          {chartData.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No contest data logged yet. Click "Add Contest" above to plot your rating curve.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="grandRatingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.65}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  dy={10} 
                />
                <YAxis 
                  domain={['dataMin - 100', 'dataMax + 100']} 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  dx={-5} 
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={1600} stroke="rgba(245, 158, 11, 0.5)" strokeDasharray="4 4" label={{ value: 'Knight (1600)', fill: 'var(--color-medium)', fontSize: 11, position: 'insideTopLeft' }} />
                <ReferenceLine y={1900} stroke="rgba(244, 63, 94, 0.5)" strokeDasharray="4 4" label={{ value: 'Guardian (1900)', fill: 'var(--color-hard)', fontSize: 11, position: 'insideTopLeft' }} />
                <Area 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#grandRatingGradient)" 
                  dot={{ r: 4, fill: '#fff', stroke: 'var(--color-primary)', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#fff', stroke: 'var(--color-primary)', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Grand Contest History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Contest Results Ledger</h3>
        </div>
        
        {contests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
            <Trophy size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No contest history logged yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="grand-table">
              <thead>
                <tr>
                  <th>Contest Name</th>
                  <th>Solved Count</th>
                  <th>Global Rank</th>
                  <th>Elo Rating</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((c) => {
                  const id = c._id || c.id;
                  return (
                    <tr key={id} className="table-row-hover">
                      <td>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{c.name}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', color: c.solvedCount >= 3 ? 'var(--color-easy)' : 'var(--color-medium)', fontWeight: 700 }}>
                          {c.solvedCount} / 4
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>#{c.rank}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                          {c.rating}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {c.date ? new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.notes || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditModal(c)}
                            title="Edit Entry"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDelete(id)}
                            title="Delete Entry"
                            style={{ color: 'var(--color-hard)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-grand" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {editingContest ? 'Edit Contest Record' : 'Record Contest Result'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group-grand">
                <label className="form-label-grand">Contest Name *</label>
                <input
                  type="text"
                  className="form-input-grand"
                  placeholder="e.g. Weekly Contest 392"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label-grand">Problems Solved (out of 4) *</label>
                  <select
                    className="form-input-grand"
                    value={formState.solvedCount}
                    onChange={(e) => setFormState({ ...formState, solvedCount: e.target.value })}
                  >
                    <option value="0">0 Solved</option>
                    <option value="1">1 Solved</option>
                    <option value="2">2 Solved</option>
                    <option value="3">3 Solved</option>
                    <option value="4">4 Solved (Full Clear!)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label-grand">Global Rank *</label>
                  <input
                    type="number"
                    className="form-input-grand"
                    placeholder="e.g. 840"
                    value={formState.rank}
                    onChange={(e) => setFormState({ ...formState, rank: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label-grand">New Elo Rating *</label>
                  <input
                    type="number"
                    className="form-input-grand"
                    placeholder="e.g. 1750"
                    value={formState.rating}
                    onChange={(e) => setFormState({ ...formState, rating: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label-grand">Contest Date</label>
                  <input
                    type="date"
                    className="form-input-grand"
                    value={formState.date}
                    onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-grand">
                <label className="form-label-grand">Post-Contest Review / Notes</label>
                <textarea
                  className="form-input-grand"
                  rows={3}
                  placeholder="Record your takeaways, mistakes on Q2/Q3, or penalty insights..."
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingContest ? 'Save Record' : 'Log Contest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
