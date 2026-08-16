import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ExternalLink, ChevronDown, ChevronUp, Code2, Copy, Check, Clock, Zap, BookOpen, Layers } from 'lucide-react';

export default function ProblemsTracker({ problems = [], onSaveProblem, onDeleteProblem, defaultOpenAddModal, onDefaultOpenModalHandled }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formState, setFormState] = useState({
    title: '',
    link: '',
    difficulty: 'Easy',
    category: '',
    notes: '',
    codeSnippet: '',
    timeSpent: '',
    runtimeBeats: '',
    memoryBeats: '',
    solvedAt: ''
  });

  const handleOpenAddModal = () => {
    setEditingProblem(null);
    setFormState({
      title: '',
      link: '',
      difficulty: 'Easy',
      category: '',
      notes: '',
      codeSnippet: '',
      timeSpent: '',
      runtimeBeats: '',
      memoryBeats: '',
      solvedAt: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  React.useEffect(() => {
    if (defaultOpenAddModal) {
      handleOpenAddModal();
      onDefaultOpenModalHandled();
    }
  }, [defaultOpenAddModal]);

  const handleOpenEditModal = (e, prob) => {
    e.stopPropagation();
    setEditingProblem(prob);
    setFormState({
      title: prob.title || '',
      link: prob.link || '',
      difficulty: prob.difficulty || 'Easy',
      category: prob.category || '',
      notes: prob.notes || '',
      codeSnippet: prob.codeSnippet || '',
      timeSpent: prob.timeSpent || '',
      runtimeBeats: prob.runtimeBeats || '',
      memoryBeats: prob.memoryBeats || '',
      solvedAt: prob.solvedAt ? new Date(prob.solvedAt).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this problem log?')) {
      onDeleteProblem(id);
    }
  };

  const handleCopyCode = (e, id, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formState.title || !formState.category) {
      alert('Title and Category are required.');
      return;
    }

    const payload = {
      ...formState,
      timeSpent: formState.timeSpent ? Number(formState.timeSpent) : undefined,
      runtimeBeats: formState.runtimeBeats ? Number(formState.runtimeBeats) : undefined,
      memoryBeats: formState.memoryBeats ? Number(formState.memoryBeats) : undefined,
      solvedAt: formState.solvedAt ? new Date(formState.solvedAt) : new Date(),
    };

    if (editingProblem) {
      payload._id = editingProblem._id;
      payload.id = editingProblem.id;
    }

    onSaveProblem(payload);
    setShowModal(false);
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Filter & Search
  const filteredProblems = problems.filter(p => {
    const matchesFilter = activeFilter === 'All' || p.difficulty === activeFilter;
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="problems-container">
      {/* 1. Page Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Solved Problems Ledger</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Comprehensive catalog of algorithms, solution blueprints, and performance benchmarks
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleOpenAddModal}>
          <Plus size={18} />
          <span>Log Problem</span>
        </button>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="filter-bar-grand">
        <div className="filter-pills-group">
          {['All', 'Easy', 'Medium', 'Hard'].map(filter => {
            const count = filter === 'All' ? problems.length : problems.filter(p => p.difficulty === filter).length;
            return (
              <button
                key={filter}
                className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                <span>{filter}</span>
                <span style={{ marginLeft: '0.4rem', opacity: 0.7, fontSize: '0.8rem' }}>({count})</span>
              </button>
            );
          })}
        </div>

        <div className="search-box-grand">
          <Search size={18} className="search-box-icon" />
          <input
            type="text"
            placeholder="Search by problem title, algorithmic tag, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Grand Table Ledger */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredProblems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <Search size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Problems Found</h3>
            <p style={{ fontSize: '0.9rem' }}>No logged problems match your current search and filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="grand-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Problem Title</th>
                  <th>Difficulty</th>
                  <th>Category</th>
                  <th>Time Spent</th>
                  <th>Runtime Beats</th>
                  <th>Date Solved</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((prob) => {
                  const id = prob._id || prob.id;
                  const isExpanded = expandedRow === id;
                  return (
                    <React.Fragment key={id}>
                      <tr 
                        className="table-row-hover" 
                        onClick={() => toggleRow(id)}
                        style={{ background: isExpanded ? 'rgba(99, 102, 241, 0.08)' : undefined }}
                      >
                        <td>
                          {isExpanded ? (
                            <ChevronUp size={18} style={{ color: 'var(--color-primary)' }} />
                          ) : (
                            <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </td>
                        <td>
                          <div className="table-title-cell">
                            <span style={{ fontWeight: 700, color: '#ffffff' }}>{prob.title}</span>
                            {prob.link && (
                              <a 
                                href={prob.link} 
                                target="_blank" 
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                                title="Open in LeetCode"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge-difficulty ${prob.difficulty.toLowerCase()}`}>
                            {prob.difficulty}
                          </span>
                        </td>
                        <td>
                          <span className="tag-category">{prob.category}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {prob.timeSpent ? `${prob.timeSpent} min` : '—'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {prob.runtimeBeats ? (
                            <span style={{ color: prob.runtimeBeats >= 80 ? 'var(--color-easy)' : '#fff', fontWeight: 600 }}>
                              {prob.runtimeBeats}%
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                          {prob.solvedAt ? new Date(prob.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => handleOpenEditModal(e, prob)}
                              title="Edit Problem"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => handleDelete(e, id)}
                              title="Delete Problem"
                              style={{ color: 'var(--color-hard)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Solution & Notes Drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} style={{ padding: 0 }}>
                            <div className="expanded-drawer">
                              <div className="drawer-grid">
                                <div>
                                  <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
                                    <span>Algorithmic Notes & Approach</span>
                                  </h4>
                                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    {prob.notes ? prob.notes : <em>No written notes provided for this challenge.</em>}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      <Code2 size={16} style={{ color: 'var(--color-cyan)' }} />
                                      <span>Code Implementation</span>
                                    </h4>
                                    {prob.codeSnippet && (
                                      <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={(e) => handleCopyCode(e, id, prob.codeSnippet)}
                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                      >
                                        {copiedCodeId === id ? <Check size={12} style={{ color: 'var(--color-easy)' }} /> : <Copy size={12} />}
                                        <span>{copiedCodeId === id ? 'Copied!' : 'Copy Code'}</span>
                                      </button>
                                    )}
                                  </div>
                                  <pre className="drawer-code-block">
                                    <code>{prob.codeSnippet ? prob.codeSnippet : '// No code snippet attached.'}</code>
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Grand Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-grand" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {editingProblem ? 'Edit Problem Entry' : 'Log New Solved Problem'}
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
                <label className="form-label-grand">Problem Title *</label>
                <input
                  type="text"
                  className="form-input-grand"
                  placeholder="e.g. Longest Palindromic Substring"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label-grand">Difficulty Tier *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {['Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        type="button"
                        key={diff}
                        className={`btn btn-sm ${formState.difficulty === diff ? `badge-difficulty ${diff.toLowerCase()}` : 'btn-secondary'}`}
                        onClick={() => setFormState({ ...formState, difficulty: diff })}
                        style={{ height: '42px', fontWeight: 700 }}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label-grand">Algorithmic Category *</label>
                  <input
                    type="text"
                    className="form-input-grand"
                    placeholder="e.g. Dynamic Programming, Trees"
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group-grand">
                <label className="form-label-grand">LeetCode URL</label>
                <input
                  type="url"
                  className="form-input-grand"
                  placeholder="https://leetcode.com/problems/..."
                  value={formState.link}
                  onChange={(e) => setFormState({ ...formState, link: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label-grand">Time (Min)</label>
                  <input
                    type="number"
                    className="form-input-grand"
                    placeholder="e.g. 25"
                    value={formState.timeSpent}
                    onChange={(e) => setFormState({ ...formState, timeSpent: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-grand">Runtime Beats (%)</label>
                  <input
                    type="number"
                    className="form-input-grand"
                    placeholder="e.g. 92.5"
                    value={formState.runtimeBeats}
                    onChange={(e) => setFormState({ ...formState, runtimeBeats: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label-grand">Date Solved</label>
                  <input
                    type="date"
                    className="form-input-grand"
                    value={formState.solvedAt}
                    onChange={(e) => setFormState({ ...formState, solvedAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-grand">
                <label className="form-label-grand">Notes / Conceptual Takeaway</label>
                <textarea
                  className="form-input-grand"
                  rows={3}
                  placeholder="Summarize your key logic, edge cases, and time/space complexity..."
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                />
              </div>

              <div className="form-group-grand">
                <label className="form-label-grand">Solution Code Snippet</label>
                <textarea
                  className="form-input-grand"
                  rows={5}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                  placeholder="Paste your clean solution code here..."
                  value={formState.codeSnippet}
                  onChange={(e) => setFormState({ ...formState, codeSnippet: e.target.value })}
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
                  {editingProblem ? 'Save Changes' : 'Create Problem Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
