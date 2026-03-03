import React, { useState, useEffect } from 'react';
import { Target, Plus, History, Trash2, Calendar, IndianRupee } from 'lucide-react';
import { logIncome, getIncomes, deleteIncome } from '../api';

const Budgets = ({ user }) => {
    const [incomes, setIncomes] = useState([]);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            const data = await getIncomes();
            setIncomes(data);
        } catch (error) {
            console.error('Error fetching incomes:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        setLoading(true);
        try {
            await logIncome({ amount: parseFloat(amount), transactionDate: date });
            setAmount('');
            fetchIncomes();
        } catch (error) {
            console.error('Error adding budget:', error);
        } finally {
            setLoading(true);
            setTimeout(() => setLoading(false), 500); // UI feedback
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteIncome(id);
            setIncomes(incomes.filter(i => i.id !== id));
        } catch (error) {
            console.error('Error deleting income:', error);
        }
    };

    const totalBudget = incomes.reduce((sum, item) => sum + item.amount, 0);

    const inputWrapperStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        minWidth: '200px'
    };

    const inputIconStyle = {
        position: 'absolute',
        left: '1rem',
        color: 'var(--text-muted)'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.85rem 1rem 0.85rem 3rem',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header & Total */}
            <div className="card glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={24} color="var(--accent-primary)" />
                        Budgets & Income
                    </h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Track your budget additions for the month
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', fontWeight: 600 }}>Total Budget</span>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        ₹{totalBudget.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Add Budget Form */}
            <div className="card">
                <h3 className="card-title">Add to Budget</h3>
                <form onSubmit={handleAddBudget} style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    alignItems: 'flex-end',
                    marginTop: '1.5rem'
                }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Amount</label>
                        <div style={inputWrapperStyle}>
                            <IndianRupee style={inputIconStyle} size={18} />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="5,000"
                                style={inputStyle}
                                required
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Addition Date</label>
                        <div style={inputWrapperStyle}>
                            <Calendar style={inputIconStyle} size={18} />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={inputStyle}
                                required
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.85rem 2rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--bg-primary)',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'opacity 0.2s',
                            opacity: loading ? 0.7 : 1,
                            minWidth: '200px'
                        }}
                    >
                        {loading ? 'Adding...' : (
                            <>
                                <Plus size={18} />
                                Add Budget
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Addition History Table */}
            <div className="card glass-card">
                <div className="card-title">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        <History size={20} color="var(--accent-primary)" />
                        Addition History
                    </span>
                </div>

                {fetching ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Loading history...
                    </div>
                ) : incomes.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No budget additions recorded yet.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', width: '80px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.map((income) => (
                                    <tr key={income.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {new Date(income.transactionDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                                            {income.description || 'Budget Addition'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--accent-primary)', fontSize: '1rem', fontWeight: 'bold', textAlign: 'right' }}>
                                            ₹{income.amount.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDelete(income.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                title="Delete this addition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Budgets;
