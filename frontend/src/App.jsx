import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FileUp,
  Download,
  TrendingDown,
  Target,
  CircleDollarSign,
  Send,
  X,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  BrainCircuit,
  Trash2,
  Pencil,
  Check,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDashboardAnalytics,
  sendChatMessage,
  getHistory,
  deleteExpense,
  updateExpense
} from './api';
import './App.css';

function App() {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hey there! How can I help you manage your expenses today?' }
  ]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', description: '', categoryType: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonthDetail, setSelectedMonthDetail] = useState(null);
  const [isLeftRetracted, setIsLeftRetracted] = useState(false);
  const [isRightRetracted, setIsRightRetracted] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const m = now.getUTCMonth() + 1;
      const y = now.getUTCFullYear();
      const [analyticsData, historyData] = await Promise.all([
        getDashboardAnalytics(m, y),
        getHistory()
      ]);
      setAnalytics(analyticsData);
      setHistory(historyData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', text: chatMessage };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage('');

    try {
      const response = await sendChatMessage(chatMessage);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: response.message,
        isAI: response.isAI
      }]);
      // Refresh data in case something was added
      fetchData();
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteExpense(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const startEditing = (exp) => {
    setEditingId(exp.id);
    setEditForm({
      amount: exp.amount,
      description: exp.description,
      categoryType: exp.categoryType
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateExpense(id, editForm);
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrainCircuit className="animate-pulse" color="#3ecf8e" size={48} />
      </div>
    );
  }

  const budgetProgress = (analytics && analytics.budget.total > 0) ? (analytics.totalSpent / analytics.budget.total) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (Math.min(budgetProgress, 100) / 100) * circumference;

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className={`sidebar ${isLeftRetracted ? 'retracted' : ''}`} onClick={() => isLeftRetracted && setIsLeftRetracted(false)}>
        <button className="retract-btn" onClick={(e) => { e.stopPropagation(); setIsLeftRetracted(!isLeftRetracted); }}>
          {isLeftRetracted ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
        <div className="logo">
          <BrainCircuit size={28} />
          <span>ExpensWise</span>
        </div>

        <nav className="nav-links">
          <a
            href="#"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); setSelectedMonthDetail(null); }}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </a>
          <a
            href="#"
            className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab('transactions'); }}
            title="Transactions"
          >
            <CreditCard size={20} />
            <span>Transactions</span>
          </a>
          <a href="#" className="nav-item" title="Budgets" onClick={(e) => { e.preventDefault(); alert("To be added soon!"); }}>
            <Target size={20} />
            <span>Budgets (Soon)</span>
          </a>
          <a href="#" className="nav-item" title="Import" onClick={(e) => { e.preventDefault(); alert("To be added soon!"); }}>
            <FileUp size={20} />
            <span>Import (Soon)</span>
          </a>
        </nav>

        {/* History Section */}
        <div className="history-section" style={{ marginTop: '2rem', padding: '0 0.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Past 6 Months</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.slice(1).map((item, idx) => (
              <div key={idx} className="history-item card" style={{ padding: '0.75rem', border: 'none', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.monthName} {item.year}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>₹{item.total}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                  <div style={{ flex: item.needs || 1, backgroundColor: 'var(--accent-primary)', borderRadius: '2px' }}></div>
                  <div style={{ flex: item.wants || 1, backgroundColor: '#818cf8', borderRadius: '2px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  <span>N: ₹{item.needs}</span>
                  <span>W: ₹{item.wants}</span>
                </div>
              </div>
            ))}
            {history.length <= 1 && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No historical data yet.</p>}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isLeftRetracted ? 'left-retracted' : ''} ${isRightRetracted ? 'right-retracted' : ''}`}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Overview</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Welcome back to your financial control center.
              {analytics && (
                <span style={{ marginLeft: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  — {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][analytics.month - 1]} {analytics.year}
                </span>
              )}
            </p>
          </div>
          <button className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', color: 'white' }}>
            <Download size={18} />
            Export CSV
          </button>
        </header>

        {activeTab === 'dashboard' ? (
          <>
            <div className="grid">
              {/* Budget Progress Card */}
              <div className="card">
                <div className="card-title">
                  MONTHLY BUDGET
                  <CircleDollarSign size={16} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div className="progress-container">
                    <svg className="progress-svg" width="120" height="120">
                      <circle className="progress-bg" cx="60" cy="60" r="45" />
                      <circle
                        className="progress-fill"
                        cx="60" cy="60" r="45"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                      />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{Math.round(budgetProgress)}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="card-value">₹{analytics.budget.remaining}</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Remaining from ₹{analytics.budget.total}</p>
                  </div>
                </div>
              </div>

              {/* Total Spent Card */}
              <div className="card">
                <div className="card-title">
                  TOTAL SPENT
                  {analytics.comparison?.trend === 'down' ? (
                    <TrendingDown size={16} color="#10b981" />
                  ) : analytics.comparison?.trend === 'up' ? (
                    <TrendingUp size={16} color="#f43f5e" />
                  ) : null}
                </div>
                <div className="card-value">₹{analytics.totalSpent}</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  color: analytics.comparison?.trend === 'down' ? '#10b981' : (analytics.comparison?.trend === 'up' ? '#f43f5e' : 'var(--text-secondary)'),
                  fontSize: '0.875rem'
                }}>
                  {analytics.comparison?.trend === 'down' ? <TrendingDown size={14} /> : (analytics.comparison?.trend === 'up' ? <TrendingUp size={14} /> : null)}
                  <span>
                    {analytics.comparison?.trend === 'stable' || !analytics.comparison
                      ? 'On track'
                      : `${analytics.comparison.trend === 'down' ? '+' : '-'}₹${analytics.comparison.diffAmount}`}
                  </span>
                </div>
              </div>

              {/* Needs vs Wants Card */}
              <div className="card">
                <div className="card-title">
                  NEEDS VS WANTS
                  <BrainCircuit size={16} />
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ height: 12, backgroundColor: 'var(--bg-tertiary)', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
                    <div
                      style={{
                        width: `${(analytics.categoryBreakdown.needs / (analytics.totalSpent || 1)) * 100}%`,
                        height: '100%',
                        backgroundColor: 'var(--accent-primary)',
                        transition: 'width 0.5s ease'
                      }}
                    />
                    <div
                      style={{
                        width: `${(analytics.categoryBreakdown.wants / (analytics.totalSpent || 1)) * 100}%`,
                        height: '100%',
                        backgroundColor: '#818cf8',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }}></div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Needs: ₹{analytics.categoryBreakdown.needs}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#818cf8' }}></div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Wants: ₹{analytics.categoryBreakdown.wants}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <section style={{ marginTop: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Transactions</h2>
                <button
                  className={`card glass-card ${isEditMode ? 'active' : ''}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: isEditMode ? 'var(--accent-primary)' : 'var(--border-color)', color: 'white' }}
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setEditingId(null);
                  }}
                >
                  <Pencil size={14} />
                  {isEditMode ? 'Done' : 'Edit'}
                </button>
              </div>
              <div className="transactions-container">
                <table className="expense-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>S.No.</th>
                      <th style={{ width: '120px' }}>Date</th>
                      <th>Details</th>
                      <th style={{ width: '120px' }}>Expense</th>
                      <th style={{ width: '120px' }}>Type</th>
                      {isEditMode && <th style={{ width: '100px' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentTransactions && analytics.recentTransactions.length > 0 ? (
                      analytics.recentTransactions.map((exp, index) => (
                        <tr key={exp.id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">
                            {new Date(exp.transactionDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </td>
                          <td className="text-left">
                            {editingId === exp.id ? (
                              <input
                                className="inline-edit-input"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              />
                            ) : exp.description}
                          </td>
                          <td className="text-right">
                            {editingId === exp.id ? (
                              <input
                                type="number"
                                className="inline-edit-input text-right"
                                value={editForm.amount}
                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                              />
                            ) : `₹${exp.amount}`}
                          </td>
                          <td className="text-center" style={{ textTransform: 'capitalize' }}>
                            {editingId === exp.id ? (
                              <select
                                className="inline-edit-input"
                                value={editForm.categoryType}
                                onChange={(e) => setEditForm({ ...editForm, categoryType: e.target.value })}
                              >
                                <option value="need">Need</option>
                                <option value="want">Want</option>
                              </select>
                            ) : exp.categoryType}
                          </td>
                          {isEditMode && (
                            <td className="text-center">
                              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                {editingId === exp.id ? (
                                  <button onClick={() => handleSaveEdit(exp.id)} className="action-btn save">
                                    <Check size={16} />
                                  </button>
                                ) : (
                                  <button onClick={() => startEditing(exp)} className="action-btn edit">
                                    <Pencil size={16} />
                                  </button>
                                )}
                                <button onClick={() => handleDelete(exp.id)} className="action-btn delete">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isEditMode ? 6 : 5} className="text-center" style={{ padding: '2rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          No transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section style={{ marginTop: '1rem' }}>
            <AnimatePresence mode="wait">
              {!selectedMonthDetail ? (
                <motion.div
                  key="month-list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Monthly Transactions Archive</h2>
                  <div className="grid">
                    {history.map((item, idx) => (
                      <div
                        key={idx}
                        className="card glass-card hover-card"
                        style={{ cursor: 'pointer', padding: '1.5rem' }}
                        onClick={async () => {
                          try {
                            setLoading(true);
                            const monthData = await getDashboardAnalytics(item.month, item.year);
                            setSelectedMonthDetail({ ...item, expenses: monthData.expenses });
                            setLoading(false);
                          } catch (error) {
                            console.error('Error fetching month detail:', error);
                            setLoading(false);
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{item.monthName} {item.year}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Total Spent: ₹{item.total}</p>
                          </div>
                          <ChevronRight size={24} color="var(--accent-primary)" />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ flex: (item.needs || 0) + 1, backgroundColor: 'var(--accent-primary)' }}></div>
                          <div style={{ flex: (item.wants || 0) + 1, backgroundColor: '#818cf8', opacity: 0.8 }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span>Needs: ₹{item.needs}</span>
                          <span>Wants: ₹{item.wants}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="month-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                      className="card glass-card"
                      style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}
                      onClick={() => setSelectedMonthDetail(null)}
                    >
                      <X size={20} />
                    </button>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{selectedMonthDetail.monthName} {selectedMonthDetail.year}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Viewing all transactions for this month</p>
                    </div>
                  </div>

                  <div className="transactions-container card glass-card" style={{ padding: 0 }}>
                    <table className="expense-table" style={{ border: 'none' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>S.No.</th>
                          <th style={{ width: '120px' }}>Date</th>
                          <th>Details</th>
                          <th style={{ width: '120px' }}>Expense</th>
                          <th style={{ width: '120px' }}>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMonthDetail.expenses && selectedMonthDetail.expenses.length > 0 ? (
                          selectedMonthDetail.expenses.map((exp, index) => (
                            <tr key={exp.id}>
                              <td className="text-center">{index + 1}</td>
                              <td className="text-center">
                                {new Date(exp.transactionDate).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit'
                                })}
                              </td>
                              <td className="text-left">{exp.description}</td>
                              <td className="text-right">₹{exp.amount}</td>
                              <td className="text-center" style={{ textTransform: 'capitalize' }}>
                                <span className={`badge ${exp.categoryType}`}>
                                  {exp.categoryType}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center" style={{ padding: '4rem', color: 'var(--text-secondary)' }}>
                              No transactions recorded for this month.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </main>

      {/* Right Sidebar (Assistant) */}
      <aside className={`right-sidebar ${isRightRetracted ? 'retracted' : ''}`} onClick={() => isRightRetracted && setIsRightRetracted(false)}>
        <button className="right-retract-btn" onClick={(e) => { e.stopPropagation(); setIsRightRetracted(!isRightRetracted); }}>
          {isRightRetracted ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
        </button>

        {isRightRetracted && (
          <div className="retracted-label">Assistant</div>
        )}

        <div className="chat-widget">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit size={18} color="#3ecf8e" />
              <span>Assistant</span>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`} style={{ position: 'relative' }}>
                {m.role === 'ai' && m.isAI && (
                  <div style={{ position: 'absolute', top: -8, left: -4, backgroundColor: 'var(--bg-primary)', borderRadius: '50%', padding: '2px', border: '1px solid var(--border-glow)' }}>
                    <BrainCircuit size={10} color="#3ecf8e" />
                  </div>
                )}
                {m.text}
                {m.role === 'ai' && m.isAI && (
                  <div style={{ fontSize: '0.6rem', color: '#3ecf8e', marginTop: '4px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <TrendingUp size={8} /> AI Powered
                  </div>
                )}
              </div>
            ))}
          </div>

          <form className="chat-input-container" onSubmit={handleSendChat}>
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Tell me what you spent..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button type="submit" className="send-btn">
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  );
}

export default App;
