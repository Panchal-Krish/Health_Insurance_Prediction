import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './../styles/SignIn.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function SignIn() {
    const navigate = useNavigate();
    const { login } = useAuth();   // ← replaces manual storage writes + authChange event

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
                // login() saves to storage AND updates context in one call
                // no more manual setItem or window.dispatchEvent needed
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
        <div className="signin-container">
            <div className="signin-box">
                <div className="signin-icon">
                    <LogIn className="icon" />
                </div>

                <h1 className="signin-title">Sign In</h1>
                <p className="signin-subtitle">Access your health insights</p>

                {error && (
                    <div className="error-message">
                        <AlertCircle className="error-icon" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSignIn}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
                            </button>
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={loading}
                            />
                            <span>Remember me</span>
                        </label>
                    </div>

                    <button type="submit" className="signin-button" disabled={loading}>
                        {loading ? (
                            <><span className="spinner"></span>Signing In...</>
                        ) : (
                            <>Sign In<span className="arrow">→</span></>
                        )}
                    </button>
                </form>

                <div className="signup-section">
                    <p className="signup-link-text">
                        Don't have an account?{' '}
                        <button onClick={() => navigate('/signup')} className="signup-link" disabled={loading}>
                            Sign up here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignIn;