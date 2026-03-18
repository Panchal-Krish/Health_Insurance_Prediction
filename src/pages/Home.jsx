import React from 'react';
import { Sparkles, ArrowRight, Award, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './../styles/Home.css';

function Home() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();  // single read, consistent across the render

    const handleGetPrediction = () => {
        navigate(isLoggedIn ? '/predict' : '/signup');
    };

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <h1>
                    Predict Your <br />
                    <span>Health Insurance Premium</span>
                </h1>

                <p>
                    Get instant insurance premium estimates based on your health profile.
                    Make informed decisions about your healthcare coverage.
                </p>

                <div className="buttons">
                    <button className="primary" onClick={handleGetPrediction}>
                        <Sparkles className="btn-icon" />
                        {isLoggedIn ? 'Calculate Premium' : 'Get Started Free'}
                        <ArrowRight className="btn-icon" />
                    </button>
                    <button className="secondary" onClick={() => navigate('/contact')}>
                        Contact Us
                        <ArrowRight className="btn-icon" />
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className="trust-section">
                <div className="trust-container">
                    <h2 className="trust-title">Why Use Our Premium Calculator?</h2>
                    <p className="trust-subtitle">
                        Fast, accurate insurance premium estimates tailored to your profile
                    </p>

                    <div className="trust-cards">
                        <div className="trust-card">
                            <div className="trust-icon">
                                <TrendingUp className="icon" />
                            </div>
                            <h3 className="trust-card-title">Data-Driven Estimates</h3>
                            <p className="trust-card-description">
                                Premium calculations based on comprehensive insurance industry data
                                including age, BMI, lifestyle factors, and regional variations.
                            </p>
                        </div>

                        <div className="trust-card">
                            <div className="trust-icon">
                                <Award className="icon" />
                            </div>
                            <h3 className="trust-card-title">Instant Results</h3>
                            <p className="trust-card-description">
                                Get your premium estimate in seconds. No waiting, no complicated forms.
                                Simple, fast, and accurate predictions.
                            </p>
                        </div>

                        <div className="trust-card">
                            <div className="trust-icon">
                                <Shield className="icon" />
                            </div>
                            <h3 className="trust-card-title">Secure & Private</h3>
                            <p className="trust-card-description">
                                Your personal information is protected with industry-standard security.
                                We never share your data with third parties.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="trust-container">
                    <h2 className="trust-title">How It Works</h2>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Create Account</h3>
                            <p>Sign up with your email in just a few seconds</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Enter Health Data</h3>
                            <p>Provide basic information: age, BMI, lifestyle habits</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Get Estimate</h3>
                            <p>Receive your personalized premium estimate instantly</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">4</div>
                            <h3>Track & Compare</h3>
                            <p>View your history and make informed insurance decisions</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of users making smarter insurance decisions</p>
                    <button className="cta-button" onClick={handleGetPrediction}>
                        {isLoggedIn ? 'Calculate Your Premium' : 'Sign Up Now'}
                        <ArrowRight className="btn-icon" />
                    </button>
                </div>
            </section>
        </>
    );
}

export default Home;