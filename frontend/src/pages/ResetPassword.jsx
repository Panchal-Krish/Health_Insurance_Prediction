import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import './../styles/AuthPages.css';

const API_URL = process.env.REACT_APP_API_URL || '/api';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/signin'), 3000);
            } else {
                setError(data.message || 'Invalid or expired token.');
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
                        <ShieldCheck size={28} />
                    </div>
                    
                    {!success ? (
                        <>
                            <h1 className="auth-title">Create New Password</h1>
                            <p className="auth-subtitle">Your new password must be different from previous used passwords.</p>

                            {error && (
                                <div className="auth-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleReset} className="auth-form">
                                <div className="field">
                                    <label htmlFor="new-password">New Password</label>
                                    <div className="field-input">
                                        <Lock size={16} className="field-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="new-password"
                                            placeholder="Min 6 characters"
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

                                <div className="field">
                                    <label htmlFor="confirm-new-password">Confirm Password</label>
                                    <div className="field-input">
                                        <Lock size={16} className="field-icon" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirm-new-password"
                                            placeholder="Re-enter password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="field-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="auth-submit" disabled={loading}>
                                    {loading ? (
                                        <><span className="auth-spinner" />Resetting...</>
                                    ) : (
                                        <>Reset Password <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="auth-status-block">
                            <div className="auth-status-icon auth-status-success">
                                <CheckCircle size={56} />
                            </div>
                            <h1 className="auth-title">Password Reset!</h1>
                            <p className="auth-subtitle">
                                Your password has been successfully reset. Redirecting to sign in...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
