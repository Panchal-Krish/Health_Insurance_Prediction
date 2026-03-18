import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./../styles/SignUp.css";

// API base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SignUp() {
    const navigate = useNavigate();
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    // Password strength validation
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
        // Check if all fields are filled
        if (!formData.fullName.trim()) {
            setError('Please enter your full name');
            return false;
        }

        if (!formData.email.trim()) {
            setError('Please enter your email address');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Check password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Check password match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        // Check terms agreement
        if (!agreeTerms) {
            setError('You must agree to the terms and conditions');
            return false;
        }

        return true;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Clean and prepare data
            const cleanEmail = formData.email.trim().toLowerCase();
            const cleanName = formData.fullName.trim();

            const response = await fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: cleanName,
                    email: cleanEmail,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                setSuccess(true);
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    navigate("/signin");
                }, 2000);
            } else {
                setError(data.message || "Signup failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("Unable to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = () => {
        navigate('/signin');
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <div className="signup-icon">
                    <UserPlus className="icon" />
                </div>
                
                <h1 className="signup-title">Sign Up</h1>
                <p className="signup-subtitle">Create your health account</p>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <AlertCircle className="error-icon" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="success-message">
                        <CheckCircle className="success-icon" />
                        <span>Account created successfully! Redirecting to sign in...</span>
                    </div>
                )}

                <form onSubmit={handleSignUp}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <div className="input-wrapper">
                            <User className="input-icon" />
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                disabled={loading || success}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading || success}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Create a password (min 6 characters)"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading || success}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading || success}
                            >
                                {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div 
                                        className="strength-fill"
                                        style={{ 
                                            width: `${(passwordStrength.strength / 4) * 100}%`,
                                            backgroundColor: passwordStrength.color
                                        }}
                                    />
                                </div>
                                <span 
                                    className="strength-text"
                                    style={{ color: passwordStrength.color }}
                                >
                                    {passwordStrength.text}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading || success}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading || success}
                            >
                                {showConfirmPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
                            </button>
                        </div>
                    </div>

                    <div className="terms-section">
                        <label className="terms-checkbox">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                disabled={loading || success}
                                required
                            />
                            <span>
                                I agree to the Terms & Conditions and Privacy Policy
                            </span>
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="signup-button"
                        disabled={loading || success}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating Account...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="btn-icon" />
                                Success!
                            </>
                        ) : (
                            <>
                                Sign Up
                                <span className="arrow">→</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="signin-section">
                    <p className="signin-text">Already have an account?</p>
                    <p className="signin-link-text">
                        <button 
                            onClick={handleSignIn} 
                            className="signin-link"
                            disabled={loading}
                        >
                            Sign in here
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default SignUp;