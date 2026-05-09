import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Ghost, BrainCircuit } from 'lucide-react';
import { login, register, guestLogin } from '../api';

// Paced for Render free-tier cold starts (~30-60s)
const TRANSITION_STEPS = [
    { text: 'Connecting to server...', duration: 3000 },
    { text: 'Waking up the backend...', duration: 5000 },
    { text: 'Authenticating your account...', duration: 4000 },
    { text: 'Setting up your workspace...', duration: 5000 },
    { text: 'Loading your financial data...', duration: 5000 },
    { text: 'Preparing your dashboard...', duration: 4000 },
    { text: 'Hang tight, almost there...', duration: 6000 },
    { text: 'Just a few more seconds...', duration: 8000 },
];

const Auth = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTransition, setShowTransition] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Step through the loading messages (keeps cycling until API responds)
    useEffect(() => {
        if (!showTransition) return;
        // If we've exhausted all steps, stay on the last one (spinner keeps spinning)
        if (currentStep >= TRANSITION_STEPS.length) return;
        const timer = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
        }, TRANSITION_STEPS[currentStep].duration);
        return () => clearTimeout(timer);
    }, [showTransition, currentStep]);

    const startTransition = () => {
        setShowTransition(true);
        setCurrentStep(0);
    };

    // As soon as the API responds, proceed immediately to dashboard
    const handleApiSuccess = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.user);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        startTransition();

        try {
            const data = isLogin ? await login(formData) : await register(formData);
            handleApiSuccess(data);
        } catch (err) {
            setShowTransition(false);
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = async () => {
        setLoading(true);
        startTransition();
        try {
            const data = await guestLogin();
            handleApiSuccess(data);
        } catch (err) {
            setShowTransition(false);
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

    // Fullscreen transition loading screen
    if (showTransition) {
        const displayStep = Math.min(currentStep, TRANSITION_STEPS.length - 1);
        const progress = Math.min(((currentStep) / TRANSITION_STEPS.length) * 100, 95);
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'var(--bg-primary)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '2.5rem'
            }}>
                {/* Pulsing Logo */}
                <div style={{
                    width: 72, height: 72, borderRadius: 18,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(62, 207, 142, 0.2)',
                    animation: 'authPulse 2s ease-in-out infinite'
                }}>
                    <BrainCircuit color="var(--accent-primary)" size={36} />
                </div>

                <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                    ExpensWise
                </h2>

                {/* Current status */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    animation: 'authFadeIn 0.4s ease-out',
                    key: displayStep
                }}>
                    <div style={{
                        width: 18, height: 18,
                        border: '2.5px solid var(--accent-primary)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    <span key={displayStep} style={{
                        fontSize: '0.9rem', fontWeight: 500,
                        color: 'var(--text-primary)',
                        animation: 'authFadeIn 0.4s ease-out'
                    }}>
                        {TRANSITION_STEPS[displayStep].text}
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{
                    width: '280px', height: 4,
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 2, overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%', width: `${progress}%`,
                        backgroundColor: 'var(--accent-primary)',
                        borderRadius: 2,
                        transition: 'width 1s ease'
                    }} />
                </div>

                {/* Free tier hint (shows after ~10s) */}
                {currentStep >= 2 && (
                    <p style={{
                        fontSize: '0.75rem', color: 'var(--text-secondary)',
                        margin: 0, fontStyle: 'italic',
                        animation: 'authFadeIn 0.5s ease-out',
                        textAlign: 'center', maxWidth: '280px'
                    }}>
                        Our server is on a free tier and may take a moment to wake up. Thanks for your patience!
                    </p>
                )}

                <style>{`
                    @keyframes authPulse {
                        0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(62,207,142,0.15); }
                        50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(62,207,142,0.3); }
                    }
                    @keyframes authFadeIn {
                        from { opacity: 0; transform: translateY(8px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

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
