import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './../styles/SignIn.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function SignIn() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const cleanEmail = email.trim().toLowerCase();

            if (!cleanEmail || !password) {
                setError('Please enter both email and password');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, password })
            });

            const data = await response.json();

            if (response.ok) {
                login(data.token, data.email, data.role, data.fullName, rememberMe);

                if (data.role === 'admin') navigate('/admin');
                else if (data.role === 'manager') navigate('/manager');
                else navigate('/dashboard');

            } else {
                setError(data.message || 'Invalid credentials');
            }

        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Left - Branding Panel */}
                <div className="auth-branding">
                    <div className="brand-content">
                        <div className="brand-icon">
                            <LogIn size={32} />
                        </div>
                        <h2>Welcome Back</h2>
                        <p>Sign in to access your dashboard, track predictions, and manage your health insurance insights.</p>
                        <div className="brand-features">
                            <div className="brand-feature">
                                <span className="feature-dot" />
                                <span>Instant premium predictions</span>
                            </div>
                            <div className="brand-feature">
                                <span className="feature-dot" />
                                <span>Track your history</span>
                            </div>
                            <div className="brand-feature">
                                <span className="feature-dot" />
                                <span>24/7 help desk support</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Form Panel */}
                <div className="auth-form-panel">
                    <h1 className="auth-title">Sign In</h1>
                    <p className="auth-subtitle">Enter your credentials to continue</p>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSignIn} className="auth-form">
                        <div className="field">
                            <label htmlFor="email">Email Address</label>
                            <div className="field-input">
                                <Mail size={16} className="field-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <div className="field-input">
                                <Lock size={16} className="field-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="field-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="auth-checkbox">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                />
                                <span>Remember me</span>
                            </label>
                            <button 
                                type="button" 
                                onClick={() => navigate('/forgot-password')}
                                disabled={loading}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? (
                                <><span className="auth-spinner" />Signing in...</>
                            ) : (
                                <>Sign In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <span>Don't have an account?</span>
                        <button onClick={() => navigate('/signup')} disabled={loading}>
                            Sign up here
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
