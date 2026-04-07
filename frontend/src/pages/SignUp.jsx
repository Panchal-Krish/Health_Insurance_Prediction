import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./../styles/SignUp.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SignUp() {
    const navigate = useNavigate();
    const redirectTimerRef = useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        return () => {
            if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const getPasswordStrength = (password) => {
        if (password.length === 0) return { strength: 0, text: '', color: '' };
        if (password.length < 6) return { strength: 1, text: 'Too short', color: '#ef4444' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 1) return { strength: 2, text: 'Weak', color: '#f59e0b' };
        if (strength === 2) return { strength: 3, text: 'Medium', color: '#3b82f6' };
        return { strength: 4, text: 'Strong', color: '#10b981' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const validateForm = () => {
        if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
            setError('Please enter your full name (at least 2 characters)');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email address');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!agreeTerms) {
            setError('You must agree to the terms and conditions');
            return false;
        }
        return true;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                // Do not redirect automatically so they can read the message
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                {/* Left - Branding Panel */}
                <div className="auth-branding">
                    <div className="brand-content">
                        <div className="brand-icon">
                            <UserPlus size={32} />
                        </div>
                        <h2>Join Us Today</h2>
                        <p>Create your account and start making smarter insurance decisions with AI-powered predictions.</p>
                        <div className="brand-features">
                            <div className="brand-feature">
                                <span className="feature-dot" />
                                <span>Free premium estimates</span>
                            </div>
                            <div className="brand-feature">
                                <span className="feature-dot" />
                                <span>Secure & private data</span>
                            </div>
                            <div className="brand-feature">
                                <span className="feature-dot" />
                                <span>Track prediction history</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Form Panel */}
                <div className="auth-form-panel">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Fill in your details to get started</p>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="auth-success" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span><strong>Account created successfully!</strong><br />A verification link has been sent to your email address. Please verify your email before logging in.</span>
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="auth-form">
                        <div className="form-row">
                            <div className="field">
                                <label htmlFor="fullName">Full Name</label>
                                <div className="field-input">
                                    <User size={16} className="field-icon" />
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        disabled={loading || success}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label htmlFor="email">Email Address</label>
                                <div className="field-input">
                                    <Mail size={16} className="field-icon" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading || success}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="field">
                                <label htmlFor="password">Password</label>
                                <div className="field-input">
                                    <Lock size={16} className="field-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="Min 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading || success}
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
                                {formData.password && (
                                    <div className="strength-row">
                                        <div className="strength-track">
                                            <div
                                                className="strength-fill"
                                                style={{
                                                    width: `${(passwordStrength.strength / 4) * 100}%`,
                                                    backgroundColor: passwordStrength.color
                                                }}
                                            />
                                        </div>
                                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="field-input">
                                    <Lock size={16} className="field-icon" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Re-enter password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={loading || success}
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
                        </div>

                        <div className="auth-options">
                            <label className="auth-checkbox">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    disabled={loading || success}
                                />
                                <span>I agree to the Terms &amp; Conditions and Privacy Policy</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading || success}
                        >
                            {loading ? (
                                <><span className="auth-spinner" />Creating Account...</>
                            ) : success ? (
                                <><CheckCircle size={18} /> Success! Check Email.</>
                            ) : (
                                <>Create Account <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <span>Already have an account?</span>
                        <button onClick={() => navigate('/signin')} disabled={loading}>
                            Sign in here
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;