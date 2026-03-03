import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Ghost, BrainCircuit } from 'lucide-react';
import { login, register, guestLogin } from '../api';

const Auth = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = isLogin ? await login(formData) : await register(formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onAuthSuccess(data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = async () => {
        setLoading(true);
        try {
            const data = await guestLogin();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onAuthSuccess(data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Guest login failed');
        } finally {
            setLoading(false);
        }
    };

    const inputWrapperStyle = {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
    };

    const inputIconStyle = {
        position: 'absolute',
        left: '1rem',
        color: 'var(--text-muted)'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.8rem',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.4rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
            padding: '1rem'
        }}>
            <div className="card glass-card" style={{ width: '100%', maxWidth: '360px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'var(--bg-tertiary)', border: '1px solid var(--accent-primary)',
                        marginBottom: '0.5rem',
                        boxShadow: '0 0 15px rgba(62, 207, 142, 0.1)'
                    }}>
                        <BrainCircuit color="var(--accent-primary)" size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>ExpensWise</h1>
                </div>

                <div style={{
                    display: 'flex', gap: '0.25rem', background: 'var(--bg-tertiary)',
                    padding: '0.25rem', borderRadius: '8px', marginBottom: '1.25rem'
                }}>
                    <button
                        onClick={() => { setIsLogin(true); setError(''); }}
                        style={{
                            flex: 1, padding: '0.5rem', borderRadius: '6px',
                            background: isLogin ? 'var(--bg-secondary)' : 'transparent',
                            color: isLogin ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            border: isLogin ? '1px solid var(--border-color)' : '1px solid transparent',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                            boxShadow: isLogin ? 'var(--shadow-sm)' : 'none'
                        }}
                    >Login</button>
                    <button
                        onClick={() => { setIsLogin(false); setError(''); }}
                        style={{
                            flex: 1, padding: '0.5rem', borderRadius: '6px',
                            background: !isLogin ? 'var(--bg-secondary)' : 'transparent',
                            color: !isLogin ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            border: !isLogin ? '1px solid var(--border-color)' : '1px solid transparent',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                            boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none'
                        }}
                    >Register</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {!isLogin && (
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <div style={inputWrapperStyle}>
                                <User style={inputIconStyle} size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    style={inputStyle}
                                    required={!isLogin}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <div style={inputWrapperStyle}>
                            <Mail style={inputIconStyle} size={18} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                style={inputStyle}
                                required
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <div style={inputWrapperStyle}>
                            <Lock style={inputIconStyle} size={18} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={inputStyle}
                                required
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            color: '#f43f5e',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
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
                            marginTop: '0.5rem',
                            transition: 'opacity 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processing...' : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.25rem',
                    position: 'relative',
                    textAlign: 'center'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        borderTop: '1px solid var(--border-color)',
                        zIndex: 1
                    }}></div>
                    <span style={{
                        position: 'relative',
                        zIndex: 2,
                        backgroundColor: 'var(--glass-bg)',
                        padding: '0 1rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Or continue with
                    </span>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                    <button
                        onClick={handleGuest}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--border-color)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    >
                        <Ghost size={18} />
                        Explore as Guest
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
