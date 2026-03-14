import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./../styles/SignIn.css";

function SignIn() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSignIn = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {

                // Store login info
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("role", data.role);

                // Redirect
                navigate("/dashboard");

            } else {
                alert(data.message || "Invalid credentials");
            }

        } catch (error) {

            console.error("Error:", error);
            alert("Server error. Please try again later.");

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
                                required
                            />

                            <button
                                type="button"
                                className="toggle-password"
                                onClick={togglePasswordVisibility}
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
                            />

                            <span>Remember me</span>

                        </label>

                        <a href="#" className="forgot-password">Forgot password?</a>

                    </div>

                    <button type="submit" className="signin-button">
                        Sign In
                        <span className="arrow">→</span>
                    </button>

                </form>

                <div className="signup-section">

                    <p className="signup-text">New to Yam Hai Hum?</p>

                    <p className="signup-link-text">
                        Don't have an account?{" "}
                        <button onClick={handleSignUp} className="signup-link">
                            Sign up Here
                        </button>
                    </p>

                </div>

            </div>

        </div>

    );
}

export default SignIn;