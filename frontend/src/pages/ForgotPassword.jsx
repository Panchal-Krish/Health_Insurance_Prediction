import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './../styles/AuthPages.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function ForgotPassword() {
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const [email, setEmail] = useState(isLoggedIn && user ? user.email : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/request-password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();
            
            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-compact">
                <div className="auth-form-panel auth-full-panel">

                    {/* Branding icon */}
                    <div className="auth-page-icon">
                        <KeyRound size={28} />
                    </div>
                    
                    {!success ? (
                        <>
                            <h1 className="auth-title">Reset Password</h1>
                            <p className="auth-subtitle">
                                {isLoggedIn 
                                    ? "We'll send a password reset link to your email address."
                                    : "Enter your email and we'll send you a link to reset your password."
                                }
                            </p>

                            {error && (
                                <div className="auth-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleRequestReset} className="auth-form">
                                <div className="field">
                                    <label htmlFor="reset-email">Email Address</label>
                                    <div className="field-input">
                                        <Mail size={16} className="field-icon" />
                                        <input
                                            type="email"
                                            id="reset-email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                                            disabled={loading || (isLoggedIn && user)}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="auth-submit" disabled={loading}>
                                    {loading ? (
                                        <><span className="auth-spinner" />Sending...</>
                                    ) : (
                                        <>Send Reset Link <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="auth-status-block">
                            <div className="auth-status-icon auth-status-success">
                                <CheckCircle size={56} />
                            </div>
                            <h1 className="auth-title">Check your email</h1>
                            <p className="auth-subtitle">
                                If an account exists with that email, we've sent password reset instructions.
                            </p>
                        </div>
                    )}

                    <div className="auth-switch">
                        <button onClick={() => isLoggedIn ? navigate('/profile') : navigate('/signin')} disabled={loading} className="auth-back-link">
                            <ArrowLeft size={16} /> {isLoggedIn ? 'Back to Profile' : 'Back to Sign In'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
