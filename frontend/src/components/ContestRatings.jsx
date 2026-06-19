import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Plus, Trash2, Edit2, Calendar, Trophy, BarChart3, HelpCircle } from 'lucide-react';

export default function ContestRatings({ contests, onSaveContest, onDeleteContest, defaultOpenAddModal, onDefaultOpenModalHandled }) {
  const [showModal, setShowModal] = useState(false);
  const [editingContest, setEditingContest] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    solvedCount: '',
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

  // Process data for charts - sort by date ascending (chronological order)
  const chartData = [...contests]
    .map(c => ({
      ...c,
      formattedDate: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
    .reverse(); // Reverse list since API returns descending date order

  // Calculate metrics
  const totalContests = contests.length;
  const peakRating = totalContests > 0 ? Math.max(...contests.map(c => c.rating)) : 1500;
  const bestRank = totalContests > 0 ? Math.min(...contests.map(c => c.rank)) : '-';
  const averageSolved = totalContests > 0 
    ? parseFloat((contests.reduce((sum, c) => sum + c.solvedCount, 0) / totalContests).toFixed(1))
    : 0;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card" style={{ padding: '0.75rem', background: '#12121e', border: '1px solid var(--color-secondary)' }}>
          <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>{data.name}</strong>
          <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Rating: <strong style={{ color: 'var(--color-secondary)' }}>{data.rating}</strong>
          </span>
          <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Rank: <strong style={{ color: '#fff' }}>#{data.rank}</strong>
          </span>
          <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Solved: <strong style={{ color: '#fff' }}>{data.solvedCount}/4</strong>
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="contests-container">
      {/* Page Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Contest Ratings</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Track and plot your progress in weekly LeetCode competitive contests
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add Contest</span>
        </button>
      </div>

      {/* Contest Metrics */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-secondary)' }}>
            <Trophy size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">PEAK RATING</span>
            <span className="stat-value">{peakRating}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-easy)' }}>
            <BarChart3 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">CONTESTS LOGGED</span>
            <span className="stat-value">{totalContests}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-medium)' }}>
            <Calendar size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">BEST RANK</span>
            <span className="stat-value">{bestRank !== '-' ? `#${bestRank}` : bestRank}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
            <HelpCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">AVG SOLVED</span>
            <span className="stat-value">{averageSolved}/4</span>
          </div>
        </div>
      </div>

      {/* Progression Chart */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem 1.25rem 0.5rem 0.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.5rem 1rem' }}>Rating Progression</h3>
        {totalContests === 0 ? (
          <div className="empty-state" style={{ height: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <BarChart3 size={40} />
            <p>Log a contest to view rating progression chart</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="var(--text-muted)" 
                  fontSize={12}
                  tickLine={false} 
                />
                <YAxis 
                  domain={['dataMin - 100', 'dataMax + 100']} 
                  stroke="var(--text-muted)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="var(--color-secondary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRating)" 
                  dot={{ r: 5, stroke: 'var(--color-secondary)', strokeWidth: 2, fill: 'var(--bg-primary)' }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Contests Log Table */}
      <div className="card" style={{ marginTop: '1.5rem', padding: 0, overflow: 'hidden' }}>
        <div className="flex-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Contest History</h3>
        </div>

        {contests.length === 0 ? (
          <div className="empty-state">
            <Trophy size={40} />
            <p>No contest results logged yet.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Contest</th>
                  <th>Date</th>
                  <th>Solved</th>
                  <th>Rank</th>
                  <th>Rating</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((contest) => {
                  const contestId = contest._id || contest.id;
                  return (
                    <tr key={contestId}>
                      <td style={{ fontWeight: 600 }}>{contest.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(contest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{contest.solvedCount}</strong>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}> / 4</span>
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        #{contest.rank}
                      </td>
                      <td>
                        <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
                          {contest.rating}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={contest.notes}>
                        {contest.notes || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-icon" 
                            onClick={() => handleOpenEditModal(contest)}
                            title="Edit Entry"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-icon btn-danger" 
                            onClick={() => handleDelete(contestId)}
                            title="Delete Entry"
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

      {/* Add / Edit Contest Modal Overlay */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingContest ? 'Edit Contest Record' : 'Log Contest Record'}</h3>
              <button className="btn btn-icon" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none' }}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {/* Contest Name */}
                <div className="form-group">
                  <label className="form-label">Contest Name *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="e.g. Weekly Contest 391"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>

                {/* Date */}
                <div className="form-group">
                  <label className="form-label">Contest Date</label>
                  <input
                    type="date"
                    className="input-control"
                    value={formState.date}
                    onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                  />
                </div>

                {/* Row: Solved Count and Rank */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Problems Solved</label>
                    <select
                      className="select-control"
                      value={formState.solvedCount}
                      onChange={(e) => setFormState({ ...formState, solvedCount: e.target.value })}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Global Rank *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input-control"
                      placeholder="e.g. 840"
                      value={formState.rank}
                      onChange={(e) => setFormState({ ...formState, rank: e.target.value })}
                    />
                  </div>
                </div>

                {/* New Rating */}
                <div className="form-group">
                  <label className="form-label">New Official Rating *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input-control"
                    placeholder="e.g. 1735"
                    value={formState.rating}
                    onChange={(e) => setFormState({ ...formState, rating: e.target.value })}
                  />
                </div>

                {/* Notes */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contest Review Notes</label>
                  <textarea
                    className="textarea-control"
                    placeholder="Briefly review your performance, mistakes, and solutions..."
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingContest ? 'Save Changes' : 'Log Contest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
