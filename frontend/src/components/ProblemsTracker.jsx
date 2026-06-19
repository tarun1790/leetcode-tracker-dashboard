import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ExternalLink, ChevronDown, ChevronUp, Code, MessageSquare, Clock, Zap } from 'lucide-react';

export default function ProblemsTracker({ problems, onSaveProblem, onDeleteProblem, defaultOpenAddModal, onDefaultOpenModalHandled }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);
  
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
    e.stopPropagation(); // Prevent expanding the row when clicking edit
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
    e.stopPropagation(); // Prevent expanding row
    if (window.confirm('Are you sure you want to delete this problem?')) {
      onDeleteProblem(id);
    }
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

  // Filtering and Searching
  const filteredProblems = problems.filter(p => {
    const matchesFilter = activeFilter === 'All' || p.difficulty === activeFilter;
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="problems-container">
      {/* Page Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Solved Problems</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Log and review your solved LeetCode challenges
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add Problem</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex-between" style={{ gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="filter-tabs">
          {['All', 'Easy', 'Medium', 'Hard'].map(filter => (
            <button
              key={filter}
              className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search title, tags, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Problems Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredProblems.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <p>No solved problems match your criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Problem</th>
                  <th>Difficulty</th>
                  <th>Category</th>
                  <th>Time Spent</th>
                  <th>Beats %</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((prob) => {
                  const probId = prob._id || prob.id;
                  const isExpanded = expandedRow === probId;
                  
                  return (
                    <React.Fragment key={probId}>
                      <tr 
                        className="table-row-expandable" 
                        onClick={() => toggleRow(probId)}
                        style={{ borderBottom: isExpanded ? 'none' : '1px solid var(--card-border)' }}
                      >
                        <td>
                          {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {prob.link ? (
                              <a 
                                href={prob.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-link"
                                onClick={(e) => e.stopPropagation()} // Stop row toggle when clicking link
                              >
                                {prob.title}
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <strong style={{ color: 'var(--text-primary)' }}>{prob.title}</strong>
                            )}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Solved {new Date(prob.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                            {prob.difficulty}
                          </span>
                        </td>
                        <td>
                          <span style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {prob.category}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                            <Clock size={14} className="text-muted" />
                            {prob.timeSpent ? `${prob.timeSpent} mins` : '-'}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-easy)', fontWeight: 600 }}>
                            {prob.runtimeBeats ? (
                              <>
                                <Zap size={14} />
                                {prob.runtimeBeats}%
                              </>
                            ) : '-'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-icon" 
                              onClick={(e) => handleOpenEditModal(e, prob)}
                              title="Edit Problem"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              className="btn btn-icon btn-danger" 
                              onClick={(e) => handleDelete(e, probId)}
                              title="Delete Problem"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Notes and Code section */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" style={{ padding: 0 }}>
                            <div className="expanded-row-content">
                              <div className="expanded-grid">
                                <div>
                                  <h4 className="expanded-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.4rem' }}>
                                    <MessageSquare size={14} />
                                    <span>Solving Notes</span>
                                  </h4>
                                  <div className="expanded-notes">
                                    {prob.notes ? prob.notes : <span className="text-muted" style={{ fontStyle: 'italic' }}>No notes provided for this problem.</span>}
                                  </div>
                                  
                                  {/* Beats details */}
                                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem' }}>
                                    <div>
                                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>RUNTIME BEATS</span>
                                      <strong style={{ fontSize: '1rem', color: 'var(--color-easy)' }}>{prob.runtimeBeats ? `${prob.runtimeBeats}%` : '-'}</strong>
                                    </div>
                                    <div>
                                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>MEMORY BEATS</span>
                                      <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>{prob.memoryBeats ? `${prob.memoryBeats}%` : '-'}</strong>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="expanded-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.4rem' }}>
                                    <Code size={14} />
                                    <span>Code Solution</span>
                                  </h4>
                                  {prob.codeSnippet ? (
                                    <pre className="code-block">
                                      <code>{prob.codeSnippet}</code>
                                    </pre>
                                  ) : (
                                    <div className="expanded-notes text-muted" style={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
                                      No code snippet uploaded.
                                    </div>
                                  )}
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

      {/* Add / Edit Modal Overlay */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProblem ? 'Edit Solved Problem' : 'Log Solved Problem'}</h3>
              <button className="btn btn-icon" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none' }}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Problem Title *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
                    placeholder="e.g. Two Sum"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  />
                </div>

                {/* Link */}
                <div className="form-group">
                  <label className="form-label">LeetCode Link</label>
                  <input
                    type="url"
                    className="input-control"
                    placeholder="e.g. https://leetcode.com/problems/two-sum/"
                    value={formState.link}
                    onChange={(e) => setFormState({ ...formState, link: e.target.value })}
                  />
                </div>

                {/* Row: Difficulty and Category */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select
                      className="select-control"
                      value={formState.difficulty}
                      onChange={(e) => setFormState({ ...formState, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input
                      type="text"
                      required
                      className="input-control"
                      placeholder="e.g. Arrays, Trees, Dynamic Programming"
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row: Stats */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Time Spent (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      className="input-control"
                      placeholder="e.g. 25"
                      value={formState.timeSpent}
                      onChange={(e) => setFormState({ ...formState, timeSpent: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Solved</label>
                    <input
                      type="date"
                      className="input-control"
                      value={formState.solvedAt}
                      onChange={(e) => setFormState({ ...formState, solvedAt: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row: Beats */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Runtime Beats (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="input-control"
                      placeholder="e.g. 94.2"
                      value={formState.runtimeBeats}
                      onChange={(e) => setFormState({ ...formState, runtimeBeats: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Memory Beats (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="input-control"
                      placeholder="e.g. 88.5"
                      value={formState.memoryBeats}
                      onChange={(e) => setFormState({ ...formState, memoryBeats: e.target.value })}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">Solving Notes</label>
                  <textarea
                    className="textarea-control"
                    placeholder="Describe your approach, complexity analysis O(N), or edge cases..."
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  />
                </div>

                {/* Code Snippet */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Code Solution</label>
                  <textarea
                    className="textarea-control code"
                    placeholder="function solve() { ... }"
                    value={formState.codeSnippet}
                    onChange={(e) => setFormState({ ...formState, codeSnippet: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProblem ? 'Save Changes' : 'Log Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
