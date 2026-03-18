import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./../styles/SignIn.css";

// API base URL - change this for production
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SignIn() {
    const navigate = useNavigate();

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
            // Validate and clean email
            const cleanEmail = email.trim().toLowerCase();

            if (!cleanEmail || !password) {
                setError('Please enter both email and password');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: cleanEmail,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Choose storage based on "Remember Me"
                const storage = rememberMe ? localStorage : sessionStorage;

                // Store authentication data
                storage.setItem("token", data.token);
                storage.setItem("userEmail", data.email);
                storage.setItem("role", data.role);
                storage.setItem("fullName", data.fullName);
                storage.setItem("isLoggedIn", "true");

                // Role-based navigation
                if (data.role === 'admin') {
                    navigate("/admin");
                } else if (data.role === 'manager') {
                    navigate("/manager");
                } else {
                    navigate("/dashboard");
                }

            } else {
                // Show error message from server
                setError(data.message || "Invalid credentials");
            }

        } catch (error) {
            console.error("Login error:", error);
            setError("Unable to connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = () => {
        navigate('/signup');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="signin-container">
            <div className="signin-box">
                <div className="signin-icon">
                    <LogIn className="icon" />
                </div>

                <h1 className="signin-title">Sign In</h1>
                <p className="signin-subtitle">Access your health insights</p>

                {/* Error Message Display */}
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
                                type={showPassword ? "text" : "password"}
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
                                onClick={togglePasswordVisibility}
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
                        {/* Removed Forgot Password - not implemented yet */}
                    </div>

                    <button
                        type="submit"
                        className="signin-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In
                                <span className="arrow">→</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="signup-section">
                    <p className="signup-text">New to Yam Hai Hum?</p>
                    <p className="signup-link-text">
                        Don't have an account?{" "}
                        <button onClick={handleSignUp} className="signup-link" disabled={loading}>
                            Sign up Here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignIn;